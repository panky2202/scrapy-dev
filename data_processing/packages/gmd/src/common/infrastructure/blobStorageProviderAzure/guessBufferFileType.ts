import {fromBuffer} from 'file-type'

export type FileTypeResult = {
  mime: string
  extension?: string
}

export async function guessBufferFileType(
  data: Buffer,
): Promise<FileTypeResult> {
  const result = await fromBuffer(data)

  if (!result) {
    return {
      mime: 'application/octet-stream',
    }
  }

  return {
    mime: result.mime,
    extension: result.ext,
  }
}
