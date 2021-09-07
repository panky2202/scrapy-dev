import {IntegerPositiveNumberSchema} from '../value-objects'
import {hasBrand, InferSchemaType, refineMin} from '../schema'
import {pipe} from 'lodash/fp'

export type StoreId = InferSchemaType<typeof StoreIdSchema>
export const StoreIdSchema = pipe(
  IntegerPositiveNumberSchema,
  refineMin(1),
  hasBrand('StoreId'),
)
