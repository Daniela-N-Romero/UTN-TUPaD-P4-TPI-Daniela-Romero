type EstadoKey =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO"
  | "ACTIVO"
  | "INACTIVO"
  | string;

interface BadgeEstadoProps {
  estado: EstadoKey;
  label?: string;
  className?: string;
}

const ESTILOS_ESTADO: Record<string, string> = {
  PENDIENTE:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
  EN_PREPARACION:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800",
  ENTREGADO:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  CANCELADO:
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
  ACTIVO:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  INACTIVO:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const ESTILO_DEFAULT =
  "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";

function formatearTexto(estado: string): string {
  return estado.replaceAll("_", " ");
}

export function BadgeEstado({
  estado,
  label,
  className = "",
}: BadgeEstadoProps) {
  const normalizado = estado.toUpperCase();
  const estilo = ESTILOS_ESTADO[normalizado] ?? ESTILO_DEFAULT;
  const textoVisible = label ?? formatearTexto(estado);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${estilo} ${className}`.trim()}
    >
      {textoVisible}
    </span>
  );
}