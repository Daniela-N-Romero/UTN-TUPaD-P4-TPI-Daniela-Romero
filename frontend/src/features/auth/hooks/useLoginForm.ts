import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function useLoginForm() {
  const navigate = useNavigate();
  const { login, error: storeError, setError: clearError } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    clearError(null);
  }, [clearError]);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      clearError(null);
      try {
        await login(value.username.trim(), value.password);
        navigate("/", { replace: true });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Credenciales inválidas";
        setSubmitError(message);
      }
    },
  });

  return {
    form,
    errorMessage: submitError ?? storeError,
  };
}