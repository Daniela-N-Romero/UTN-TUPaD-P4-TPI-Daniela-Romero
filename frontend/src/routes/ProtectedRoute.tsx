import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "@shared/components/LoadingState";
import { useAuthStore, type Role } from "@features/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const hasRole = useAuthStore((s) => s.hasRole);
  const location = useLocation();

  if (cargando) {
    return <LoadingState mensaje="Verificando sesión..." />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;