import type { Categoria } from "@/features/categorias";

// Representa un `ProductoRead` en FastAPI
export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria?: Categoria | null;
}

export interface ProductoCreate {
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
}

// Todos los campos opcionales en el update
export interface ProductoUpdate {
  categoria_id?: number;
  nombre?: string;
  descripcion?: string;
  precio_base?: number;
  imagen_url?: string;
  stock?: number;
  disponible?: boolean;
  activo?: boolean;
}

export interface ProductoStockUpdate {
  stock: number;
  disponible: boolean;
}

//Respuesta paginada de productos 
export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

//Ítem de producto dentro del carrito (`cartStore`).
// Mantiene `precio_base` y `stock` alineados con el modelo del backend
export interface ProductoCarrito {
  id: number;
  nombre: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
}

export interface ItemCarrito {
  producto: ProductoCarrito;
  cantidad: number;
}