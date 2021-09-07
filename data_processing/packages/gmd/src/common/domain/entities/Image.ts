import {URLSchema} from '../value-objects'
import {hasBrand, InferSchemaType, objectSchema, optional} from '../schema'
import {pipe} from 'lodash/fp'
import assert from 'assert'

export type Image = InferSchemaType<typeof ImageSchema>
export const ImageSchema = pipe(
  objectSchema({
    url: URLSchema,
    fallbackUrl: optional(URLSchema),
  }),
  hasBrand('Image'),
)

export const imageFromURLArraySchema = (urls: (string | undefined)[]) => {
  const [url, fallbackUrl] = urls
    .map(optional(URLSchema))
    .filter((x) => x !== undefined)
  assert(url, "Can't make product image")
  return ImageSchema({url, fallbackUrl})
}
