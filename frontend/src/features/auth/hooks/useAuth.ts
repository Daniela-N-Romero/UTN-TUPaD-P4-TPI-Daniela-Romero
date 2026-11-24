import { useCallback } from "react";
import { useAuthStore } from "@store/authStore";
import type { Role } from "../types/auth.types";

export function useAuth() {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const error = useAuthStore((state) => state.error);

  const loginAction = useAuthStore((state) => state.login);
  const logoutAction = useAuthStore((state) => state.logout);
  const registerAction = useAuthStore((state) => state.register);
  const checkSessionAction = useAuthStore((state) => state.checkSession);
  const hasRoleAction = useAuthStore((state) => state.hasRole);
  const setErrorAction = useAuthStore((state) => state.setError);
  const clearSessionAction = useAuthStore((state) => state.clearSession);

  const hasRole = useCallback(
    (...roles: Role[]) => hasRoleAction(...roles),
    [hasRoleAction],
  );

  const isAdmin = hasRole("admin");
  const isAuthenticated = usuario !== null;

  return {
    // Lectura del store
    usuario,
    cargando,
    error,
    isAuthenticated,
    isAdmin,
    hasRole,
    login: loginAction,
    logout: logoutAction,
    register: registerAction,
    checkSession: checkSessionAction,
    setError: setErrorAction,
    clearSession: clearSessionAction,
  };
}