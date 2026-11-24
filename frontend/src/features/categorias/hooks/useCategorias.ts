import { useCrud } from "@shared/hooks/useCrud";
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from "../api/categoria.service";
import type { Categoria, CategoriaCreate, CategoriaUpdate } from "../types/categoria.types";
import { useQuery } from "@tanstack/react-query";


export const CATEGORIAS_QUERY_KEY = "categorias";

/** Solo lectura: para selectores y filtros (Catálogo, Modal de Productos) */

export function useCategoriasList() {
  return useQuery<Categoria[]>({
    queryKey: [CATEGORIAS_QUERY_KEY],
    queryFn: getCategorias,
  });
}

/** CRUD completo: para el panel de administración de categorías */

export function useCategorias() {
  const crud = useCrud<Categoria, CategoriaCreate, CategoriaUpdate>(
    "categorias",
    {
      getAll: getCategorias,
      create: (data: CategoriaCreate) => createCategoria(data),
      update: (id: number, data: CategoriaUpdate) => updateCategoria(id, data),
      remove: (id: number) => deleteCategoria(id),
    },
    { entityLabel: "Categoría" },
  );

  
  return {
    categorias: crud.data,
    isLoading: crud.isLoading,
    isError: crud.isError,
    error: crud.error,
    createCategoria: crud.createItem,
    updateCategoria: crud.updateItem,
    deleteCategoria: crud.deleteItem,
  };
}