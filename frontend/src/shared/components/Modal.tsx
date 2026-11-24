import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  error?: string | null;
  title: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  error = null,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-950/60 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}

export const ModalTemplate = Modal;