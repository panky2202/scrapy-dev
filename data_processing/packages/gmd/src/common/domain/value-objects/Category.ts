import {InferSchemaType} from '../schema'
import {CleanNonEmptyStringSchemaOfLength} from './CleanNonEmptyString'

export type Category = InferSchemaType<typeof CategorySchema>
export const CategorySchema = CleanNonEmptyStringSchemaOfLength(100)
