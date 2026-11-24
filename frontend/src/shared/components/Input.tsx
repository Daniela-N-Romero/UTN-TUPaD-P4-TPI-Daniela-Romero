import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${
          error
            ? "border-rose-500 dark:border-rose-500 focus:ring-rose-500"
            : ""
        } ${className}`.trim()}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : (
        helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}