// Utility functions for consistent formatting across the app

/**
 * Format a number as currency (EGP)
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '-';
  return `${amount.toLocaleString('ar-EG')} جنيه`;
}

/**
 * Format a number with Arabic digits
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString('ar-EG');
}

/**
 * Format a date string to Arabic format
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format date and time
 */
export function formatDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return timeStr ? `${dateFormatted} ${timeStr}` : dateFormatted;
  } catch {
    return timeStr ? `${dateStr} ${timeStr}` : dateStr;
  }
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '-';
  // Format: 01xxx xxx xxx
  if (phone.length === 11 && phone.startsWith('0')) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  }
  return phone;
}

/**
 * Format quantity with proper decimal handling
 */
export function formatQuantity(qty: number, allowDecimal = false): string {
  if (allowDecimal) {
    return qty.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  }
  return Math.round(qty).toLocaleString('ar-EG');
}

/**
 * Format percentage
 */
export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  return `${value}%`;
}
