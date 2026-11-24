import { useState } from "react";

interface UseCrudModalProps<T, TCreate, TUpdate = TCreate> {
  createItem: (data: TCreate) => Promise<unknown>;
  updateItem: (params: { id: number; data: TUpdate }) => Promise<unknown>;
  deleteItem: (id: number) => Promise<unknown>;
  entityName?: string;
  initialItem?: T | null;
}

export function useCrudModal<T extends { id: number }, TCreate, TUpdate = TCreate>({
	createItem,
	updateItem,
	deleteItem,
	entityName = "registro",
	initialItem = null,
}: UseCrudModalProps<T, TCreate, TUpdate>){
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<T | null>(initialItem);
	const [error, setError] = useState<string | null>(null);

	const openCreateModal = () => {
		setError(null);
		setSelectedItem(null);
		setIsModalOpen(true);
	};

	const openEditModal = (item: T) => {
    setError(null);
		setSelectedItem(item);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedItem(null);
	};

	const handleDelete = async (id: number) => {
		try {
			if (confirm(`¿Estás seguro de que querés eliminar este/a ${entityName}?`)) {
				await deleteItem(id);
			}
			return;
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : "Ocurrió un error inesperado");
		}
	};

	const handleSave = async (datos: TCreate) => {
		try {
			if (selectedItem) {
				await updateItem({ id: selectedItem.id, data: datos as unknown as TUpdate});
			} else {
				await createItem(datos);
			}
			closeModal();
		} catch (e: unknown) {
  			setError(e instanceof Error ? e.message : "Ocurrió un error inesperado");
		}
	};

	return {
		isModalOpen,
		selectedItem,
		error,
		setError,
		openCreateModal,
		openEditModal,
		closeModal,
		handleSave,
		handleDelete
	};
}
