import { Button,  Card , BadgeEstado } from "@/shared";
import { useCartStore } from "@/store/cartStore";
import type { Producto } from "../types/producto.types";

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar);

  // Cantidad actual de este producto ya guardada en el carrito (0 si aún no está)
  const enCarrito = useCartStore(
    (state) =>
      state.items.find((item) => item.producto.id === producto.id)?.cantidad ??
      0,
  );
  // El producto no se puede agregar si no tiene stock o está marcado como no disponible
  const sinStock = producto.stock <= 0 || !producto.disponible;
  // Evita que el botón permita superar el stock disponible desde la UI
  const topeAlcanzado = enCarrito >= producto.stock;

  const handleAgregar = () => {
    agregar(
      {
        id: producto.id,
        nombre: producto.nombre,
        precio_base: producto.precio_base,
        imagen_url: producto.imagen_url,
        stock: producto.stock,
      },
      1,
    );
  };

  return (
    <Card className="flex h-full flex-col justify-between p-4">
      <div>
        <div className="mb-3 aspect-video w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400 dark:text-gray-500">
              Sin imagen
            </div>
          )}
        </div>

        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {producto.categoria?.nombre ?? "General"}
          </span>
          <BadgeEstado
            estado={sinStock ? "INACTIVO" : "ACTIVO"}
            label={sinStock ? "No disponible" : "Disponible"}
          />
        </div>

        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {producto.nombre}
        </h2>
        <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
          {producto.descripcion}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-200 pt-3 dark:border-gray-800">
        <div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ${producto.precio_base.toFixed(2)}
          </span>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Stock: {producto.stock}
            {enCarrito > 0 ? ` · En carrito: ${enCarrito}` : ""}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={sinStock || topeAlcanzado}
          onClick={handleAgregar}
        >
          {topeAlcanzado ? "Máx. en carrito" : "Agregar al carrito"}
        </Button>
      </div>
    </Card>
  );
}