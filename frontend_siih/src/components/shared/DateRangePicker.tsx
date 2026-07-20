'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
  disabled = false
}: DateRangePickerProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-2", className)}>
      <div className="flex flex-col space-y-1.5 w-full sm:w-auto">
        <Label className="text-xs text-muted-foreground">Fecha Inicial</Label>
        <Input 
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(e) => onStartDateChange(e.target.value)}
          disabled={disabled}
          className="w-full sm:w-40 h-9 text-sm"
        />
      </div>
      <div className="hidden sm:block text-muted-foreground mt-4">-</div>
      <div className="flex flex-col space-y-1.5 w-full sm:w-auto">
        <Label className="text-xs text-muted-foreground">Fecha Final</Label>
        <Input 
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => onEndDateChange(e.target.value)}
          disabled={disabled}
          className="w-full sm:w-40 h-9 text-sm"
        />
      </div>
    </div>
  );
}
