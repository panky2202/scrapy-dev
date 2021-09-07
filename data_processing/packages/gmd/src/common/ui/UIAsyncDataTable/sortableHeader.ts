import {Header, SortingOrder} from './ports/UIAsyncDataTableProps'
import {VariablesState} from '../AsyncDataSource'
import {mergeDeep} from '@engaging-enterprises/basic-utils'

function reverseToSortingOrder(reverse?: boolean | null): SortingOrder {
  return reverse ? 'descending' : 'ascending'
}

export type SortableVariables<SortingKey> = {
  input?: {
    sortKey?: SortingKey | null
    reverse?: boolean | null
  } | null
}

export function sortableHeader<
  TVariables extends SortableVariables<SortKey>,
  SortKey
>({variables, setVariables}: VariablesState<TVariables>) {
  return (
    header: Omit<Header, 'onPress' | 'sortingOrder'> & {
      sortKey: NonNullable<NonNullable<TVariables['input']>['sortKey']>
    },
  ): Header => {
    const isSorted = header.sortKey === variables.input?.sortKey
    const sorting: SortableVariables<SortKey> = {
      input: {
        sortKey: header.sortKey,
        reverse: isSorted ? !variables.input?.reverse : false,
      },
    }
    return {
      ...header,
      sortingOrder: isSorted
        ? reverseToSortingOrder(variables.input?.reverse)
        : undefined,
      onPress: () => setVariables(mergeDeep(variables, sorting)),
    }
  }
}
