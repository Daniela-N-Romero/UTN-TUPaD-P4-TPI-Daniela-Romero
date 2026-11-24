import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import {
  activarUsuario,
  desactivarUsuario,
  listAdminUsuarios,
} from "../api/usuarios.service";
import type { UsuarioAdmin } from "../types/usuarios.types";

export const USUARIOS_ADMIN_QUERY_KEY = ["admin", "usuarios"] as const;

// Determina si un usuario está activo según `disabled`
export function isUsuarioActivo(usuario: UsuarioAdmin): boolean {
  return !usuario.disabled;
}

export function useUsuarios() {
  const queryClient = useQueryClient();
  const usuarioActual = useAuthStore((s) => s.usuario);
  const showNotification = useNotificationStore((s) => s.showNotification);

  // listado general de usuarios desde el backend
  const usuariosQuery = useQuery<UsuarioAdmin[]>({
    queryKey: USUARIOS_ADMIN_QUERY_KEY,
    queryFn: listAdminUsuarios,
  });

  // Mutación para activar una cuenta (`POST /api/v1/auth/admin/usuarios/{id}/activar`).
  const activarMutation = useMutation({
    mutationFn: (userId: number) => activarUsuario(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USUARIOS_ADMIN_QUERY_KEY });
      showNotification("Usuario activado correctamente");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error ? err.message : "No se pudo activar el usuario",
      );
    },
  });

  // Mutación para desactivar una cuenta (`POST /api/v1/auth/admin/usuarios/{id}/desactivar`).
  const desactivarMutation = useMutation({
    mutationFn: (userId: number) => desactivarUsuario(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: USUARIOS_ADMIN_QUERY_KEY });
      showNotification("Usuario desactivado correctamente");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error ? err.message : "No se pudo desactivar el usuario",
      );
    },
  });

  const processingId = activarMutation.isPending
    ? (activarMutation.variables ?? null)
    : desactivarMutation.isPending
      ? (desactivarMutation.variables ?? null)
      : null;

  const handleActivar = async (userId: number) => {
    await activarMutation.mutateAsync(userId);
  };

  const handleDesactivar = async (userId: number) => {
    await desactivarMutation.mutateAsync(userId);
  };

  const mutationError =
    (activarMutation.error instanceof Error ? activarMutation.error.message : null) ??
    (desactivarMutation.error instanceof Error
      ? desactivarMutation.error.message
      : null);

  return {
    usuarios: usuariosQuery.data ?? [],
    currentUserId: usuarioActual?.id ?? null,
    isLoading: usuariosQuery.isLoading,
    isError: usuariosQuery.isError,
    error:
      mutationError ??
      (usuariosQuery.error instanceof Error ? usuariosQuery.error.message : null),
    processingId,
    handleActivar,
    handleDesactivar,
  };
}