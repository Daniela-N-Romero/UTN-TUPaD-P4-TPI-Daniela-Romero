import { Link } from "react-router-dom";
import { Button, Card, Input } from "@/shared";
import { useLoginForm } from "../hooks/useLoginForm";

export default function LoginPage() {
	const { form, errorMessage } = useLoginForm();

	return (
		<main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-8 transition-colors">
			<Card className="w-full max-w-md">
				<h1 className="page-title">Iniciar sesión</h1>
				<p className="mt-1 mb-6 text-sm text-gray-600 dark:text-gray-400">
					Ingresá con tu usuario o correo y contraseña para acceder al Food
					Store.
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
							onChange: ({ value }) =>
								!value.trim() ? "El usuario o email es obligatorio" : undefined,
						}}
					>
						{(field) => (
							<Input
								id="login-username"
								name={field.name}
								label="Usuario o email"
								type="text"
								autoComplete="username"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="cliente@ejemplo.com"
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
								return undefined;
							},
						}}
					>
						{(field) => (
							<Input
								id="login-password"
								name={field.name}
								label="Contraseña"
								type="password"
								autoComplete="current-password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="••••••••"
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
								{isSubmitting ? "Ingresando..." : "Ingresar"}
							</Button>
						)}
					</form.Subscribe>
				</form>

				<p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
					¿Todavía no tenés cuenta?{" "}
					<Link
						to="/register"
						className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
					>
						Registrate acá
					</Link>
				</p>

				<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
					<span className="font-semibold text-gray-800 dark:text-gray-200">
						Usuario seed:{" "}
					</span>
					<span>
						usuario: <span className="font-mono font-medium">admin</span> ·
						clave: <span className="font-mono font-medium">Admin1234!</span>
					</span>
				</div>
			</Card>
		</main>
	);
}
