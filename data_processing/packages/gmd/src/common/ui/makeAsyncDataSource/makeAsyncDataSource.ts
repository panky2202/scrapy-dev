import {AsyncDataSource} from '../AsyncDataSource'
import {useState} from 'react'
import {useInfiniteQuery} from 'react-query'

export type PaginationFn<TVariables, TData> = (
  params: {
    variables: TVariables
  } & PageParam<TData>,
) => TVariables

export type EnabledFn<TVariables> = (params: {variables: TVariables}) => boolean

export type FetchFn<TVariables, TData> = (
  variables?: TVariables,
) => Promise<TData>

type PageParam<TData> = {
  lastPage?: TData
  allPages?: TData[]
}

export type UseAsyncDataSource<TVariables, TResult> = (
  defaultVariables: TVariables,
) => AsyncDataSource<TVariables, TResult>

export function makeAsyncDataSource<TVariables, TData, TResult>({
  fetchFn,
  key,
  paginationFn,
  enabledFn,
  extractResultsFn,
  cacheTime,
}: {
  fetchFn: FetchFn<TVariables, TData>
  key: string
  extractResultsFn: (pages?: TData[]) => TResult | undefined
  enabledFn: EnabledFn<TVariables>
  paginationFn?: PaginationFn<TVariables, TData>
  cacheTime?: number
}): UseAsyncDataSource<TVariables, TResult> {
  return function useAsyncDataSource(defaultVariables) {
    const [variables, setVariables] = useState(defaultVariables)
    const {data, fetchNextPage, error, status, hasNextPage} = useInfiniteQuery(
      [key, variables],
      ({pageParam}: {pageParam?: PageParam<TData>}) => {
        return fetchFn(
          paginationFn
            ? paginationFn({
                variables,
                ...pageParam,
              })
            : variables,
        )
      },
      {
        getNextPageParam: (
          lastPage,
          allPages,
        ): PageParam<TData> | undefined => {
          if (!paginationFn) {
            return
          }
          const results = extractResultsFn([lastPage])
          // @ts-ignore
          if (results?.length) {
            return {lastPage, allPages}
          }
        },
        enabled: enabledFn({variables}),
        cacheTime,
      },
    )
    return {
      data: extractResultsFn(data?.pages),
      error: String(error),
      status,
      variables,
      setVariables,
      fetchNext: fetchNextPage,
      hasNext: Boolean(hasNextPage),
    }
  }
}
