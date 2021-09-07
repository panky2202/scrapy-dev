import {NonEmptyStringSchema} from '../NonEmptyString'
import {hasBrand, InferSchemaType} from '../../schema'
import {pipe} from 'lodash/fp'
import {CleanStringSchema} from '../CleanString'

export type CleanNonEmptyString = InferSchemaType<
  typeof CleanNonEmptyStringSchema
>
export const CleanNonEmptyStringSchema = pipe(
  CleanStringSchema,
  NonEmptyStringSchema,
  hasBrand('CleanString'),
)

export const CleanNonEmptyStringSchemaOfLength = (len: number) =>
  pipe(
    CleanNonEmptyStringSchema,
    x => x.substr(0, len),
    CleanNonEmptyStringSchema,
  )
