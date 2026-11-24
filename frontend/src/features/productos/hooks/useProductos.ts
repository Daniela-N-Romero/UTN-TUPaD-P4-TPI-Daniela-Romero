import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateProductoStock,
  type ListarProductosParams,
} from "../api/producto.service";
import type {
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";

/**
 * Como Productos tiene requerimientos más complejos que categorias (paginación en servidor para el catálogo público, 
 * listado amplio para administración y actualización parcial de stock), no usamos el useCrud.ts, sino que creamos hooks específicos.
*/


// Clave base compartida para que cualquier mutación pueda invalidar
// tanto las consultas del catálogo como las del panel de administración
export const PRODUCTOS_QUERY_KEY = ["productos"] as const;


/**
 * Hook para el catálogo público (`/`):
 * consulta productos paginados en el servidor según búsqueda, categoría,
 * `skip` y `limit`.
 */
export function useProductosCatalogo(params: ListarProductosParams) {
  const query = useQuery({
    queryKey: [...PRODUCTOS_QUERY_KEY, "catalogo", params], //cada combinación de página, búsqueda y categoría tiene su propia entrada en caché
    queryFn: () => getProductos(params),
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}


/**
 * Hook para la administración de productos (`/admin/productos`):
 * trae hasta 100 productos para paginar en el cliente con TanStack Table
 * y expone las mutaciones de creación, edición, stock/disponibilidad y baja.
 */
export function useAdminProductos() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const query = useQuery({
    queryKey: [...PRODUCTOS_QUERY_KEY, "admin", { skip: 0, limit: 100 }],
    queryFn: () => getProductos({ skip: 0, limit: 100 }),
  });

  // Refresca todas las queries que empiecen con ["productos"] despues de una mutación exitosa
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (payload: ProductoCreate) => createProducto(payload),
    onSuccess: async () => {
      await invalidateAll();
      showNotification("Producto creado correctamente");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error ? err.message : "Error al crear producto",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      updateProducto(id, data),
    onSuccess: async () => {
      await invalidateAll();
      showNotification("Producto actualizado correctamente");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error ? err.message : "Error al actualizar producto",
      );
    },
  });

  // Actualiza únicamente stock y disponibilidad (`PATCH /api/v1/productos/{id}/stock`)
  const stockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) =>
      updateProductoStock(id, data),
    onSuccess: async () => {
      await invalidateAll();
      showNotification("Stock y disponibilidad actualizados");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error
          ? err.message
          : "Error al actualizar stock/disponibilidad",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: async () => {
      await invalidateAll();
      showNotification("Producto eliminado correctamente");
    },
    onError: (err: unknown) => {
      showNotification(
        err instanceof Error ? err.message : "Error al eliminar producto",
      );
    },
  });

  return {
    productos: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createProducto: createMutation.mutateAsync,
    updateProducto: updateMutation.mutateAsync,
    updateStockProducto: stockMutation.mutateAsync,
    deleteProducto: deleteMutation.mutateAsync,
  };
}