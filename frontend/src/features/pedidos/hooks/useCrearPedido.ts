import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { crearPedido } from "../api/pedidos";
import type { PedidoCreate } from "../types/pedidos.types";
import { PEDIDOS_QUERY_KEY } from "./usePedidos";

export function useCrearPedido() {
  const queryClient = useQueryClient();
  const vaciarCarrito = useCartStore((s) => s.vaciar);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const mutation = useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),
    onSuccess: async () => {
      vaciarCarrito();
      await queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Pedido confirmado correctamente");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error ? err.message : "No se pudo crear el pedido",
      );
    },
  });

  return {
    crearPedido: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}