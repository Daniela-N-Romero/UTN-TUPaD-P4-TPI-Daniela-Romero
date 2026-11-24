import { api } from "@/shared/api/axiosInstance";
import type {
  CambioEstadoPedido,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedidos.types";

const BASE = "/api/v1/pedidos";

export interface ListarPedidosParams {
  skip?: number;
  limit?: number;
  estado?: string;
}

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>(`${BASE}/`, payload);
  return data;
}

export async function listarPedidos(
  params: ListarPedidosParams = {},
): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>(`${BASE}/`, { params });
  return data;
}

export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>(`${BASE}/resumen`);
  return data;
}

export async function obtenerPedidoPorId(pedidoId: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`${BASE}/${pedidoId}`);
  return data;
}

export async function cambiarEstadoPedido(
  pedidoId: number,
  payload: CambioEstadoPedido,
): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(
    `${BASE}/${pedidoId}/estado`,
    payload,
  );
  return data;
}

export async function cancelarPedido(pedidoId: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`${BASE}/${pedidoId}/cancelar`);
  return data;
}