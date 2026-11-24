import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, RegisterPage } from "@features/auth";
import { AdminCategoriasPage } from "@features/categorias";
import { CatalogoPage, AdminProductosPage } from "@features/productos";
import {
  CarritoPage,
  CheckoutPage,
  MisPedidosPage,
  AdminResumenPage,
  AdminPedidosPage,
} from "@features/pedidos";
import { AdminUsuariosPage } from "@features/usuarios";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { UnauthorizedPage } from "@shared/components/UnauthorizedPage";
import { MainLayout } from "@/shared";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Rutas públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas protegidas (cualquier usuario con sesión) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Rutas exclusivas para rol admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          {/* Fallback para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;