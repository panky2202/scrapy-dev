import {pipe} from 'lodash/fp'
import {
  arraySchema,
  hasBrand,
  InferSchemaType,
  objectSchema,
} from '../../domain/schema'
import {
  CleanNonEmptyStringSchemaOfLength,
  EmailSchema,
  NonEmptyStringSchema,
} from '../../domain/value-objects'

export type Mail = InferSchemaType<typeof MailSchema>
export const MailSchema = pipe(
  objectSchema({
    to: arraySchema(EmailSchema),
    from: EmailSchema,
    subject: CleanNonEmptyStringSchemaOfLength(200),
    body: NonEmptyStringSchema,
  }),
  hasBrand('Mail'),
)

export type SendMail = (mail: Mail) => Promise<void>
