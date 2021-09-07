import {CleanNonEmptyStringSchemaOfLength} from './CleanNonEmptyString'
import {hasBrand, InferSchemaType} from '../schema'
import {pipe} from 'lodash/fp'

export type ItemNumber = InferSchemaType<typeof ItemNumberSchema>
export const ItemNumberSchema = pipe(
  CleanNonEmptyStringSchemaOfLength(100),
  hasBrand('ItemNumber'),
)
