import { Link } from "react-router-dom";
import { Button } from "@shared/components/Button";
import { Card } from "@shared/components/Card";

export function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <Card className="w-full max-w-md text-center">
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          Acceso denegado
        </p>
        <h1 className="page-title mt-1">
          No tenés permisos para ver esta sección
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Tu usuario no cuenta con los roles necesarios para acceder a esta ruta.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button variant="primary">Ir al inicio</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Cambiar de cuenta</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}

export default UnauthorizedPage;