export type FetchingStatus = 'success' | 'error' | 'loading' | 'idle'

export type VariablesState<Input> = {
  variables: Input
  setVariables: (input: Input) => void
}

type AsyncDataBase<T> = {
  data?: T
  error?: string
  status: FetchingStatus
}

export type AsyncData<T> = AsyncDataBase<T> & {
  fetchNext: () => void
  hasNext: boolean
}

export type AsyncDataSource<Input, T> = VariablesState<Input> & AsyncData<T>

export type AsyncDataMutation<Input, T> = AsyncDataBase<T> & {
  mutate: (input: Input) => void
}
