// Pages
export { default as CatalogoPage } from "./pages/CatalogoPage";
export { default as AdminProductosPage } from "./pages/AdminProductosPage";

// Hooks
export {
  useProductosCatalogo,
  useAdminProductos,
  PRODUCTOS_QUERY_KEY,
} from "./hooks/useProductos";

// Components
export { ProductoCard } from "./components/ProductoCard";
export { ProductoList } from "./components/ProductoList";
export { ProductoModal } from "./components/ProductoModal";

// Types
export type * from "./types/producto.types";