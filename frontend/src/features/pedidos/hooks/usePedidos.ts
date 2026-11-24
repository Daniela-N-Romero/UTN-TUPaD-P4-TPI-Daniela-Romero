import { useQuery } from "@tanstack/react-query";
import {
  listarPedidos,
  obtenerPedidoPorId,
  type ListarPedidosParams,
} from "../api/pedidos";
import { useAuthStore } from "@/store/authStore";

export const PEDIDOS_QUERY_KEY = ["pedidos"] as const;

export function usePedidos(params: ListarPedidosParams = {}) {
  // Obtenemos el ID del usuario activo para aislar la caché de TanStack Query por cuenta:
  // así, al cambiar de sesión (por ejemplo, de admin a un usuario común o viceversa),
  // no se reutilizan ni mezclan listados de pedidos de la sesión anterior
  const usuarioId = useAuthStore((s) => s.usuario?.id);

  const query = useQuery({
    queryKey: [...PEDIDOS_QUERY_KEY, "lista", usuarioId ?? "anon", params],
    queryFn: () => listarPedidos(params),
    // Solo consultamos pedidos cuando hay un usuario autenticado con ID definido
    enabled: usuarioId !== undefined,
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function usePedidoDetalle(pedidoId: number | null) {
  // También incluimos usuarioId en la queryKey para mantener aislado el detalle por usuario.
  const usuarioId = useAuthStore((s) => s.usuario?.id);

  const query = useQuery({
    queryKey: [...PEDIDOS_QUERY_KEY, "detalle", usuarioId ?? "anon", pedidoId],
    queryFn: () => obtenerPedidoPorId(pedidoId!),
    enabled: usuarioId !== undefined && pedidoId !== null,
  });

  return {
    pedido: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}