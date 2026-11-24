export function LoadingState({
  mensaje = "Cargando datos...",
}: {
  mensaje?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400 font-medium space-y-2">
      <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm">{mensaje}</p>
    </div>
  );
}