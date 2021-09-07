import {
  CleanNonEmptyStringSchemaOfLength,
  URL,
} from '../../domain/value-objects'
import {InferSchemaType} from '../../domain/schema'

export type BlobContainerName = InferSchemaType<typeof BlobContainerNameSchema>
export const BlobContainerNameSchema = CleanNonEmptyStringSchemaOfLength(100)

export type BlobName = InferSchemaType<typeof BlobNameSchema>
export const BlobNameSchema = CleanNonEmptyStringSchemaOfLength(100)

export type BlobStoreResults = {
  url: URL
}

export type BlobFetchResults = {
  data: Buffer
}

export type BlobDeleteResults = {
  success: boolean
}

export type BlobStorageContainer = {
  storeBuffer: (name: string, data: Buffer) => Promise<BlobStoreResults>
  fetchBuffer: (name: string) => Promise<BlobFetchResults>
  deleteBlob: (name: string) => Promise<BlobDeleteResults>
}

export type BlobStorageProvider = {
  container: (name: string) => BlobStorageContainer
}
