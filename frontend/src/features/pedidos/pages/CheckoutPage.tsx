import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { EstadoVacio } from "@/shared";
import { Input } from "@shared/components/Input";
import { useCartStore } from "@/store/cartStore";
import { useCrearPedido } from "../hooks/useCrearPedido";
import type { FormaPago } from "../types/pedidos.types";
import { ResumenCarritoItems } from "../components/ResumenCarritoItems";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const { crearPedido, isPending } = useCrearPedido();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      try {
        await crearPedido({
          items: items.map((item) => ({
            producto_id: item.producto.id,
            cantidad: item.cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || undefined,
        });
        navigate("/mis-pedidos", { replace: true });
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "No se pudo confirmar el pedido.",
        );
      }
    },
  });

  if (items.length === 0) {
    return (
      <div className="page-container">
        <Card className="p-8 text-center">
          <EstadoVacio mensaje="No tenés productos en el carrito para confirmar un pedido." />
          <div className="mt-4">
            <Link to="/">
              <Button variant="primary">Volver al catálogo</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Confirmar pedido</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Completá los datos de entrega y forma de pago para enviar tu pedido.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Datos de entrega" className="lg:col-span-2 p-5">
          {submitError && (
            <div role="alert" className="error-box mb-4 mt-0 px-3 py-2 text-left">
              {submitError}
            </div>
          )}

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
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim();
                  if (!trimmed) return "La dirección de entrega es obligatoria";
                  if (trimmed.length < 5)
                    return "Ingresá al menos 5 caracteres";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <Input
                  id="checkout-direccion"
                  name={field.name}
                  label="Dirección de entrega"
                  type="text"
                  placeholder="Ej. Av. Mitre 1234, piso 2"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={
                    field.state.meta.errors.length > 0
                      ? String(field.state.meta.errors[0])
                      : null
                  }
                />
              )}
            </form.Field>

            <form.Field name="forma_pago">
              {(field) => (
                <div>
                  <label
                    htmlFor="checkout-forma-pago"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Forma de pago
                  </label>
                  <select
                    id="checkout-forma-pago"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as FormaPago)
                    }
                    className="input-field"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div>
                  <label
                    htmlFor="checkout-notas"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Notas{" "}
                    <span className="text-xs text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    id="checkout-notas"
                    name={field.name}
                    rows={3}
                    placeholder="Indicaciones adicionales para la entrega..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}
            </form.Field>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
              <Link to="/carrito">
                <Button type="button" variant="secondary">
                  Volver al carrito
                </Button>
              </Link>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!canSubmit || isSubmitting || isPending}
                  >
                    {isSubmitting || isPending
                      ? "Confirmando..."
                      : "Confirmar pedido"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </Card>

        <Card className="h-fit p-5" title="Resumen del carrito">   
          <ResumenCarritoItems
            items={items}
            total={total}
          />
        </Card>
      </div>
    </div>
  );
}