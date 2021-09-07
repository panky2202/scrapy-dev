import {pipe} from 'lodash/fp'
import {hasBrand, InferSchemaType, refineMin, stringSchema} from '../schema'

export type NonEmptyString = InferSchemaType<typeof NonEmptyStringSchema>
export const NonEmptyStringSchema = pipe(
  stringSchema,
  refineMin(1),
  hasBrand('NonEmptyString'),
)
