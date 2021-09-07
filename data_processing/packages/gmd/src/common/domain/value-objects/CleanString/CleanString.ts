import {stripHtml} from 'string-strip-html'
import {hasBrand, InferSchemaType, stringSchema} from '../../schema'
import {pipe} from 'lodash/fp'

export const cleanString = (str: string): string =>
  stripHtml(str)
    .result.replace('\n', ' ')
    .normalize('NFKD')

export type CleanString = InferSchemaType<typeof CleanStringSchema>
export const CleanStringSchema = pipe(
  stringSchema,
  cleanString,
  hasBrand('CleanString'),
)
