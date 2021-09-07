import {EmailSchema, UPCSchema} from '../../../../common/domain/value-objects'
import {
  InferSchemaType,
  objectSchema,
  optional,
} from '../../../../common/domain/schema'
import {CommentSchema} from '../value-objects/CommentSchema'
import {ProductImageBufferSchema} from '../value-objects/ProductImageBuffer/ProductImageBufferSchema'

export const addMissingProductInputBase = {
  upc: UPCSchema,
  email: EmailSchema,
  comment: optional(CommentSchema),
}

export type AddMissingProductInput = InferSchemaType<
  typeof AddMissingProductInputSchema
>
export const AddMissingProductInputSchema = objectSchema({
  ...addMissingProductInputBase,
  photoFrontPromise: ProductImageBufferSchema,
  photoBackPromise: ProductImageBufferSchema,
  photoUPCPromise: optional(ProductImageBufferSchema),
})

export type AddMissingProduct = (input: AddMissingProductInput) => Promise<void>
