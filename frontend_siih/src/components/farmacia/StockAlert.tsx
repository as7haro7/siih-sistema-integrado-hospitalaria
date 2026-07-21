import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface StockAlertProps {
  stockActual: number;
  stockMinimo: number;
  showBadgeOnly?: boolean;
}

export function StockAlert({ stockActual, stockMinimo, showBadgeOnly = false }: StockAlertProps) {
  const isLow = stockActual <= stockMinimo;
  const isOut = stockActual === 0;

  if (!isLow) return null;

  if (showBadgeOnly) {
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        isOut ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
      }`}>
        <AlertTriangle className="mr-1 h-3 w-3" />
        {isOut ? 'Sin stock' : 'Stock bajo'}
      </span>
    );
  }

  return (
    <div className={`flex items-start p-4 rounded-lg border ${
      isOut 
        ? 'bg-red-500/10 border-red-500/20 text-red-200' 
        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200'
    }`}>
      <AlertTriangle className="h-5 w-5 mr-3 shrink-0" />
      <div>
        <h4 className="font-semibold text-sm">
          {isOut ? 'Alerta: Sin Stock disponible' : 'Alerta: Nivel de stock bajo'}
        </h4>
        <p className="text-xs mt-1 opacity-90">
          El stock actual es de <strong>{stockActual}</strong> unidades. El mínimo sugerido es de <strong>{stockMinimo}</strong> unidades.
        </p>
      </div>
    </div>
  );
}
