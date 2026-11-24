import { api } from "@/shared/api/axiosInstance";
import type { Categoria, CategoriaCreate, CategoriaUpdate } from "../types/categoria.types";

const BASE = "/api/v1/categorias";

// Obtener todas las categorías (GET)
export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>(`${BASE}/`);
  return data;
}

export async function getCategoriaById(id: number): Promise<Categoria> {
  const { data } = await api.get<Categoria>(`${BASE}/${id}`);
  return data;
}

export async function createCategoria(categoria: CategoriaCreate): Promise<Categoria> {
  const { data } = await api.post<Categoria>(`${BASE}/`, categoria);
  return data;
}

export async function updateCategoria(
  id: number,
  categoria: CategoriaUpdate,
): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`${BASE}/${id}`, categoria);
  return data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}