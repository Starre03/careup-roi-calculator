export const formatEuro = (value: number, decimals = 0): string => {
  if (!Number.isFinite(value)) return '€0';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);
  return `${sign}€${formatted}`;
};

export const formatPercent = (value: number, decimals = 0): string => {
  if (!Number.isFinite(value)) return '0%';
  return `${new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)}%`;
};

export const formatNumber = (value: number, decimals = 0): string =>
  new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

export const todayISO = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
