import {useMutation} from 'react-query'
import {AsyncDataMutation} from '../AsyncDataSource'
import {FetchFn} from './makeAsyncDataSource'

export type UseMutation<TVariables = any, TData = any> = (options?: {
  onSuccess?: (data: TData, variables?: TVariables) => any
  onError?: () => any
}) => AsyncDataMutation<TVariables, TData>

export function makeMutation<TVariables = any, TData = any>({
  fetchFn,
}: {
  fetchFn: FetchFn<TVariables, TData>
}): UseMutation {
  return function useMyMutation(options) {
    const {data, error, status, variables, mutate} = useMutation(fetchFn, {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    })

    return {
      data,
      error: String(error),
      status,
      variables,
      mutate,
    }
  }
}
