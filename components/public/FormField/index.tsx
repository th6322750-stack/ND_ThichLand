"use client";
import { useId, forwardRef } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "tel" | "email" | "password" | "textarea";
  error?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  function FormField({ label, name, type = "text", error, required, placeholder, defaultValue }, ref) {
    const id = useId();
    const errorId = `${id}-error`;
    const sharedClassName = `rounded-md border px-4 py-3 text-body outline-none transition-colors duration-fast focus:ring-2 focus:ring-primary disabled:bg-soft disabled:text-muted ${
      error ? "border-error" : "border-line focus:border-primary"
    }`;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-label text-ink">
          {label}
          {required && " *"}
        </label>
        {type === "textarea" ? (
          <textarea
            id={id}
            name={name}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className={`${sharedClassName} min-h-[120px]`}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            placeholder={placeholder}
            defaultValue={defaultValue}
            className={sharedClassName}
          />
        )}
        {error && (
          <span id={errorId} role="alert" className="text-body text-error">
            {error}
          </span>
        )}
      </div>
    );
  },
);
