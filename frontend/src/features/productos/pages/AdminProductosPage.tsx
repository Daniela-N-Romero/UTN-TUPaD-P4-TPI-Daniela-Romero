import { useState } from "react";
import { Button } from "@shared/components/Button";
import { EstadoError, EstadoVacio } from "@/shared";
import { Input } from "@shared/components/Input";
import { LoadingState } from "@shared/components/LoadingState";
import { Modal } from "@shared/components/Modal";
import { useCrudModal } from "@shared/hooks/useCrudModal";
import { useCategoriasList } from "@/features/categorias";
import { ProductoList } from "../components/ProductoList";
import { ProductoModal } from "../components/ProductoModal";
import { useAdminProductos } from "../hooks/useProductos";
import type { Producto, ProductoCreate } from "../types/producto.types";

export default function AdminProductosPage() {
  const {
    productos, // Trae hasta 100 productos para paginar en el cliente con TanStack Table
    isLoading,
    isError,
    error: queryError,
    createProducto,
    updateProducto,
    updateStockProducto,
    deleteProducto,
  } = useAdminProductos();

  // Categorías disponibles para el selector del modal de crear/editar producto
  const { data: categorias = [] } = useCategoriasList();

  // Si el usuario crea/modifica un producto, los productos en otras paginas ya 
  // tendrán lso cambios disponibles porque useAdminProductos() con TanStack Query invalidó la clave "productos"
  const {
    isModalOpen,
    selectedItem: productoSeleccionado,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    error,
  } = useCrudModal<Producto, ProductoCreate>({
    createItem: createProducto,
    updateItem: updateProducto,
    deleteItem: deleteProducto,
    entityName: "producto",
  });

  // Estado independiente para el modal rápido de stock y disponibilidad
  const [stockTarget, setStockTarget] = useState<Producto | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);
  const [disponibleValue, setDisponibleValue] = useState<boolean>(true);
  const [stockError, setStockError] = useState<string | null>(null);
  const [savingStock, setSavingStock] = useState<boolean>(false);

  const abrirModalStock = (producto: Producto) => {
    setStockTarget(producto);
    setStockValue(producto.stock);
    setDisponibleValue(producto.disponible);
    setStockError(null);
  };

  // Envía únicamente `stock` y `disponible` mediante `updateStockProducto`
  const guardarStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTarget) return;
    if (stockValue < 0) {
      setStockError("El stock no puede ser negativo.");
      return;
    }
    setSavingStock(true);
    setStockError(null);
    try {
      await updateStockProducto({
        id: stockTarget.id,
        data: {
          stock: Math.floor(stockValue),
          disponible: disponibleValue,
        },
      });
      setStockTarget(null);
    } catch (err) {
      setStockError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el stock/disponibilidad.",
      );
    } finally {
      setSavingStock(false);
    }
  };

  if (isLoading) return <LoadingState mensaje="Cargando productos..." />;
  if (isError) return <EstadoError error={queryError} />;

  return (
    <div className="page-container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="page-title">Gestión de Productos</h1>
        <Button variant="primary" onClick={openCreateModal}>
          + Añadir Producto
        </Button>
      </div>

      {productos.length === 0 ? (
        <EstadoVacio mensaje="No hay productos registrados." />
      ) : (
        <ProductoList
          productos={productos}
          onEdit={openEditModal}
          onChangeStock={abrirModalStock}
          onDelete={handleDelete}
        />
      )}

      <ProductoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        productoActual={productoSeleccionado}
        categorias={categorias}
        error={error}
      />

      <Modal
        isOpen={stockTarget !== null}
        onClose={() => setStockTarget(null)}
        title={
          stockTarget
            ? `Stock y disponibilidad — ${stockTarget.nombre}`
            : "Stock y disponibilidad"
        }
        error={stockError}
      >
        <form onSubmit={(e) => void guardarStock(e)} className="space-y-4">
          <Input
            id="stock-rapido"
            label="Stock"
            type="number"
            min={0}
            step={1}
            value={stockValue}
            onChange={(e) => setStockValue(parseInt(e.target.value, 10) || 0)}
          />

          <div className="flex items-center gap-2">
            <input
              id="disponible-rapido"
              type="checkbox"
              checked={disponibleValue}
              onChange={(e) => setDisponibleValue(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="disponible-rapido"
              className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Disponible para la venta
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStockTarget(null)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={savingStock}>
              {savingStock ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}