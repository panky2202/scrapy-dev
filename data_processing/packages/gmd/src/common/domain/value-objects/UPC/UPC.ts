import {hasBrand, InferSchemaType, refine} from '../../schema'
import {CleanNonEmptyStringSchema} from '../CleanNonEmptyString'
import {first, pipe} from 'lodash/fp'

export type UPC = InferSchemaType<typeof UPCSchema>
export const UPCSchema = pipe(
  CleanNonEmptyStringSchema,
  (x: string) => /^\d{5,20}$/.exec(x.replace('-', '').replace(' ', '')),
  refine(x => x !== null && x.length > 0, 'is not a UPC'),
  first,
  hasBrand('NonEmptyString'),
  hasBrand('CleanString'),
  hasBrand('UPC'),
)
