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
import { Button } from "@shared/components/Button";
import type { Categoria } from "../types/categoria.types";

interface CategoriaListProps {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export function CategoriaList({
  categorias,
  onEdit,
  onDelete,
}: CategoriaListProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Categoria>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(row.original.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: categorias,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800">
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
  );
}