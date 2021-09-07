import {VendorIdSchema} from '../../../common/domain/entities'
import {InferSchemaType, objectSchema,} from '../../../common/domain/schema'
import {pipe} from 'lodash/fp'
import {CleanStringSchema} from "../../../common/domain/value-objects/CleanString";

export type VendorMSSQL = InferSchemaType<typeof VendorMSSQLSchema>
export const VendorMSSQLSchema = pipe(
  objectSchema({
    id: VendorIdSchema,
    displayName: CleanStringSchema,
  }),
)
