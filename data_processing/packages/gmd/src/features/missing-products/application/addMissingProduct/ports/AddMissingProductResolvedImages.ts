import {URLSchema} from '../../../../../common/domain/value-objects'
import {
  InferSchemaType,
  objectSchema, optional,
} from '../../../../../common/domain/schema'
import {addMissingProductInputBase} from '../../../domain/ports/AddMissingProduct'

export type AddMissingProductResolvedImagesInput = InferSchemaType<
  typeof AddMissingProductResolvedImagesInputSchema
>
export const AddMissingProductResolvedImagesInputSchema = objectSchema({
  ...addMissingProductInputBase,
  photoFront: URLSchema,
  photoBack: URLSchema,
  photoUpc: optional(URLSchema),
})

export type AddMissingProductResolvedImages = (
  input: AddMissingProductResolvedImagesInput,
) => Promise<void>
