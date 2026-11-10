/**
 * Format currency amount based on user preference
 * @param {number} amount
 * @param {string} currencyCode ('INR' | 'USD' | 'EUR' | 'GBP')
 * @returns {string}
 */
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const val = Number(amount) || 0;
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = currencySymbols[currencyCode] || '₹';

  // Format with commas: Indian numbering format for INR, international for others
  if (currencyCode === 'INR') {
    return `${symbol}${val.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })}`;
  }

  return `${symbol}${val.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
};

/**
 * Format date to readable string (e.g., "Nov 03, 2026")
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateForInput = (date = new Date()) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

