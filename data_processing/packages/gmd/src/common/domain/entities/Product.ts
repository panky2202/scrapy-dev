import {
  CategorySchema,
  CleanNonEmptyStringSchema,
  DescriptionSchema,
  ItemNumberSchema,
  UPCSchema,
  USDSchema,
} from '../value-objects'
import {VendorSchema} from './Vendor'
import {ImageSchema} from './Image'
import {
  arraySchema,
  hasBrand,
  InferSchemaType,
  objectSchema,
  optional,
} from '../schema'
import {pipe} from 'lodash/fp'

export type ProductId = InferSchemaType<typeof ProductIdSchema>
export const ProductIdSchema = pipe(
  CleanNonEmptyStringSchema,
  hasBrand('ProductId'),
)

export type Product = InferSchemaType<typeof ProductSchema>
export const ProductSchema = pipe(
  objectSchema({
    vendor: VendorSchema,
    itemNo: ItemNumberSchema,
    upc: arraySchema(UPCSchema),
    description: optional(DescriptionSchema),
    category: optional(CategorySchema),
    image: optional(ImageSchema),
    price: optional(USDSchema),
  }),
  hasBrand('Product'),
)
