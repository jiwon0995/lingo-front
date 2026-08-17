import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib";

type Variant = "primary" | "ghost" | "outline";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-red-brand text-white hover:bg-red-brand-dark active:bg-red-brand-dark",
  ghost: "bg-transparent text-ink-2 hover:bg-line/50",
  outline: "border border-line bg-surface text-ink hover:border-red-brand",
};

const SIZES: Record<Size, string> = {
  md: "h-11 px-4 text-sm",
  lg: "h-14 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors",
        "focus-visible:ring-2 focus-visible:ring-red-brand focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
