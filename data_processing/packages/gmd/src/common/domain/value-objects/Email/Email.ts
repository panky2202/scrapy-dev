import {pipe} from 'lodash/fp'
import {hasBrand, InferSchemaType, refine} from '../../schema'
import {CleanNonEmptyStringSchema} from '../CleanNonEmptyString'

export function isValidEmail(email: string): boolean {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export type Email = InferSchemaType<typeof EmailSchema>
export const EmailSchema = pipe(
  CleanNonEmptyStringSchema,
  refine(isValidEmail, 'is not an email'),
  CleanNonEmptyStringSchema,
  hasBrand('Email'),
)
