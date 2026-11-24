import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { cancelarPedido } from "../api/pedidos";
import { PEDIDOS_QUERY_KEY } from "./usePedidos";

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const mutation = useMutation({
    mutationFn: (pedidoId: number) => cancelarPedido(pedidoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Pedido cancelado correctamente");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error ? err.message : "No se pudo cancelar el pedido",
      );
    },
  });

  return {
    cancelarPedido: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}