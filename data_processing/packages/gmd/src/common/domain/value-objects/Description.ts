import {InferSchemaType} from '../schema'
import {CleanNonEmptyStringSchemaOfLength} from './CleanNonEmptyString'

export type Description = InferSchemaType<typeof DescriptionSchema>
export const DescriptionSchema = CleanNonEmptyStringSchemaOfLength(1024)
