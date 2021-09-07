/*
Composition Root
*/

import {RequiredFrontendRoutes} from './common/application/types'
import {ConnectedProductsUI} from './features/products/ui/connectedProductsUI'
import {makeProductsGQL} from './features/products/ui/makeProductsGQL'
import {makeApp} from './common/ui/App'
import {makeUserGQL} from './common/features/user/ui/makeUserGQL'
import {home} from './common/features/home/ui/home'
import {makeAddMissingProductGQL} from './features/missing-products/ui/makeAddMissingProductGQL'
import {makeUserQuery} from './features/missing-products/ui/makeUserQuery'
import {ConnectedMissingProductsUI} from './features/missing-products/ui/connectedMissingProductsUI'

function routes(dependencies: {endpoint: string}): RequiredFrontendRoutes {
  return {
    App: makeApp({
      trackingCode: process.env.NEXT_PUBLIC_GOOGLE_TRACKING_CODE,
    }),
    routes: {
      products: ConnectedProductsUI({
        useProducts: makeProductsGQL(dependencies),
        useUser: makeUserGQL(dependencies),
      }),
      missingProducts: ConnectedMissingProductsUI({
        useAddMissingProduct: makeAddMissingProductGQL(dependencies),
        useQuery: makeUserQuery(),
      }),
      home: home(),
    },
  }
}

export const azureGMDFrontend: RequiredFrontendRoutes = routes({
  endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT ?? '',
})
