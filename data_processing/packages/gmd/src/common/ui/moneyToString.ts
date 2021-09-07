import {MoneyGQL} from '../application/types'

export function moneyToString(money?: MoneyGQL | null) {
  if (!money) {
    return ''
  }
  if (money.currency === 'USD') {
    return `$${money.amount}`
  }
  return `${money.amount} ${money.currency}`
}
