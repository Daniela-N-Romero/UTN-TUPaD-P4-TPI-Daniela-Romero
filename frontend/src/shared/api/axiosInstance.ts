import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getApiBase } from "./config";
import { handleApiError } from "./handle-api-error";
import { useNotificationStore } from "@/store/notificationStore";


export const api = axios.create({
  baseURL: getApiBase(),
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});


let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  onSessionExpired = handler;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.headers.set("Accept", "application/json");
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = handleApiError(error);

    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";
    const isAuthCheckOrLogin =
      requestUrl.includes("/auth/token") || requestUrl.includes("/auth/me");

    const isDisabledAccount =
      status === 400 && message.includes("Cuenta de usuario desactivada");

    if ((status === 401 && !isAuthCheckOrLogin) || isDisabledAccount) {
      onSessionExpired?.();
      if (isDisabledAccount) {
        useNotificationStore.getState().showNotification(message);
      }
    } else if (status === 403) {
      useNotificationStore.getState().showNotification("Acceso denegado");
    }

    const normalized = new Error(message);
    normalized.cause = error;
    return Promise.reject(normalized);
  },
);