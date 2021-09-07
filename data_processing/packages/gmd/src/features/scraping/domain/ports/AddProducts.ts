import {
  arraySchema,
  InferSchemaType,
  objectSchema,
  optional,
} from '../../../../common/domain/schema'
import {
  DescriptionSchema,
  ItemNumberSchema,
  UPCSchema,
  URLSchema,
} from '../../../../common/domain/value-objects'
import {VendorIdSchema} from '../../../../common/domain/entities'

export type AddProductInput = InferSchemaType<typeof AddProductInputSchema>
export const AddProductInputSchema = objectSchema({
  vendorId: VendorIdSchema,
  itemNo: ItemNumberSchema,
  upc: optional(UPCSchema),
  imageUrl: optional(URLSchema),
  description: optional(DescriptionSchema),
})

export type AddProductsInput = InferSchemaType<typeof AddProductsInputSchema>
export const AddProductsInputSchema = objectSchema({
  products: arraySchema(AddProductInputSchema, 1000, 1),
})

export type AddProducts = (input: AddProductsInput) => Promise<void>
