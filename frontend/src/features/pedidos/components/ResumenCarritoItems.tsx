import type { ItemCarrito } from "@/features/productos";

interface ResumenCarritoItemsProps {
  items: ItemCarrito[];
  total: number;
}

export function ResumenCarritoItems({ items, total }: ResumenCarritoItemsProps) {
  return (
    <div>
      <ul className="divide-y divide-gray-200 text-sm dark:divide-gray-800">
        {items.map(({ producto, cantidad }) => {
          const subtotal = producto.precio_base * cantidad;
          return (
            <li
              key={producto.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <span className="text-gray-800 dark:text-gray-200">
                <strong className="font-semibold">{producto.nombre}</strong>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  × {cantidad}
                </span>
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${subtotal.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900 dark:border-gray-800 dark:text-gray-100">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}