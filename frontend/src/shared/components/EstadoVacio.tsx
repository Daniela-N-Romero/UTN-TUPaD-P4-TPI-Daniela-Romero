export function EstadoVacio({
  mensaje = "No hay registros disponibles.",
}: {
  mensaje?: string;
}) {
  return (
    <div className="empty-box">
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
        {mensaje}
      </p>
    </div>
  );
}