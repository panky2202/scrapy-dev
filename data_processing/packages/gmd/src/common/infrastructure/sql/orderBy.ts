/*
You can't set ORDER BY params via sanitized .input() of MSSQLProvider, you should provide them via raw schema
That's why we need orderBy() function for a safe uniform ORDER BY feature across all the codebase
 */
import {SortingOrder} from '../../domain/value-objects/SortingOrder'

export function orderBy<
  SortKey extends string,
  Mapping extends Record<SortKey, any>
>(mapping: Mapping, key: SortKey, sortingOrder: SortingOrder = 'DIRECT') {
  return `ORDER BY ${mapping[key]} ${
    sortingOrder === 'DIRECT' ? 'ASC' : 'DESC'
  }`
}
