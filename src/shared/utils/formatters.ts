/**
 * Shared Formatting Utilities
 */

/**
 * Format numeric value to Indian Rupee representation (e.g. ₹1,450)
 */
export const formatCurrency = (amount: number = 0): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date string to human-readable Indian standard format
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

/**
 * Format relative time (e.g. "2 mins ago", "Yesterday")
 */
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Abhi-abhi';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min pehle`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr pehle`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
};
