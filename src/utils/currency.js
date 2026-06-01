export const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', name: 'Rupiah', locale: 'id-ID' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
]

export function formatCurrency(amount, currencyCode = 'IDR') {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: currencyCode === 'IDR' || currencyCode === 'JPY' ? 0 : 2
  }).format(amount)
}

export function getCurrency() {
  return localStorage.getItem('currency') || 'IDR'
}

export function setCurrency(code) {
  localStorage.setItem('currency', code)
}