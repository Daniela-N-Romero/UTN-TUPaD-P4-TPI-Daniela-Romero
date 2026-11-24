import { useQuery } from "@tanstack/react-query";
import { obtenerResumenPedidos } from "../api/pedidos";
import { PEDIDOS_QUERY_KEY } from "./usePedidos";

export function useResumenPedidos() {
  const query = useQuery({
    queryKey: [...PEDIDOS_QUERY_KEY, "resumen"],
    queryFn: obtenerResumenPedidos,
  });

  return {
    resumen: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}