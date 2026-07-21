import { cn } from '@/lib/utils';
import type { NivelTriage } from '@/types';

interface TriageBadgeProps {
  nivel: NivelTriage;
  className?: string;
  showLabel?: boolean;
}

const triageConfig: Record<NivelTriage, { bg: string; text: string; ring: string; label: string }> = {
  Rojo: {
    bg: 'bg-red-600/20',
    text: 'text-red-400',
    ring: 'ring-red-500/30',
    label: 'Crítico',
  },
  Naranja: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    ring: 'ring-orange-500/30',
    label: 'Muy urgente',
  },
  Amarillo: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    ring: 'ring-yellow-500/30',
    label: 'Urgente',
  },
  Verde: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    ring: 'ring-green-500/30',
    label: 'Poco urgente',
  },
  Azul: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    ring: 'ring-blue-500/30',
    label: 'Sin urgencia',
  },
};

export function TriageBadge({ nivel, className, showLabel = false }: TriageBadgeProps) {
  const config = triageConfig[nivel];
  if (!config) return <span className="text-xs text-muted-foreground">{nivel}</span>;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset transition-colors',
        config.bg,
        config.text,
        config.ring,
        className
      )}
    >
      <span className={cn(
        'h-2 w-2 rounded-full',
        nivel === 'Rojo' && 'bg-red-500 animate-pulse',
        nivel === 'Naranja' && 'bg-orange-500',
        nivel === 'Amarillo' && 'bg-yellow-500',
        nivel === 'Verde' && 'bg-green-500',
        nivel === 'Azul' && 'bg-blue-500',
      )} />
      {nivel}
      {showLabel && (
        <span className="ml-1 font-normal opacity-70">— {config.label}</span>
      )}
    </span>
  );
}
