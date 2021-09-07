import {pipe} from 'lodash/fp'
import {CleanNonEmptyStringSchema} from '../CleanNonEmptyString'
import {hasBrand, InferSchemaType, refine} from '../../schema'

export function isValidURL(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
    // eslint-disable-next-line no-empty
  } catch {}
  return false
}

const MAX_URL_LENGTH = 1024

export type URL = InferSchemaType<typeof URLSchema>
export const URLSchema = pipe(
  CleanNonEmptyStringSchema,
  encodeURI,
  refine(
    (x) => x.length <= MAX_URL_LENGTH,
    `should be sorter than ${MAX_URL_LENGTH}`,
  ),
  refine(isValidURL, 'is not a URL'),
  CleanNonEmptyStringSchema,
  hasBrand('URL'),
)
