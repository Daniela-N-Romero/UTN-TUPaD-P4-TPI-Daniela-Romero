import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setSessionExpiredHandler } from "@shared/api/axiosInstance";
import * as authService from "@features/auth/api/auth.service";
import type {
  Role,
  UserPublic,
  UserRegisterPayload,
} from "@features/auth/types/auth.types";
import { queryClient } from "@/shared/api/queryClient";
import { useCartStore } from "./cartStore";

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (payload: UserRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
  clearSession: () => void;
  setError: (msg: string | null) => void;
}

// Usamos create de Zustand con middleware `persist` y `partialize` para conservar datos
// no sensibles del usuario entre recargas, mientras el token JWT viaja en
// una cookie HttpOnly gestionada por el navegador y el backend

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
	  // Arranca con "cargando: true" para que rutas protegidas/layouts esperen
      // la validación inicial de sesión antes de decidir si redirigen
      usuario: null,
      cargando: true,
      error: null,

	  // Actualiza o limpia el mensaje de error visible en formularios/vistas de auth.
      setError: (msg) => set({ error: msg }),

	  // Limpia el estado en memoria y borra el storage persistido de auth.
      // Se usa al cerrar sesión, al expirar la cookie (401) o si la cuenta está desactivada (400)
      clearSession: () => {
        set({
          usuario: null,
          cargando: false,
          error: null,
        });
        void useAuthStore.persist.clearStorage();
        // Limpiamos la caché de pedidos para evitar que queden datos residuales de la sesión anterior.
        void queryClient.removeQueries({ queryKey: ["pedidos"] });
      },

	  // Consulta /auth/me para comprobar con el backend si la cookie HttpOnly sigue vigente.
      // Si es válida, sincroniza usuario; si falla o no hay sesión, deja usuario: null
      checkSession: async () => {
        set({ cargando: true, error: null });
        try {
          const me = await authService.requestMe();
          set({ usuario: me, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

	  // Valida si el usuario autenticado posee alguno de los roles indicados
      // Usa usuario.role ("user" | "admin") según el modelo del backend
      hasRole: (...roles) => {
        const currentRole = get().usuario?.role;
        if (!currentRole) return false;
        return roles.includes(currentRole);
      },

	  // Inicia sesión enviando credenciales (username y password), luego consulta /auth/me
      // para obtener el perfil completo y guardar usuario en estado y storage persistido
      login: async (username, password) => {
        set({ cargando: true, error: null });
        try {
          await authService.requestLogin(username, password);
          const me = await authService.requestMe();
          set({
            usuario: me,
            cargando: false,
            error: null,
          });
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Error de inicio de sesión";
          set({
            usuario: null,
            cargando: false,
            error: msg,
          });
          void useAuthStore.persist.clearStorage();
          throw e;
        }
      },

	  // Registra un nuevo usuario en el backend y, si sale bien, inicia sesión automáticamente
      // para dejar la cookie HttpOnly y el estado de usuario listos.
      register: async (payload) => {
        set({ cargando: true, error: null });
        try {
          await authService.requestRegister(payload);
          set({ cargando: false });
          await get().login(payload.username, payload.password);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Error al registrarse";
          set({ cargando: false, error: msg });
          throw e;
        }
      },

	  // Notifica al backend para borrar la cookie HttpOnly y siempre limpia el estado local,
      // incluso si ocurre un error de red
      logout: async () => {
        try {
          await authService.requestLogout();
        } catch {
          // Limpia el estado local aunque falle la petición de logout.
        }
        // Vaciamos el carrito al cerrar sesión para evitar arrastrar ítems de una cuenta o visitante
        // hacia el próximo usuario que inicie sesión en este navegador
        useCartStore.getState().vaciar();
        get().clearSession();
      },
    }),
    {
      name: "foodstore-auth-storage",
	  // Solo persistimos usuario (de tipo UsuarioPublic: datos no sensibles), nunca tokens ni estados transitorios.
      partialize: (state) => ({ usuario: state.usuario }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.cargando = false;
        }
      },
    },
  ),
);

// Conecta el interceptor global de Axios con clearSession para cerrar sesión automáticamente
// cuando el backend responda 401 (fuera de login/me) o 400 ("Cuenta de usuario desactivada")(*).
setSessionExpiredHandler(() => {
  useAuthStore.getState().clearSession();
});

// (*) ¿Por qué se conecta a setSessionExpiredHandler desde authStore.ts y no se importa authStore.ts adentro de axiosInstance.ts? 
// Porque authStore llama a authService, y authService llama a api (axiosInstance.ts). 
// Si axiosInstance.ts también importara authStore.ts, quedarían mirando uno al otro en círculo (dependencia circular).
// Cuando se carga authStore.ts: se llama a setSessionExpiredHandler(fn). Esa función entra en axiosInstance.ts 
// y reemplaza lo que hay adentro de onSessionExpired que estaba en axiosInstance.ts (pasa de null a ser la función con useAuthStore.getState().clearSession()).