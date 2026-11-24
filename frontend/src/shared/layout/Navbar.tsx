import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@features/auth";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";

const ADMIN_LINKS = [
  { to: "/admin/resumen", label: "Resumen" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/usuarios", label: "Usuarios" },
] as const;

const navBtnClass = "rounded bg-indigo-700 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-indigo-800";

const dropdownItemClass = "block rounded px-3 py-2 text-sm transition-colors hover:bg-indigo-800";

export function Navbar() {
  const location = useLocation();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const usuario = useAuthStore((state) => state.usuario);
  const hasRole = useAuthStore((state) => state.hasRole);
  const logout = useAuthStore((state) => state.logout);

  const cantidadCarrito = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.cantidad, 0),
  );

  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const isAdmin = hasRole("admin");
  const isAdminRouteActive = location.pathname.startsWith("/admin");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // cierra el menú desplegable al navegar o hacer clic fuera
  useEffect(() => {
    setAdminMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

return (
    <nav className="mb-6 bg-indigo-600 px-6 py-4 text-white shadow-md dark:bg-indigo-950">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-xl font-bold hover:opacity-95">
            Food Store
          </Link>
          <p className="text-xs text-indigo-200">
            UTN TUPaD · Proyecto Integrador
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Navegación principal */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/" className={navBtnClass}>
              Catálogo
            </Link>

            <Link to="/carrito" className={navBtnClass}>
              Carrito ({cantidadCarrito})
            </Link>

            {usuario && (
              <Link to="/mis-pedidos" className={navBtnClass}>
                Mis pedidos
              </Link>
            )}

            {isAdmin && (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAdminMenuOpen((prev) => !prev)}
                  aria-expanded={adminMenuOpen}
                  className={`${navBtnClass} flex cursor-pointer items-center gap-1.5 ${
                    isAdminRouteActive ? "ring-2 ring-indigo-300/70" : ""
                  }`}
                >
                  <span>Gestionar</span>
                  <span className="text-xs">{adminMenuOpen ? "▴" : "▾"}</span>
                </button>

                {adminMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-indigo-500/30 bg-indigo-700 p-1.5 shadow-lg dark:bg-indigo-900">
                    {ADMIN_LINKS.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`${dropdownItemClass} ${
                          location.pathname === item.to
                            ? "bg-indigo-800 font-semibold"
                            : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggle de tema */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar modo oscuro"
            className={`${navBtnClass} cursor-pointer text-xs`}
          >
            {darkMode ? "☀️ Modo claro" : "🌙 Modo oscuro"}
          </button>

          {/* Sesión */}
          {usuario ? (
            <div className="flex items-center gap-3 border-l border-indigo-400/50 pl-3">
              <div className="text-right text-xs leading-tight">
                <p className="font-semibold">{usuario.full_name}</p>
                <span className="mt-0.5 inline-block rounded-full bg-indigo-800 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                  {usuario.role}
                </span>
              </div>

              <button
                type="button"
                onClick={() => void logout()}
                className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className={navBtnClass}>
                Iniciar sesión
              </Link>
              <Link to="/register" className={navBtnClass}>
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;