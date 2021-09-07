import {IntegerPositiveNumberSchema} from '../value-objects'
import {hasBrand, InferSchemaType, objectSchema, refineMin} from '../schema'
import {pipe} from 'lodash/fp'

export type VendorId = InferSchemaType<typeof VendorIdSchema>
export const VendorIdSchema = pipe(
  IntegerPositiveNumberSchema,
  refineMin(0),
  hasBrand('VendorId'),
)

export type Vendor = InferSchemaType<typeof VendorSchema>
export const VendorSchema = pipe(
  objectSchema({
    id: VendorIdSchema,
  }),
  hasBrand('Vendor'),
)
