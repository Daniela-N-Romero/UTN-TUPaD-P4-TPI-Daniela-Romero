import { api } from "@/shared/api/axiosInstance";
import type { Producto, ProductoCreate, ProductosPaginados, ProductoStockUpdate, ProductoUpdate } from "../types/producto.types";

const BASE = "/api/v1/productos";

export interface ListarProductosParams {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

export async function getProductos(
  params: ListarProductosParams = {},
): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>(`${BASE}/`, { params });
  return data;
}

export async function getProductoById(productoId: number): Promise<Producto> {
  const { data } = await api.get<Producto>(`${BASE}/${productoId}`);
  return data;
}

export async function createProducto(
  producto: ProductoCreate,
): Promise<Producto> {
  const { data } = await api.post<Producto>(`${BASE}/`, producto);
  return data;
}

export async function updateProducto(
  productoId: number,
  producto: ProductoUpdate,
): Promise<Producto> {
  const { data } = await api.put<Producto>(`${BASE}/${productoId}`, producto);
  return data;
}

export async function updateProductoStock(
  productoId: number,
  stockData: ProductoStockUpdate,
): Promise<Producto> {
  const { data } = await api.patch<Producto>(
    `${BASE}/${productoId}/stock`,
    stockData,
  );
  return data;
}

export async function deleteProducto(productoId: number): Promise<void> {
  await api.delete(`${BASE}/${productoId}`);
}