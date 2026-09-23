const TND_SUFFIX = 'د.ت';

export const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)} ${TND_SUFFIX}`;
  }
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)} ${TND_SUFFIX}`;
};

export const formatCurrencyPrecise = (value: number): string =>
  `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ${TND_SUFFIX}`;

export const formatNumber = (value: number, fractionDigits = 0): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
