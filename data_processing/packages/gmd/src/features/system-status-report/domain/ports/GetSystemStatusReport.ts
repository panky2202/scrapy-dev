import {DateTypeSchema} from '../../../../common/domain/value-objects'
import {InferSchemaType, objectSchema} from '../../../../common/domain/schema'
import {SystemStatusReport} from '../value-objects/SystemStatusReport'

export type SystemStatusReportFilter = InferSchemaType<
  typeof SystemStatusReportFilterSchema
>
export const SystemStatusReportFilterSchema = objectSchema({
  since: DateTypeSchema,
})

export type GetSystemStatusReport = (
  filter: SystemStatusReportFilter,
) => Promise<SystemStatusReport>
