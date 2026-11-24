import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../api/auth.service";
import { useAuth } from "./useAuth";

export function useRegisterForm() {
  const navigate = useNavigate();
  const { setError: clearError } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    clearError(null);
  }, [clearError]);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      clearError(null);
      try {
        await authService.requestRegister({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate("/login", { replace: true });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo completar el registro";
        setSubmitError(message);
      }
    },
  });

  return {
    form,
    errorMessage: submitError,
  };
}