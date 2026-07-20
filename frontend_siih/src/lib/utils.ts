import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a localized Spanish string
 */
export function formatDate(dateString: string, formatStr: string = 'dd MMM yyyy') {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), formatStr, { locale: es });
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a number to currency format (Bs)
 */
export function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Bs 0.00';
  
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(num);
}
