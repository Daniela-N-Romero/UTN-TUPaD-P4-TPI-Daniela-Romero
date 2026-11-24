import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { BadgeEstado } from "@shared/components/BadgeEstado";
import { Button } from "@shared/components/Button";
import { EstadoVacio, EstadoError} from "@/shared";
import { LoadingState } from "@shared/components/LoadingState";
import { isUsuarioActivo, useUsuarios } from "../hooks/useUsuarios";
import type { UsuarioAdmin } from "../types/usuarios.types";

export default function AdminUsuariosPage() {
  const {
    usuarios,
    currentUserId,
    isLoading,
    isError,
    error,
    processingId,
    handleActivar,
    handleDesactivar,
  } = useUsuarios();

  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<UsuarioAdmin>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "username",
      header: "Usuario",
    },
    {
      accessorKey: "full_name",
      header: "Nombre",
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentUserId;
        return (
          <div className="flex items-center gap-2">
            <span>{u.full_name}</span>
            {isSelf && (
              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
                Vos
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ getValue }) => (
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
          {String(getValue())}
        </span>
      ),
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const activo = isUsuarioActivo(row.original);
        return (
          <BadgeEstado
            estado={activo ? "ACTIVO" : "INACTIVO"}
            label={activo ? "Activo" : "Desactivado"}
          />
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const usuario = row.original;
        const activo = isUsuarioActivo(usuario);
        const isSelf = usuario.id === currentUserId;
        const isBusy = processingId === usuario.id;

        if (activo) {
          // Según la consigna, el botón Desactivar no se muestra en la fila del usuario de la sesión.
          if (isSelf) {
            return (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Sesión actual
              </span>
            );
          }

          return (
            <Button
              variant="danger"
              size="sm"
              disabled={isBusy}
              onClick={() => void handleDesactivar(usuario.id)}
            >
              {isBusy ? "Procesando..." : "Desactivar"}
            </Button>
          );
        }

        return (
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={() => void handleActivar(usuario.id)}
          >
            {isBusy ? "Procesando..." : "Activar"}
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: usuarios,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <LoadingState mensaje="Cargando usuarios..." />;
  if (isError) return <EstadoError error={error ?? "Error al cargar usuarios."} />;

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="page-title">Administración de Usuarios</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Listado general de cuentas registradas, roles asignados y estado de acceso.
        </p>
      </div>

      {error && (
        <div role="alert" className="error-box mb-4 mt-0 px-4 py-3 text-left">
          {error}
        </div>
      )}

      {usuarios.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios registrados." />
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      return (
                        <th
                          key={header.id}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          className={`thead ${
                            canSort
                              ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80"
                              : ""
                          }`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " ▲",
                            desc: " ▼",
                          }[header.column.getIsSorted() as string] ?? null}
                        </th>
                      );
                    })}
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

          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/60">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Página{" "}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              de{" "}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {table.getPageCount() || 1}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}