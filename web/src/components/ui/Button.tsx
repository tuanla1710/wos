import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "destructive";

const look: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  destructive: "btn-danger",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button type={type} className={`${look[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
