import {
  ProductsQueryGQL,
  ProductsQueryVariablesGQL,
} from '../../../../common/application/types'
import {AsyncDataSource} from '../../../../common/ui/AsyncDataSource'

export type UseProducts = (
  defaultVariables: ProductsQueryVariablesGQL,
) => AsyncDataSource<ProductsQueryVariablesGQL, ProductsQueryGQL['products']>
