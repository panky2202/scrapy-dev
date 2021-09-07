import {pipe} from 'lodash/fp'
import {hasBrand, InferSchemaType, numberSchema, refineMin} from '../../schema'
import {CleanNonEmptyStringSchema} from '../CleanNonEmptyString'
import {roundAsExcel} from '../../../utils/roundAsExcel'

export type IntegerNumber = InferSchemaType<typeof IntegerNumberSchema>
export const IntegerNumberSchema = pipe(
  CleanNonEmptyStringSchema,
  numberSchema,
  (x) => roundAsExcel(x, 0),
  hasBrand('Integer'),
)

export type PositiveNumber = InferSchemaType<typeof PositiveNumberSchema>
export const PositiveNumberSchema = pipe(
  CleanNonEmptyStringSchema,
  numberSchema,
  refineMin(0),
  hasBrand('Positive'),
)

export type IntegerPositiveNumber = InferSchemaType<
  typeof IntegerPositiveNumberSchema
>
export const IntegerPositiveNumberSchema = pipe(
  IntegerNumberSchema,
  PositiveNumberSchema,
  hasBrand('Integer'),
)
