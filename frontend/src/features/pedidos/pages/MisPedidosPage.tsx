import { useEffect, useState } from "react";
import { BadgeEstado } from "@shared/components/BadgeEstado";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";
import { EstadoVacio, EstadoError, Skeleton } from "@/shared";
import { Modal } from "@shared/components/Modal";
import { Paginacion } from "@shared/components/Paginacion";
import { useCancelarPedido } from "../hooks/useCancelarPedido";
import { usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types/pedidos.types";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const PAGE_SIZE = 10;
const FETCH_LIMIT = 100;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(1);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null,
  );
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const usuario = useAuthStore((s) => s.usuario);

  const { items, isLoading, isError, error } = usePedidos({
    skip: 0,
    limit: FETCH_LIMIT,
  });

  // Filtramos estrictamente los pedidos del usuario autenticado
  const pedidosPropios =
    usuario?.id !== undefined
      ? items.filter((pedido) => pedido.usuario_id === usuario.id)
      : [];

  const totalPropios = pedidosPropios.length;
  const totalPaginas = Math.max(1, Math.ceil(totalPropios / PAGE_SIZE));

  // Si cambia la cantidad de pedidos propios (por ejemplo al cancelar o cambiar de usuario)
  // y la página actual queda fuera de rango, volvemos a la página 1.
  useEffect(() => {
    if (pagina > totalPaginas) {
      setPagina(1);
    }
  }, [pagina, totalPaginas]);

  const inicio = (pagina - 1) * PAGE_SIZE;
  const pedidosPaginados = pedidosPropios.slice(inicio, inicio + PAGE_SIZE);

  const { cancelarPedido } = useCancelarPedido();

  const handleCancelar = async (pedidoId: number) => {
    setCancelandoId(pedidoId);
    try {
      const actualizado = await cancelarPedido(pedidoId);
      if (pedidoSeleccionado?.id === pedidoId) {
        setPedidoSeleccionado(actualizado);
      }
    } finally {
      setCancelandoId(null);
    }
  };
  
if (isLoading) {
  return (
    <div className="page-container">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
  if (isError) return <EstadoError error={error} />;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Mis pedidos</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Consultá el estado y el detalle de tus pedidos realizados.
        </p>       
      </div>

      {items.length === 0 ? (
        <>
        <Card className="p-8 text-center">
          <EstadoVacio mensaje="Todavía no realizaste ningún pedido." />
          <div className="mt-4">
            <Link to="/">
              <Button variant="primary">Hacer un pedido</Button>
            </Link>
          </div>
        </Card>
        </>


      ) : (
        <>
          <div className="space-y-4">
            {pedidosPaginados.map((pedido) => {
              const puedeCancelar = pedido.estado === "PENDIENTE";
              const estaCancelando = cancelandoId === pedido.id;
              return (
                <Card key={pedido.id} className="p-4">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          Pedido #{pedido.id}
                        </span>
                        <BadgeEstado estado={pedido.estado} />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Entrega: {pedido.direccion_entrega} · Pago:{" "}
                        {pedido.forma_pago}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Fecha:{" "}
                        {new Date(pedido.created_at).toLocaleString("es-AR")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                        ${pedido.total.toFixed(2)}
                      </span>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        Ver detalle
                      </Button>

                      {puedeCancelar && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={estaCancelando}
                          onClick={() => void handleCancelar(pedido.id)}
                        >
                          {estaCancelando ? "Cancelando..." : "Cancelar"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6">
            <Paginacion
              page={pagina}
              pageSize={PAGE_SIZE}
              total={totalPropios}
              onPageChange={setPagina}
            />
          </div>
        </>
      )}

      <Modal
        isOpen={pedidoSeleccionado !== null}
        onClose={() => setPedidoSeleccionado(null)}
        title={
          pedidoSeleccionado
            ? `Detalle del pedido #${pedidoSeleccionado.id}`
            : "Detalle del pedido"
        }
      >
        {pedidoSeleccionado && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Estado:</span>
              <BadgeEstado estado={pedidoSeleccionado.estado} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Forma de pago:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {pedidoSeleccionado.forma_pago}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Dirección de entrega:
              </span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {pedidoSeleccionado.direccion_entrega}
              </p>
            </div>
            {pedidoSeleccionado.notas && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Notas:</span>
                <p className="text-gray-800 dark:text-gray-200">
                  {pedidoSeleccionado.notas}
                </p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
              <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Productos
              </p>
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {pedidoSeleccionado.items.map((item) => (
                  <li
                    key={item.producto_id}
                    className="flex justify-between py-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {item.nombre_producto}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.cantidad} × ${item.precio_unitario.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
              <span>Total</span>
              <span>${pedidoSeleccionado.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}