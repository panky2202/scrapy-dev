import {SQLRequest, SQLRequestSource} from '../ports/MSSQLProvider'

export const addFlavorToSQLRequestSource = (
  mapQuery: (sql: string) => string,
) => {
  function wr(r: SQLRequest): SQLRequest {
    return {
      ...r,
      input: (name, value) => wr(r.input(name, value)),
      query: (sql) => r.query(mapQuery(sql)),
    }
  }

  return function (source: SQLRequestSource): SQLRequestSource {
    return {
      ...source,
      request: () => wr(source.request()),
    }
  }
}
