import {EmailSchema, UPCSchema} from '../../../../common/domain/value-objects'
import {Product} from '../../../../common/domain/entities'
import {
  hasBrand,
  InferSchemaType,
  objectSchema,
} from '../../../../common/domain/schema'
import {pipe} from 'lodash/fp'

export type ProductsInput = InferSchemaType<typeof ProductsInputSchema>
export const ProductsInputSchema = pipe(
  objectSchema({
    upc: UPCSchema,
    email: EmailSchema,
  }),
  hasBrand('ProductsInput'),
)

export type FindProducts = (input: ProductsInput) => Promise<Product[]>
