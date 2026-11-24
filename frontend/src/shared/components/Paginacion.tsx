import { Button } from "./Button";

interface PaginacionProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Paginacion({
  page,
  pageSize,
  total,
  onPageChange,
  className = "",
}: PaginacionProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const desde = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const hasta = Math.min(total, page * pageSize);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 py-3 text-xs text-gray-600 dark:text-gray-400 ${className}`.trim()}
    >
      <div>
        Mostrando{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {desde}
        </span>{" "}
        a{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {hasta}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {total}
        </span>{" "}
        resultados
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="px-2 font-medium text-gray-800 dark:text-gray-200">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}