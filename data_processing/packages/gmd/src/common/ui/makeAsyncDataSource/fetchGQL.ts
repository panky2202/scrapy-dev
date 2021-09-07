import {FetchFn} from './makeAsyncDataSource'

export const fetchGQL =
  <TVariables, TData>(
    endpoint: string,
    query: string,
  ): FetchFn<TVariables, TData> =>
  async (variables) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({query, variables}),
    })

    const json = await res.json()

    if (json.errors) {
      const {message} = json.errors[0]

      throw new Error(message)
    }

    return json.data
  }
