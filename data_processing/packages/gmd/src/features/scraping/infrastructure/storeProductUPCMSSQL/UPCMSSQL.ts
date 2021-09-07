import {
  ItemNumberSchema,
  UPCSchema,
} from '../../../../common/domain/value-objects'
import {VendorIdSchema} from '../../../../common/domain/entities'
import {InferSchemaType, objectSchema} from '../../../../common/domain/schema'

export type UPCMSSQL = InferSchemaType<typeof UPCMSSQLSchema>
export const UPCMSSQLSchema = objectSchema({
  vendorId: VendorIdSchema,
  itemNo: ItemNumberSchema,
  upc: UPCSchema,
})
