import {hasBrand, InferSchemaType, refine, stringSchema} from '../../schema'
import {pipe} from 'lodash/fp'
import {CleanNonEmptyStringSchema} from '../CleanNonEmptyString'

export type _DataURL = {
  mimeType: string
  charset: string
  data: string
}

const dataURLRegex = /^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+{}|~`]+=[a-z0-9-.!#$%*+{}()|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@/?%\s]*?)$/i

export function stringToDataURL(x: string): _DataURL | undefined {
  const xx = stringSchema(x)

  const regexMatches = xx.match(dataURLRegex)
  if (!regexMatches || regexMatches.length !== 5) {
    return
  }

  const charset = regexMatches[2] ?? ''
  return {
    mimeType: regexMatches[1],
    charset: charset.length > 1 ? charset.split(';')[1] : charset,
    data: regexMatches[4],
  }
}

export type DataURL = InferSchemaType<typeof DataURLSchema>
export const DataURLSchema = pipe(
  CleanNonEmptyStringSchema,
  stringToDataURL,
  refine(x => Boolean(x), 'not a data url'),
  hasBrand('DataURL'),
)
