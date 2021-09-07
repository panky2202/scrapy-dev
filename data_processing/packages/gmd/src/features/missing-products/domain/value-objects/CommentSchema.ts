import { InferSchemaType } from "../../../../common/domain/schema";
import { CleanNonEmptyStringSchemaOfLength } from "../../../../common/domain/value-objects";

export type Comment = InferSchemaType<typeof CommentSchema>
export const CommentSchema = CleanNonEmptyStringSchemaOfLength(1024)
