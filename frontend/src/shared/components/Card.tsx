import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  headerAction,
  className = "",
  children,
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || headerAction);

  return (
    <div className={`card-surface ${className}`.trim()}>
      {hasHeader && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}