import {IntegerPositiveNumberSchema} from './Numbers'
import {hasBrand, InferSchemaType, refineMax, refineMin} from '../schema'
import {pipe} from 'lodash/fp'

export type Year = InferSchemaType<typeof YearSchema>
export const YearSchema = pipe(
  IntegerPositiveNumberSchema,
  refineMin(1900),
  refineMax(99999),
  IntegerPositiveNumberSchema,
  hasBrand('Year'),
)
