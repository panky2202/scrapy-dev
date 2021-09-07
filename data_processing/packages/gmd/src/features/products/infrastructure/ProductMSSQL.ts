import {
  DescriptionSchema,
  ItemNumberSchema,
  PositiveNumberSchema,
  UPCSchema,
  URLSchema,
} from '../../../common/domain/value-objects'
import {RetailSellingUnitMSSQLSchema} from './RetailSellingUnitMSSQL'
import {VendorIdSchema} from '../../../common/domain/entities'
import {
  hasBrand,
  InferSchemaType,
  objectSchema,
  optional,
} from '../../../common/domain/schema'
import {pipe} from 'lodash/fp'

export type ProductMSSQL = InferSchemaType<typeof ProductMSSQLSchema>
export const ProductMSSQLSchema = pipe(
  objectSchema({
    vendorId: VendorIdSchema,
    itemNo: ItemNumberSchema,
    upc: optional(UPCSchema),
    description: optional(DescriptionSchema),
    imageUrl: optional(URLSchema),
    ultimageRetailSellingUnit: optional(RetailSellingUnitMSSQLSchema),
    ultimateMstrRetailPrice: optional(PositiveNumberSchema),
    individualRetailSellingUnit: optional(RetailSellingUnitMSSQLSchema),
    individualMstrRetailPrice: optional(PositiveNumberSchema),
  }),
  hasBrand('ProductMSSQL'),
)
