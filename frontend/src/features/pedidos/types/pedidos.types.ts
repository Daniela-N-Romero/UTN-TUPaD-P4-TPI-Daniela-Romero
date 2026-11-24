export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

// Ítem enviado al crear un pedido desde el carrito (`ItemPedidoCreate`)
export interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

//`PedidoCreate` en FastAPI. El backend valida que 
// items tenga al menos un elemento y sin producto_id repetidos
export interface PedidoCreate {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string;
}

export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

// `PedidoRead` en backend
export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido | string;
  forma_pago: FormaPago | string;
  direccion_entrega: string;
  notas: string;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

export interface CambioEstadoPedido {
  estado: EstadoPedido;
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}