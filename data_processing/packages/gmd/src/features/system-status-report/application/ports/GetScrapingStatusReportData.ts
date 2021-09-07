import {
  InferSchemaType,
  literalSchema,
  objectSchema,
  unionSchema,
} from '../../../../common/domain/schema'
import {VendorIdSchema} from '../../../../common/domain/entities'
import {ParsingErrorSchema} from '../../domain/value-objects/SystemStatusReport'
import {SystemStatusReportFilter} from '../../domain/ports/GetSystemStatusReport'

export type ParsingErrorWithVendor = InferSchemaType<
  typeof ParsingErrorWithVendorSchema
>
export const ParsingErrorWithVendorSchema = objectSchema({
  vendorId: unionSchema([VendorIdSchema, literalSchema('Unknown')]),
  errors: ParsingErrorSchema,
})

export type GetScrapingStatusReportData = (
  filter: SystemStatusReportFilter,
) => Promise<ParsingErrorWithVendor[]>
