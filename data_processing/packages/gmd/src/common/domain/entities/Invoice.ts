import {IntegerPositiveNumberSchema} from '../value-objects'
import {hasBrand, InferSchemaType, refineMin} from '../schema'
import {pipe} from 'lodash/fp'

export type InvoiceId = InferSchemaType<typeof InvoiceIdSchema>
export const InvoiceIdSchema = pipe(
  IntegerPositiveNumberSchema,
  refineMin(1),
  hasBrand('InvoiceId'),
)
