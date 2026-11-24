import type { ItemCarrito, ProductoCarrito } from "@/features/productos";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Store del carrito de compras:
 * usa Zustand con middleware `persist` para conservar los ítems del carrito entre recargas de página.
 * Expone `items`, `agregar`, `quitar`, `cambiarCantidad`, `vaciar` y `total`.
 */
interface CartState {
  items: ItemCarrito[];

  agregar: (producto: ProductoCarrito, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Agrega un producto al carrito. Si ya existe, suma la cantidad
      // (respetando el stock disponible).
      agregar: (producto, cantidad = 1) => {
        if (cantidad <= 0) return;

        set((state) => {
          const existente = state.items.find(
            (item) => item.producto.id === producto.id,
          );

          if (existente) {  // Caso si el producto ya estaba en el carrito. 
            const nuevaCantidad =
              typeof producto.stock === "number"
                ? Math.min(existente.cantidad + cantidad, producto.stock) // Si el producto trae stock, `Math.min(...)` hace de "tope máximo": nunca deja que la cantidad supere el stock disponible.
                : existente.cantidad + cantidad; //Sumamos la cantidad existente a la nueva

            // Reemplazamos solo ese ítem con el producto actualizado y la nueva cantidad.
            return {
              items: state.items.map((item) =>
                item.producto.id === producto.id
                  ? { ...item, producto, cantidad: nuevaCantidad }
                  : item,
              ),
            };
          }

          // Caso 2: el producto no estaba en el carrito (es un ítem nuevo)
          // Si trae `stock`, limitamos `cantidad` a no pasarse del stock
          const cantidadInicial =
            typeof producto.stock === "number"
              ? Math.min(cantidad, producto.stock)
              : cantidad;

          // Si el tope dejó la cantidad en 0 (por ejemplo, `stock === 0`), no agregamos el ítem y devolvemos `state` sin cambios.
          if (cantidadInicial <= 0) return state;

          // Agregamos el nuevo ítem conservando los anteriores y persistiendo vía Zustand persist
          return {
            items: [...state.items, { producto, cantidad: cantidadInicial }],
          };
        });
      },

      // Elimina por completo un producto del carrito según su `id`.
      quitar: (productoId) => {
        set((state) => ({
          items: state.items.filter((item) => item.producto.id !== productoId),
        }));
      },

      // Actualiza la cantidad de un producto. Si la cantidad es <= 0, lo quita del carrito.
      cambiarCantidad: (productoId, cantidad) => {
        // Si el usuario baja la cantidad a 0 o menos, lo quitamos del carrito
        // para no dejar ítems vacíos o con números negativos
        if (cantidad <= 0) {
          get().quitar(productoId);
          return;
        }

        set((state) => ({

          items: state.items.map((item) => {
            if (item.producto.id !== productoId) return item;

            const cantidadAjustada =
              typeof item.producto.stock === "number"
                ? Math.min(cantidad, item.producto.stock) // Si el producto tiene `stock` usamos Math.min(..)para asegurar que nunca se supere el stock disponible
                : cantidad;

            return { ...item, cantidad: cantidadAjustada };

          }),
        }));
      },

      // Vacía todos los ítems del carrito (útil despues de confirmar un pedido).
      vaciar: () => {
        set({ items: [] });
      },

      // Calcula el importe total acumulado (precio_base * cantidad de cada ítem).
      total: () => {
        return get().items.reduce(
          (acc, item) => acc + item.producto.precio_base * item.cantidad,
          0,
        );
      },
    }),
    {
      name: "foodstore-cart-storage",
      // Persistimos únicamente los ítems del carrito.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);