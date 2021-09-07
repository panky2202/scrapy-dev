import {hasBrand, InferSchemaType, refine} from '../../schema'
import {pipe} from 'lodash/fp'
import {CleanStringSchema} from '../CleanString'

const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/

export function isBase64String(x: string): boolean {
  return base64regex.test(x)
}

export type Base64String = InferSchemaType<typeof Base64StringSchema>
export const Base64StringSchema = pipe(
  CleanStringSchema,
  refine(isBase64String, 'not a base64 string'),
  CleanStringSchema,
  hasBrand('Base64String'),
)
