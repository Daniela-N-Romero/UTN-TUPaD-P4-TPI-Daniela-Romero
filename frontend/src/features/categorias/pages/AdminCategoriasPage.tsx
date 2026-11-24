import { Button } from "@shared/components/Button";
import { EstadoError, EstadoVacio } from "@/shared";
import { LoadingState } from "@shared/components/LoadingState";
import { useCrudModal } from "@shared/hooks/useCrudModal";
import { CategoriaList } from "../components/CategoriaList";
import { CategoriaModal } from "../components/CategoriaModal";
import { useCategorias } from "../hooks/useCategorias";
import type { Categoria, CategoriaCreate } from "../types/categoria.types";

export default function AdminCategoriasPage() {
  
  // Si el usuario crea/modifica una categoría, el selector de categorias o el pmodal de productos en otras paginas ya 
  // tendrá la categoría nueva lista porque useCategorias->useCrud con TanStack Query invalidó la clave "categorias"
  const {
    categorias,
    isLoading,
    isError,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  } = useCategorias();
  

  const {
    isModalOpen,
    selectedItem: categoriaSeleccionada,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    error,
  } = useCrudModal<Categoria, CategoriaCreate>({
    createItem: createCategoria,
    updateItem: updateCategoria,
    deleteItem: deleteCategoria,
    entityName: "categoría",
  });

  if (isLoading) return <LoadingState mensaje="Cargando categorías..." />;
  if (isError) return <EstadoError error="Error al cargar las categorías." />;

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Gestión de Categorías</h1>
        <Button variant="primary" onClick={openCreateModal}>
          + Añadir Categoría
        </Button>
      </div>

      {categorias.length === 0 ? (
        <EstadoVacio mensaje="No hay categorías registradas." />
      ) : (
        <CategoriaList
          categorias={categorias}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}
      

      <CategoriaModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSave}
        categoriaActual={categoriaSeleccionada}
        error={error}
      />
    </div>
  );
}