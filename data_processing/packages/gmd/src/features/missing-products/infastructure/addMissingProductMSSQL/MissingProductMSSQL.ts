import {CommentSchema} from '../../domain/value-objects/CommentSchema'
import {EmailSchema, UPCSchema} from '../../../../common/domain/value-objects'
import {
  InferSchemaType,
  objectSchema,
  optional,
} from '../../../../common/domain/schema'

export type MissingProductMSSQL = InferSchemaType<
  typeof MissingProductMSSQLSchema
>
export const MissingProductMSSQLSchema = objectSchema({
  UPC: UPCSchema,
  Email: EmailSchema,
  Comments: optional(CommentSchema),
})
