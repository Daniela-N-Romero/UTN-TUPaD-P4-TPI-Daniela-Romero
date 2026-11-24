import { api } from "@/shared/api/axiosInstance";
import type { UserPublic } from "@features/auth";

const BASE = "/api/v1/admin/usuarios";

export async function listAdminUsuarios(): Promise<UserPublic[]> {
  const { data } = await api.get<UserPublic[]>(`${BASE}/`);
  return data;
}

export async function desactivarUsuario(userId: number): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>(`${BASE}/${userId}/desactivar`);
  return data;
}

export async function activarUsuario(userId: number): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>(`${BASE}/${userId}/activar`);
  return data;
}