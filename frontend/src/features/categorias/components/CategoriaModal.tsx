import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@shared/components/Button";
import { Input } from "@shared/components/Input";
import { Modal } from "@shared/components/Modal";
import type { Categoria, CategoriaCreate } from "../types/categoria.types";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoriaCreate) => Promise<void>;
  categoriaActual: Categoria | null;
  error: string | null;
}

export function CategoriaModal({
  isOpen,
  onClose,
  onSubmit,
  categoriaActual,
  error,
}: CategoriaModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoriaActual?.nombre ?? "",
      descripcion: categoriaActual?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      });
    },
  });

  useEffect(() => {
    form.reset({
      nombre: categoriaActual?.nombre ?? "",
      descripcion: categoriaActual?.descripcion ?? "",
    });
  }, [categoriaActual, isOpen, form]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoriaActual ? "Editar Categoría" : "Nueva Categoría"}
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
            onChange: ({ value }) => {
              const trimmed = value.trim();
              if (!trimmed) return "El nombre es obligatorio";
              if (trimmed.length < 2)
                return "Debe tener al menos 2 caracteres";
              if (trimmed.length > 100)
                return "No puede superar los 100 caracteres";
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              id="categoria-nombre"
              name={field.name}
              label="Nombre"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej. Comidas"
              error={
                field.state.meta.errors.length > 0
                  ? String(field.state.meta.errors[0])
                  : null
              }
            />
          )}
        </form.Field>

        <form.Field 
          name="descripcion"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return "La descripción es obligatoria";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor="categoria-descripcion"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Descripción
              </label>
              <textarea
                id="categoria-descripcion"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input-field"
                placeholder="Ej. Platos principales y minutas"
                rows={3}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="mt-1 text-xs text-red-400">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
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