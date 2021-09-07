import {isDate, pipe} from 'lodash/fp'
import {hasBrand, InferSchemaType, refine} from '../../schema'
import {CleanNonEmptyStringSchema} from '../CleanNonEmptyString'

export type DateType = InferSchemaType<typeof DateTypeSchema>
export const DateTypeSchema = pipe(
  (x: string | Date | object) => (isDate(x) ? x : CleanNonEmptyStringSchema(x)),
  (x): Date => new Date(x),
  refine((x) => !isNaN(x as any), 'is not a date'),
  (x): Date => x,
  hasBrand('Date'),
)
