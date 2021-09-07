import {
  ProductsDocumentGQL,
  ProductsQueryGQL,
  ProductsQueryVariablesGQL,
} from '../../../common/application/types'
import {makeAsyncDataSource} from '../../../common/ui/makeAsyncDataSource'
import {UseProducts} from './ports/UseProducts'
import {fetchGQL} from '../../../common/ui/makeAsyncDataSource/fetchGQL'
import {flatten} from 'lodash'

export function makeProductsGQL({endpoint}: {endpoint: string}): UseProducts {
  return makeAsyncDataSource({
    key: 'products',
    fetchFn: fetchGQL<ProductsQueryVariablesGQL, ProductsQueryGQL>(
      endpoint,
      ProductsDocumentGQL,
    ),
    enabledFn: ({variables: {input}}) => (input?.upc ?? '').length > 0,
    extractResultsFn: (pages) => flatten(pages?.map((page) => page?.products)),
  })
}
