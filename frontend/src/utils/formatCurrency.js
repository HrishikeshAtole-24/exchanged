export function formatCurrency(value, currency = 'USD', compact = false) {
  if (value == null || isNaN(value)) return '—';

  if (compact && Math.abs(value) >= 1e9) {
    return '$' + (value / 1e9).toFixed(2) + 'B';
  }
  if (compact && Math.abs(value) >= 1e6) {
    return '$' + (value / 1e6).toFixed(2) + 'M';
  }

  const decimals = Math.abs(value) < 1 ? 6 : Math.abs(value) < 100 ? 4 : 2;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(2) + '%';
}

export function formatNumber(value, compact = false) {
  if (value == null || isNaN(value)) return '—';

  if (compact && Math.abs(value) >= 1e12) {
    return (value / 1e12).toFixed(2) + 'T';
  }
  if (compact && Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(2) + 'B';
  }
  if (compact && Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(2) + 'M';
  }
  if (compact && Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }

  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
