import { useEffect } from "react";
import { useAuthStore } from "@features/auth";
import { AppRouter } from "@routes/AppRouter";
import { Toast } from "@/shared";

export function App() {
  
  const checkAuth = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);


  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;