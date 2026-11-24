import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@features/auth";

export function useNavbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const isAdmin = useAuthStore((state) => state.hasRole("admin"));

  const rolesLabels = user?.role ? [user.role] : ["sin rol"];

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };
  return {
    user,
    isAdmin,
    rolesLabels,
    handleLogout,
  };
}