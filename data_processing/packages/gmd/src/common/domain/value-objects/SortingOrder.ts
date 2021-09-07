import {InferSchemaType, literalSchema, unionSchema} from '../schema'

export type SortingOrder = InferSchemaType<typeof SortingOrderSchema>
export const SortingOrderSchema = unionSchema([
  literalSchema('DIRECT'),
  literalSchema('REVERSED'),
])
