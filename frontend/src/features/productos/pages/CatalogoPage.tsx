import { useEffect, useState } from "react";
import { Button } from "@shared/components/Button";
import { EstadoVacio, EstadoError } from "@/shared";
import { Input } from "@shared/components/Input";
import { Paginacion } from "@shared/components/Paginacion";
import { Skeleton } from "@shared/components/Skeleton";
import { useCategoriasList } from "@/features/categorias";
import { ProductoCard } from "../components/ProductoCard";
import { useProductosCatalogo } from "../hooks/useProductos";

const PAGE_SIZE = 8; // Cantidad de productos por página en el catálogo 

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(1);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [search, setSearch] = useState("");
  // Filtro opcional por ID de categoría (undefined = todas las categorías)
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  // Debounce para búsqueda en servidor
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(busquedaInput.trim());
      setPagina(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [busquedaInput]);


  // Carga las categorías para poblar el selector de filtro del catálogo
  const { data: categorias = [], isLoading: isLoadingCategorias } = useCategoriasList();

  const skip = (pagina - 1) * PAGE_SIZE;

  // Consulta paginada de productos filtrada en el servidor
  const { items, total, isLoading, isFetching, isError, error } = useProductosCatalogo({
    skip,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoria_id: categoriaId,
  });

  // Al cambiar de categoría, reinicia a la primera página para evitar quedar fuera de rango
  const handleCategoriaChange = (value: string) => {
    setCategoriaId(value ? Number(value) : undefined);
    setPagina(1);
  };

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Catálogo</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Explorá nuestros productos disponibles y agregalos a tu carrito.
          </p>
        </div>
        {(isFetching || isLoadingCategorias) && !isLoading && (
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600 dark:bg-indigo-400" />
            Actualizando catálogo...
          </span>
        )}
      </div>

      {/* Filtros: búsqueda y categoría */}
      <div className="card-surface mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input
            id="catalogo-buscar"
            label="Buscar producto"
            type="search"
            placeholder="Ej. Hamburguesa, Empanada..."
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="catalogo-categoria"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Categoría
          </label>
          <select
            id="catalogo-categoria"
            value={categoriaId ?? ""}
            onChange={(e) => handleCategoriaChange(e.target.value)}
            className="input-field"
            disabled={isLoadingCategorias}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estados de carga, error, vacío y grilla */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
            <div key={idx} className="card-surface space-y-3 p-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EstadoError error={error} />
      ) : items.length === 0 ? (
        <EstadoVacio mensaje="No se encontraron productos con esos filtros." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <div className="mt-6">
            <Paginacion
              page={pagina}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={(newPage) => setPagina(newPage)}
            />
          </div>
        </>
      )}

      {(search || categoriaId !== undefined) && (
        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setBusquedaInput("");
              setSearch("");
              setCategoriaId(undefined);
              setPagina(1);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}