import numbro from 'numbro'

export type Currency = null | 'USD'
type CurrencySymbol = '' | '$'

function currencyToSymbol(currency: Currency): CurrencySymbol {
  switch (currency) {
    case 'USD':
      return '$'
    case null:
      return ''
  }
}

export function formatPrice(
  price?: number,
  currency: Currency = 'USD',
): string {
  if (typeof price === 'undefined') {
    return ''
  }

  const digitString = numbro(price).format({
    mantissa: 2,
    thousandSeparated: true,
  })
  return `${currencyToSymbol(currency)}${digitString}`
}
