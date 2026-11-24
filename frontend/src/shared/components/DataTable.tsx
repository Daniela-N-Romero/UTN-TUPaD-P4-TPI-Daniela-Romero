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

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  onEdit: (item: T) => void;
  onDelete: (id: number) => void;
  idKey?: keyof T;
}

export function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  idKey = "id" as keyof T,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const fullColumns: ColumnDef<T, any>[] = [
    ...columns,
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const item = row.original;
        const itemId = Number(item[idKey]);
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(itemId)}
              className="btn-danger"
            >
              Eliminar
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns: fullColumns,
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
                      className={`thead ${canSort ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80" : ""}`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{ asc: " ▲", desc: " ▼" }[
                        header.column.getIsSorted() as string
                      ] ?? null}
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
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="btn-secondary py-1 px-3 text-xs"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="btn-secondary py-1 px-3 text-xs"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}