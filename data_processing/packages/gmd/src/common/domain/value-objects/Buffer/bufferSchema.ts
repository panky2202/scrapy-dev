import {Base64String, Base64StringSchema} from '../Base64String'
import assert from 'assert'
import {safeToString} from '../../schema'
import {DataURL, DataURLSchema} from '../DataURL'

export function bufferSchema(
  x: string | Buffer | Base64String | Pick<DataURL, 'data'>,
): Buffer {
  assert(
    x !== undefined && x !== null,
    `'${safeToString(x)}' not a valid buffer argument`,
  )

  if (x instanceof Buffer) {
    return x
  }

  if (typeof x === 'string') {
    try {
      return Buffer.from(Base64StringSchema(x), 'base64')
    } catch {
      try {
        return bufferSchema(DataURLSchema(x))
      } catch {
        return Buffer.from(x)
      }
    }
  }

  assert(typeof x === 'object' && 'data' in x, 'not a buffer schema')

  return Buffer.from(x?.data, 'base64')
}
