export function EstadoError({ error }: { error: unknown }) {
  const mensaje =
    error instanceof Error ? error.message : "Ocurrió un error inesperado.";

  return (
    <div role="alert" className="error-box">
      Error al cargar: {mensaje}
    </div>
  );
}