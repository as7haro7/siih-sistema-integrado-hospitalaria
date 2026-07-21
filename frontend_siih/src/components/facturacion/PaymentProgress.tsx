import React from 'react';

interface PaymentProgressProps {
  totalPagar: number | string;
  pagado: number | string;
}

export function PaymentProgress({ totalPagar, pagado }: PaymentProgressProps) {
  const total = typeof totalPagar === 'string' ? parseFloat(totalPagar) : totalPagar;
  const current = typeof pagado === 'string' ? parseFloat(pagado) : pagado;

  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const remaining = Math.max(0, total - current);

  let progressColor = 'bg-red-500';
  if (percentage >= 100) {
    progressColor = 'bg-medical-500';
  } else if (percentage > 0) {
    progressColor = 'bg-yellow-500';
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Progreso de Pago ({percentage}%)</span>
        <span className="text-foreground font-semibold">
          Bs. {current.toFixed(2)} / Bs. {total.toFixed(2)}
        </span>
      </div>

      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {remaining > 0 && (
        <div className="flex justify-end text-xs text-muted-foreground">
          <span>Saldo pendiente: Bs. {remaining.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
