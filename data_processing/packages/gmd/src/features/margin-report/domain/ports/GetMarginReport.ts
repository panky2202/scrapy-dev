import {
  DateTypeSchema,
  IntegerPositiveNumberSchema,
} from '../../../../common/domain/value-objects'
import {MarginReport} from '../value-objects/MarginReport'
import {InferSchemaType, objectSchema} from '../../../../common/domain/schema'

export type MarginOutliersFilter = InferSchemaType<
  typeof MarginOutliersFilterSchema
>
export const MarginOutliersFilterSchema = objectSchema({
  count: IntegerPositiveNumberSchema,
  since: DateTypeSchema,
})

export type GetMarginReport = (
  filter: MarginOutliersFilter,
) => Promise<MarginReport>
