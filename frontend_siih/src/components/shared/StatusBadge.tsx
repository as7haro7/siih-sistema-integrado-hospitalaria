import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "border-transparent bg-primary text-primary-foreground": variant === 'default',
            "border-transparent bg-medical-500 text-dark-950": variant === 'success',
            "border-transparent bg-yellow-500 text-yellow-950": variant === 'warning',
            "border-transparent bg-destructive text-destructive-foreground": variant === 'danger',
            "border-transparent bg-blue-500 text-blue-950": variant === 'info',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let variant: 'default' | 'success' | 'warning' | 'danger' | 'info' = 'default';
  
  const s = status.toLowerCase();
  
  if (s.includes('activo') || s.includes('completado') || s.includes('pagado') || s.includes('entregado') || s.includes('alta')) {
    variant = 'success';
  } else if (s.includes('pendiente') || s.includes('proceso') || s.includes('parcial')) {
    variant = 'warning';
  } else if (s.includes('cancelada') || s.includes('baja') || s.includes('anulado') || s.includes('mantenimiento') || s.includes('sin stock')) {
    variant = 'danger';
  } else if (s.includes('disponible')) {
    variant = 'info';
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}
