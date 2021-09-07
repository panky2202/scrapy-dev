import {InferSchemaType, objectSchema} from '../../../../common/domain/schema'
import {VendorIdSchema} from '../../../../common/domain/entities'
import {VendorNameSchema} from '../../domain/value-objects/SystemStatusReport'
import {PositiveNumberSchema} from '../../../../common/domain/value-objects'

export type VendorDatabaseItems = InferSchemaType<
  typeof VendorDatabaseItemsSchema
>
export const VendorDatabaseItemsSchema = objectSchema({
  VendorId: VendorIdSchema,
  VendorName: VendorNameSchema,
  Total: PositiveNumberSchema,
  WithUPC: PositiveNumberSchema,
  WithImages: PositiveNumberSchema,
})

export type GetDatabaseStatusReport = () => Promise<VendorDatabaseItems[]>
