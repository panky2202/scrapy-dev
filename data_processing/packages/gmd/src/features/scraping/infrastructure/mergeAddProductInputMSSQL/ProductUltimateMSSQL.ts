import {
  InferSchemaType,
  objectSchema,
  optional,
} from '../../../../common/domain/schema'
import {VendorIdSchema} from '../../../../common/domain/entities'
import {
  DescriptionSchema,
  ItemNumberSchema,
  UPCSchema,
  URLSchema,
} from '../../../../common/domain/value-objects'
import {AddProductInput} from '../../domain/ports/AddProducts'

export type ProductUltimateMSSQL = InferSchemaType<
  typeof ProductUltimateMSSQLSchema
>
export const ProductUltimateMSSQLSchema = objectSchema({
  VendorId: VendorIdSchema,
  ItemNumber: ItemNumberSchema,
  UpcNumber: optional(UPCSchema),
  ImageUrl: optional(URLSchema),
  Description: optional(DescriptionSchema),
})

export const mapProductUltimateMSSQL_to_AddProductInput = (
  x: ProductUltimateMSSQL,
): AddProductInput => ({
  vendorId: x.VendorId,
  upc: x.UpcNumber,
  itemNo: x.ItemNumber,
  imageUrl: x.ImageUrl,
  description: x.Description,
})

export const mapAddProductInput_to_ProductUltimateMSSQL = (
  x: AddProductInput,
): ProductUltimateMSSQL => ({
  Description: x.description,
  ImageUrl: x.imageUrl,
  UpcNumber: x.upc,
  VendorId: x.vendorId,
  ItemNumber: x.itemNo,
})
