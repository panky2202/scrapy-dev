import {BlobServiceClient, ContainerClient} from '@azure/storage-blob'
import {Readable} from 'stream'
import {
  BlobContainerNameSchema,
  BlobNameSchema,
  BlobStorageProvider,
} from '../ports/BlobStorageProvider'
import {guessBufferFileType} from './guessBufferFileType'
import {URLSchema} from '../../domain/value-objects'

export type AzureStorageConfig = {
  connectionString: string
}

const ONE_MEGABYTE = 1024 * 1024

function storeBufferAzure(
  containerClient: ContainerClient,
): ReturnType<BlobStorageProvider['container']>['storeBuffer'] {
  return async (blobName, data) => {
    const {extension, mime} = await guessBufferFileType(data)
    const nameWithExtension = `${blobName}${extension ? '.' + extension : ''}`

    const stream = new Readable()
    stream.push(data)
    stream.push(null)

    const blobClient = containerClient.getBlockBlobClient(
      BlobNameSchema(nameWithExtension),
    )
    await blobClient.uploadStream(stream, 4 * ONE_MEGABYTE, 20, {
      blobHTTPHeaders: {blobContentType: mime},
    })

    return {
      url: URLSchema(blobClient.url),
    }
  }
}

function fetchBufferAzure(
  containerClient: ContainerClient,
): ReturnType<BlobStorageProvider['container']>['fetchBuffer'] {
  return async (name) => {
    const data = await containerClient.getBlobClient(name).downloadToBuffer()

    return {
      data,
    }
  }
}

function deleteBlobAzure(
  containerClient: ContainerClient,
): ReturnType<BlobStorageProvider['container']>['deleteBlob'] {
  return async (name) => {
    const {succeeded} = await containerClient
      .getBlobClient(name)
      .deleteIfExists()

    return {
      success: succeeded,
    }
  }
}

export const blobStorageProviderAzure = (
  config: AzureStorageConfig,
): BlobStorageProvider => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.connectionString,
  )

  return {
    container: (containerName) => {
      const containerClient = blobServiceClient.getContainerClient(
        BlobContainerNameSchema(containerName),
      )

      return {
        storeBuffer: storeBufferAzure(containerClient),
        fetchBuffer: fetchBufferAzure(containerClient),
        deleteBlob: deleteBlobAzure(containerClient),
      }
    },
  }
}
