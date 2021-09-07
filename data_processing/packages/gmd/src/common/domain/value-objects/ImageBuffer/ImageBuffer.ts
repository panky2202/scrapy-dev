import {pipe} from 'lodash/fp'
import {bufferSchema} from '../Buffer'
import {hasBrand, InferSchemaType, refineAsync} from '../../schema'
import sharp from "sharp";

export const ValidImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
  'base64',
)

export async function isValidImageBuffer(buffer: Buffer): Promise<boolean> {
  await sharp(buffer).stats();
  return true;
}

export type ImageBuffer = InferSchemaType<typeof ImageBufferSchema>
export const ImageBufferSchema = pipe(
  bufferSchema,
  refineAsync(isValidImageBuffer, 'not a valid image buffer'),
  hasBrand('ImageBuffer'),
)
