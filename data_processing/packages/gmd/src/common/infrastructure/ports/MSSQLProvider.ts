export type SQLResponse = {
  records: any[]
}

export type SQLBulkInsertResponse = {
  rowsAffected: number
}

export type SQLRecordType = (string | number | undefined)[]

export type SQLColumnShape = {
  name: string
  type: 'text' | 'integer' | 'number'
  nullable: boolean
}

export type SQLRequest = {
  input: (name: string, value: number | string) => SQLRequest
  query: (sql: string) => Promise<SQLResponse>
  bulkInsert: (
    tableName: string,
    shape: SQLColumnShape[],
    records: SQLRecordType[],
  ) => Promise<SQLBulkInsertResponse>
}

export type SQLRequestSource = {
  request: () => SQLRequest
  name: () => string
}

export type SQLTransaction = SQLRequestSource & {
  begin: () => Promise<any>
  commit: () => Promise<any>
  rollback: () => Promise<any>
}

export type MSSQLProvider = SQLRequestSource & {
  transaction: () => SQLTransaction
  connect: () => Promise<void>
  close: () => Promise<void>
  name: () => string
}
