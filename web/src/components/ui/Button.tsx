import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "destructive";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const look =
    variant === "destructive"
      ? "bg-overdue text-white hover:brightness-[0.92]"
      : variant === "ghost"
        ? "text-ink hover:bg-hover"
        : "bg-accent text-white hover:bg-accent-hover";
  return (
    <button type="button" className={`inline-flex h-9 items-center justify-center rounded px-3.5 text-sm font-semibold ${look} ${className}`} {...props}>
      {children}
    </button>
  );
}
