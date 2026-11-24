import { Link, useNavigate } from "react-router-dom";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { EstadoVacio } from "@/shared";
import { useCartStore } from "@/store/cartStore";
import { ResumenCarritoItems } from "../components/ResumenCarritoItems";

export default function CarritoPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Carrito de compras</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Revisá tus productos antes de confirmar el pedido.
          </p>
        </div>

        <Link to="/">
          <Button variant="secondary" size="sm">
            Seguir comprando
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <EstadoVacio mensaje="Tu carrito está vacío." />
          <div className="mt-4">
            <Link to="/">
              <Button variant="primary">Ir al catálogo</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map(({ producto, cantidad }) => {
              const subtotal = producto.precio_base * cantidad;
              const alcanzaStock = cantidad >= producto.stock;

              return (
                <Card key={producto.id} className="p-4">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                        {producto.imagen_url ? (
                          <img
                            src={producto.imagen_url}
                            alt={producto.nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-400">
                            Sin foto
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {producto.nombre}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Unitario: ${producto.precio_base.toFixed(2)} · Stock:{" "}
                          {producto.stock}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            cambiarCantidad(producto.id, cantidad - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {cantidad}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={alcanzaStock}
                          onClick={() =>
                            cambiarCantidad(producto.id, cantidad + 1)
                          }
                        >
                          +
                        </Button>
                      </div>

                      <div className="min-w-24 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                        ${subtotal.toFixed(2)}
                      </div>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => quitar(producto.id)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card title="Resumen del carrito" className="h-fit p-5">
             <ResumenCarritoItems
                      items={items}
                      total={total}
                    />

            <div className="mt-4 flex flex-col gap-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate("/checkout")}
              >
                Continuar al checkout
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={vaciar}
              >
                Vaciar carrito
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}