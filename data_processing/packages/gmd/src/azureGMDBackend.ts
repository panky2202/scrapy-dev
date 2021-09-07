/*
Composition Root

This file is a composition root of our app, we create all dependencies here.
Our GQL server application has 2 main dependencies:
- gql schema
- resolvers

To construct the resolvers we need to satisfy their dependencies.
And then satisfy dependencies of these dependencies and so on.
All these resources are created in this single file – composition root.
Only applications have composition root, libraries don't.
*/

import {RequiredAppResolvers} from './common/application/types'
import {azureGQLFunctionApollo} from './common/infrastructure/azureGQLFunctionApollo'
import {graphqlAppSchema} from './common/application/graphqlAppSchema'
import {MSSQLProvider} from './common/infrastructure/ports/MSSQLProvider'
import {mssqlProviderNode} from './common/infrastructure/mssqlProviderNode'
import {GlobalConfig} from './common/application/globalConfig'
import {productsFeatureGQL} from './features/products/application/productsFeatureGQL'
import {findProductsMSSQL} from './features/products/infrastructure/findProductsMSSQL'
import {mergeDeep} from '@engaging-enterprises/basic-utils'
import {userFeatureGQL} from './common/features/user/application/userFeatureGQL'
import {addProductsFeatureGQL} from './features/scraping/application/addProductsFeatureGQL'
import {addProductsMSSQL} from './features/scraping/infrastructure/addProductsMSSQL'
import {addMissingProductFeatureGQL} from './features/missing-products/application/missingProductsFeatureGQL'
import {addMissingProductMSSQL} from './features/missing-products/infastructure/addMissingProductMSSQL'
import {blobStorageProviderAzure} from './common/infrastructure/blobStorageProviderAzure'
import {BlobStorageProvider} from './common/infrastructure/ports/BlobStorageProvider'
import {addMissingProduct} from './features/missing-products/application/addMissingProduct'
import {missingProductImageStoreBuffer} from './features/missing-products/infastructure/missingProductImageStoreBuffer'
import {inMemoryRateLimitProvider} from './common/infrastructure/rateLimitProvider/inMemoryRateLimitProvider'

// Our app features should satisfy the gql schema, eg Features should fill RequiredAppResolvers

const requiredGQLResolvers = (dependencies: {
  sql: MSSQLProvider
  blobStorage: BlobStorageProvider
}): RequiredAppResolvers => {
  const features = [
    productsFeatureGQL({
      ...dependencies,
      findProducts: findProductsMSSQL(dependencies),
    }),

    userFeatureGQL(),

    addProductsFeatureGQL({
      ...dependencies,
      addProducts: addProductsMSSQL(dependencies),
    }),

    addMissingProductFeatureGQL({
      addMissingProduct: addMissingProduct({
        storeBuffer: missingProductImageStoreBuffer(dependencies),
        storeMissingProduct: addMissingProductMSSQL(dependencies),
      }),
    }),
  ]

  return features.reduce(mergeDeep, {Mutation: {}, Query: {}})
}

const DEV_NEXTJS_ORIGIN = 'http://localhost:3000'

export const azureGMDBackend = azureGQLFunctionApollo({
  allowedCorsOrigins: [DEV_NEXTJS_ORIGIN],
  schema: graphqlAppSchema,
  rateLimiter: inMemoryRateLimitProvider({
    limit: 100,
    durationInSeconds: 60,
  }),
  resolvers: requiredGQLResolvers({
    sql: mssqlProviderNode({
      user: GlobalConfig.SQL.userName,
      password: GlobalConfig.SQL.password,
      server: GlobalConfig.SQL.server ?? '',
      port: GlobalConfig.SQL.port,
      database: GlobalConfig.SQL.database,
    }),
    blobStorage: blobStorageProviderAzure({
      connectionString: GlobalConfig.AZURE_STORAGE.connectionString,
    }),
  }),
})
