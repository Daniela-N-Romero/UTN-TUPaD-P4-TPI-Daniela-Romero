import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { cambiarEstadoPedido } from "../api/pedidos";
import type { CambioEstadoPedido } from "../types/pedidos.types";
import { PEDIDOS_QUERY_KEY } from "./usePedidos";

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const mutation = useMutation({
    mutationFn: ({
      pedidoId,
      payload,
    }: {
      pedidoId: number;
      payload: CambioEstadoPedido;
    }) => cambiarEstadoPedido(pedidoId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Estado del pedido actualizado");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado del pedido",
      );
    },
  });

  return {
    cambiarEstado: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}