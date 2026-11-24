import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";

interface CrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  getAll: () => Promise<T[]> //la función asíncrona (query function) que realmente va a buscar los datos
  create: (data: TCreate) => Promise<T>;
  update: (id: number, data: TUpdate) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

interface UseCrudOptions {
  entityLabel?: string;
}

export function useCrud<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
  queryKey: string,
  service: CrudService<T, TCreate, TUpdate>,
  options?: UseCrudOptions,
) {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const label = options?.entityLabel ?? queryKey;

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [queryKey], // Registra y busca la consulta bajo la clave
    queryFn: service.getAll, // queryFn es el puente entre TanStack Query y tu lógica de acceso a datos
  });

  const createMutation = useMutation({
    mutationFn: (newData: TCreate) => service.create(newData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
      showNotification(`${label} creado/a correctamente`);
    },
    onError: (err: unknown) => {
      showNotification(err instanceof Error ? err.message : `Error al crear ${label}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TUpdate }) => service.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
      showNotification(`${label} actualizado/a correctamente`);
    },
    onError: (err: unknown) => {
      showNotification(err instanceof Error ? err.message : `Error al crear ${label}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
      showNotification(`${label} eliminado/a correctamente`);
    },
    onError: (err: unknown) => {
      showNotification(err instanceof Error ? err.message : `Error al crear ${label}`);
    }
  });

  return {
    data,
    isLoading,
    isError,
    error,
    createItem: createMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    deleteItem: deleteMutation.mutateAsync,
  };
}