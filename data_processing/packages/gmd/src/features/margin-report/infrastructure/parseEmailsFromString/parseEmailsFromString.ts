import {Email, EmailSchema} from '../../../../common/domain/value-objects'
import {arraySchema} from '../../../../common/domain/schema'

export const parseEmailsFromString = (str: string): Email[] =>
  arraySchema(EmailSchema, undefined, undefined, false)(str.split(/[,;]/))
