import {hasBrand, InferSchemaType} from '../../../../../common/domain/schema'
import {pipe} from 'lodash/fp'
import {
  ImageBuffer,
  ImageBufferSchema,
} from '../../../../../common/domain/value-objects/ImageBuffer'
import sharp, {Metadata, Sharp} from 'sharp'
import assert from 'assert'

export function mbToBytes(x: number): number {
  assert(x >= 0, `negative number of Mb: ${x}`)
  return x * 1e6
}

export function isLessThanResolution(
  imageMetadata: Metadata,
  width: number,
  height: number,
): boolean {
  assert(imageMetadata.width && imageMetadata.height, 'image metadata missing')
  return !(
    imageMetadata.width > width || imageMetadata.height > height
  )
}

export const scaleImageResolution =
  (width: number, height: number) =>
  async (imageBufferPromise: ImageBuffer) => {
    const imageBuffer = await imageBufferPromise
    const image = sharp(imageBuffer)
    if (isLessThanResolution(await image.metadata(), width, height)) {
      return image
    }
    return image.resize(width, height, {fit: sharp.fit.inside})
  }

export const toJpeg =
  (quality: number) =>
  async (imagePromise: Promise<Sharp>): ImageBuffer => {
    const image = await imagePromise
    const buffer = await image
      .jpeg({quality})
      .toFormat('jpeg')
      .withMetadata()
      .toBuffer()
    return ImageBufferSchema(buffer)
  }

const isValidSize = (mb: number) => async (y: ImageBuffer) => {
  const size = (await y).byteLength
  assert(
    size <= mbToBytes(mb),
    `got ${size} expected ${mbToBytes(mb)} not valid size`,
  )
  return y
}
export type ProductImageBuffer = InferSchemaType<
  typeof ProductImageBufferSchema
>
export const ProductImageBufferSchema = pipe(
  ImageBufferSchema,
  isValidSize(20),
  scaleImageResolution(1024, 1024),
  toJpeg(80),
  isValidSize(1),
  hasBrand('ProductImageBuffer'),
)
