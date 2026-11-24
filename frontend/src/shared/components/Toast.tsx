import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export function Toast() {
  const message = useNotificationStore((state) => state.message);
  const show = useNotificationStore((state) => state.show);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(hideNotification, 3000);
    return () => clearTimeout(timer);
  }, [show, message, hideNotification]);

  if (!show) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 right-10 z-50 rounded bg-gray-800 px-5 py-4 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
    >
      {message}
    </div>
  );
}