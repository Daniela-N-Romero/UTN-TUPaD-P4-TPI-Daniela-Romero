import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { Modal } from "@shared/components/Modal";
import type { Categoria } from "@/features/categorias";
import type { Producto, ProductoCreate } from "../types/producto.types";

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoCreate) => Promise<void>;
  productoActual: Producto | null;
  categorias: Categoria[];
  error: string | null;
}

export function ProductoModal({
  isOpen,
  onClose,
  onSubmit,
  productoActual,
  categorias,
  error,
}: ProductoModalProps) {
 
 const categoriaActualId = productoActual?.categoria_id;
  const tieneCategoriaInactiva =
    productoActual !== null &&                               //hay un producto
    categoriaActualId !== undefined &&                       //tiene una categoria         
    !categorias.some((cat) => cat.id === categoriaActualId); //esa categoria no esta en el listado de las activas

  const nombreCategoriaInactiva =
    productoActual?.categoria?.nombre ?? "Categoría actual";
    
  // Si el producto editado tiene una categoría dada de baja, la antepone marcada como inactiva
  const opcionesCategoria = tieneCategoriaInactiva
    ? [
        {
          id: categoriaActualId,
          nombre: `${nombreCategoriaInactiva} (inactiva)`,
          activo: false,
        },
        ...categorias.map((cat) => ({
          id: cat.id,
          nombre: cat.nombre,
          activo: true,
        })),
      ]
    : categorias.map((cat) => ({
        id: cat.id,
        nombre: cat.nombre,
        activo: true,
      }));


  const form = useForm({
    defaultValues: {
      categoria_id: productoActual?.categoria_id ?? 0,
      nombre: productoActual?.nombre ?? "",
      descripcion: productoActual?.descripcion ?? "",
      precio_base: productoActual?.precio_base ?? 0,
      imagen_url: productoActual?.imagen_url ?? "",
      stock: productoActual?.stock ?? 0,
      disponible: productoActual?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        categoria_id: Number(value.categoria_id),
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim(),
        stock: Math.max(0, Math.floor(Number(value.stock))),
        disponible: Boolean(value.disponible),
      });
    },
  });

  //detecta si productoActual tiene datos (modo edición) o es null (modo creación) y resetea los valores del formulario
  // y resetea los valores del formulario cuando cambian los datos o se abre el modal
  useEffect(() => {
    form.reset({
      categoria_id: productoActual?.categoria_id ?? 0,
      nombre: productoActual?.nombre ?? "",
      descripcion: productoActual?.descripcion ?? "",
      precio_base: productoActual?.precio_base ?? 0,
      imagen_url: productoActual?.imagen_url ?? "",
      stock: productoActual?.stock ?? 0,
      disponible: productoActual?.disponible ?? true,
    });
  }, [productoActual, categorias, isOpen, form]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productoActual ? "Editar Producto" : "Nuevo Producto"}
      error={error}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
        noValidate
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              !value.trim() ? "El nombre es obligatorio" : undefined,
          }}
        >
          {(field) => (
            <Input
              id="prod-nombre"
              name={field.name}
              label="Nombre"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej. Hamburguesa Completa"
              error={
                field.state.meta.errors.length > 0
                  ? String(field.state.meta.errors[0])
                  : null
              }
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              Number(value) <= 0 ? "Seleccioná una categoría" : undefined, //impide guardar con una categoría inexistente
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor="prod-categoria"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Categoría
              </label>
              {(() => {
                  const valorActual = Number(field.state.value);
                  const esPlaceholder = valorActual <= 0; // Es true cuando está en la opción por defecto ("Seleccioná una categoría...")
                  const esInactivaSeleccionada =
                    tieneCategoriaInactiva && valorActual === categoriaActualId; // Es true solo en edición si sigue seleccionada la categoría dada de baja del producto

                  const estadoClase = esInactivaSeleccionada
                    ? "text-red-400 dark:text-red-400"
                    : esPlaceholder
                      ? "text-gray-400 dark:text-gray-500"
                      : "";

                  return (
                    <select
                      id="prod-categoria"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className={`input-field ${estadoClase}`}
                    >
                      <option value={0} disabled={productoActual !== null} className="text-gray-400">
                        Seleccioná una categoría...
                      </option>
                      {opcionesCategoria.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                          className={
                            cat.activo === false
                              ? "text-red-400 dark:text-red-400"
                              : "text-gray-900 dark:text-gray-100"
                          }
                        >
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-400">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label
                htmlFor="prod-descripcion"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descripción
              </label>
              <textarea
                id="prod-descripcion"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input-field"
                placeholder="Detalle del producto..."
                rows={2}
              />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 ? "No puede ser negativo" : undefined,
            }}
          >
            {(field) => (
              <Input
                id="prod-precio"
                name={field.name}
                label="Precio Base ($)"
                type="number"
                step="0.01"
                min={0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(parseFloat(e.target.value) || 0)
                }
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : null
                }
              />
            )}
          </form.Field>

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 ? "No puede ser negativo" : undefined,
            }}
          >
            {(field) => (
              <Input
                id="prod-stock"
                name={field.name}
                label="Stock"
                type="number"
                step="1"
                min={0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(parseInt(e.target.value, 10) || 0)
                }
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : null
                }
              />
            )}
          </form.Field>
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id="prod-imagen-url"
              name={field.name}
              label="URL de imagen"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://..."
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="prod-disponible"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="prod-disponible"
                className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Disponible para la venta
              </label>
            </div>
          )}
        </form.Field>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}