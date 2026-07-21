'use client';

import { cn } from '@/lib/utils';

interface SlotPickerProps {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  loading?: boolean;
  mensaje?: string;
}

export function SlotPicker({ slots, selectedSlot, onSelect, loading = false, mensaje }: SlotPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-3 text-sm text-muted-foreground">Cargando horarios disponibles...</span>
      </div>
    );
  }

  if (mensaje) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-6 text-center">
        <p className="text-sm text-yellow-400">{mensaje}</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No hay horarios disponibles para esta fecha.</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Intente seleccionar otra fecha o médico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">
        Horarios disponibles <span className="text-muted-foreground">({slots.length} slots)</span>
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(slot)}
              className={cn(
                "relative rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                "hover:scale-105 active:scale-95",
                isSelected
                  ? "border-primary bg-primary/20 text-primary ring-2 ring-primary/50 shadow-lg shadow-primary/20"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {slot}
              {isSelected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
