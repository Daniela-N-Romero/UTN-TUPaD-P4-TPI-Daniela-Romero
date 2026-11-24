import { Link } from "react-router-dom";
import { Button, Card, Input } from "@/shared";
import { useRegisterForm } from "../hooks/useRegisterForm";

export default function RegisterPage() {
  const { form, errorMessage } = useRegisterForm();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8 transition-colors">
      <Card className="w-full max-w-md">
        <h1 className="page-title">Crear cuenta</h1>
        <p className="mt-1 mb-6 text-sm text-gray-600 dark:text-gray-400">
          Completá tus datos para registrarte en el sistema.
        </p>

        {errorMessage && (
          <div role="alert" className="error-box mb-4 mt-0 px-3 py-2 text-left">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
          noValidate
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                const trimmed = value.trim();
                if (!trimmed) return "El nombre de usuario es obligatorio";
                if (trimmed.length < 3)
                  return "Debe tener al menos 3 caracteres";
                if (trimmed.length > 50)
                  return "No puede superar los 50 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-username"
                name={field.name}
                label="Usuario"
                type="text"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : null
                }
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) => {
                const trimmed = value.trim();
                if (!trimmed) return "El nombre completo es obligatorio";
                if (trimmed.length > 120)
                  return "No puede superar los 120 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-full-name"
                name={field.name}
                label="Nombre completo"
                type="text"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : null
                }
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const trimmed = value.trim();
                if (!trimmed) return "El email es obligatorio";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
                  return "Ingresá un email válido";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-email"
                name={field.name}
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : null
                }
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "La contraseña es obligatoria";
                if (value.length < 8)
                  return "Debe tener al menos 8 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                id="reg-password"
                name={field.name}
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : null
                }
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}