export type KQLResponse = {
  records: any[]
}

export type KQLRecordType = (string | number | undefined)[]

export type KQLColumnShape = {
  name: string
  type: 'text' | 'integer' | 'number'
  nullable: boolean
}

export type KQLRequest = {
  query: (kql: string) => Promise<KQLResponse>
}

export type KQLProvider = {
  request: () => KQLRequest
  name: () => string
}
