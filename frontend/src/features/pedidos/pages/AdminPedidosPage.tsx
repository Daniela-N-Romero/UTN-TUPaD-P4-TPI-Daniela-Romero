import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { BadgeEstado } from "@shared/components/BadgeEstado";
import { Button } from "@shared/components/Button";
import { EstadoVacio, EstadoError } from "@/shared";
import { LoadingState } from "@shared/components/LoadingState";
import { Paginacion } from "@shared/components/Paginacion";
import { useCambiarEstadoPedido } from "../hooks/useCambiarEstadoPedido";
import { usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types/pedidos.types";

const PAGE_SIZE = 10;

const ESTADOS_FILTRO: Array<{ label: string; value: EstadoPedido | "" }> = [
  { label: "Todos", value: "" },
  { label: "PENDIENTE", value: "PENDIENTE" },
  { label: "EN_PREPARACION", value: "EN_PREPARACION" },
  { label: "ENTREGADO", value: "ENTREGADO" },
  { label: "CANCELADO", value: "CANCELADO" },
];

function obtenerSiguienteEstado(estado: string): EstadoPedido | null {
  if (estado === "PENDIENTE") return "EN_PREPARACION";
  if (estado === "EN_PREPARACION") return "ENTREGADO";
  return null;
}

function puedeCancelarEstado(estado: string): boolean {
  return estado === "PENDIENTE" || estado === "EN_PREPARACION";
}

export default function AdminPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | "">("");
  const [pagina, setPagina] = useState(1);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const { items, total, isLoading, isError, error } = usePedidos({
    skip: (pagina - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
    estado: estadoFiltro || undefined,
  });

  const { cambiarEstado } = useCambiarEstadoPedido();

  const handleAvanzar = async (pedido: Pedido) => {
    const siguiente = obtenerSiguienteEstado(pedido.estado);
    if (!siguiente) return;
    setProcesandoId(pedido.id);
    try {
      await cambiarEstado({
        pedidoId: pedido.id,
        payload: { estado: siguiente },
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const handleCancelar = async (pedido: Pedido) => {
    setProcesandoId(pedido.id);
    try {
      await cambiarEstado({
        pedidoId: pedido.id,
        payload: { estado: "CANCELADO" },
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "usuario_id",
        header: "Usuario",
        cell: ({ getValue }) => `#${String(getValue())}`,
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => <BadgeEstado estado={String(getValue())} />,
      },
      {
        accessorKey: "forma_pago",
        header: "Pago",
      },
      {
        accessorKey: "direccion_entrega",
        header: "Dirección",
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const pedido = row.original;
          const siguiente = obtenerSiguienteEstado(pedido.estado);
          const puedeCancelar = puedeCancelarEstado(pedido.estado);
          const busy = procesandoId === pedido.id;

          return (
            <div className="flex flex-wrap items-center gap-2">
              {siguiente && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={busy}
                  onClick={() => void handleAvanzar(pedido)}
                >
                  {busy
                    ? "Actualizando..."
                    : siguiente === "EN_PREPARACION"
                      ? "Preparar"
                      : "Entregar"}
                </Button>
              )}

              {puedeCancelar && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={busy}
                  onClick={() => void handleCancelar(pedido)}
                >
                  Cancelar
                </Button>
              )}

              {!siguiente && !puedeCancelar && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Sin acciones
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [procesandoId],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <LoadingState mensaje="Cargando pedidos..." />;
  if (isError) return <EstadoError error={error} />;

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Gestión de Pedidos</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Administrá los pedidos entrantes y actualizá su estado.
          </p>
        </div>

        <div className="w-full sm:w-56">
          <label
            htmlFor="filtro-estado-pedido"
            className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            Filtrar por estado
          </label>
          <select
            id="filtro-estado-pedido"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoPedido | "");
              setPagina(1);
            }}
            className="input-field"
          >
            {ESTADOS_FILTRO.map((op) => (
              <option key={op.label} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos para el filtro seleccionado." />
      ) : (
        <>
          <div className="table-shell">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="thead">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="tbody-row">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="td-cell">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <Paginacion
              page={pagina}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPagina}
            />
          </div>
        </>
      )}
    </div>
  );
}