import {pipe} from 'lodash/fp'
import {hasBrand, InferSchemaType, refine} from '../../../domain/schema'
import {CleanNonEmptyStringSchemaOfLength} from '../../../domain/value-objects'

export type TableName = InferSchemaType<typeof TableNameSchema>
export const TableNameSchema = pipe(
  CleanNonEmptyStringSchemaOfLength(50),
  refine((x) => !x.match(/[ |'&;$%@"<>()+,]/g), 'Invalid table name'),
  hasBrand('TableName'),
)
