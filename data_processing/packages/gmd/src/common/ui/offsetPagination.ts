import {PaginationFn} from './makeAsyncDataSource'
import {mergeDeep} from '@engaging-enterprises/basic-utils'

export type OffsetPagination = {
  input?: {
    offset?: number | null
    first?: number | null
  } | null
}

export const offsetPagination = <TVariables extends OffsetPagination, TData>(
  pageSize: number,
): PaginationFn<TVariables, TData> => ({variables, allPages = []}) => {
  const pagination: OffsetPagination = {
    input: {
      offset: allPages.length * pageSize,
      first: pageSize,
    },
  }
  return mergeDeep(variables, pagination)
}
