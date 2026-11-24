import { Card } from "@shared/components/Card";
import { EstadoError, Skeleton } from "@/shared";
import { useResumenPedidos } from "../hooks/useResumenPedidos";

export default function AdminResumenPage() {
  const { resumen, isLoading, isError, error } = useResumenPedidos();

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="space-y-3 p-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-3 w-44" />
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if (isError || !resumen) return <EstadoError error={error} />;

  const tarjetas = [
    {
      titulo: "Pendientes",
      valor: resumen.pendientes,
      descripcion: "Pedidos esperando preparación",
    },
    {
      titulo: "En preparación",
      valor: resumen.en_preparacion,
      descripcion: "Pedidos actualmente en cocina/armado",
    },
    {
      titulo: "Entregados",
      valor: resumen.entregados,
      descripcion: "Pedidos completados",
    },
    {
      titulo: "Cancelados",
      valor: resumen.cancelados,
      descripcion: "Pedidos anulados",
    },
    {
      titulo: "Pedidos hoy",
      valor: resumen.pedidos_hoy,
      descripcion: "Total registrados en la jornada",
    },
    {
      titulo: "Ingresos entregados",
      valor: `$${resumen.ingresos_entregados.toFixed(2)}`,
      descripcion: "Facturación de pedidos entregados",
    },
  ];

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Resumen de Pedidos</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Indicadores generales del estado operativo y ventas del comercio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((card) => (
          <Card key={card.titulo} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {card.titulo}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
              {card.valor}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {card.descripcion}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}