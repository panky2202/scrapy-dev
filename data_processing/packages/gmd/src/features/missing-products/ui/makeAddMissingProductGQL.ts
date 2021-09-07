import {MissingProductsDocumentGQL} from '../../../common/application/types'
import {UseAddMissingProduct} from './ports/UseAddMissingProduct'
import {fetchGQL} from '../../../common/ui/makeAsyncDataSource/fetchGQL'
import {makeMutation} from '../../../common/ui/makeAsyncDataSource'

export const makeAddMissingProductGQL = ({
  endpoint,
}: {
  endpoint: string
}): UseAddMissingProduct =>
  makeMutation({
    fetchFn: fetchGQL(endpoint, MissingProductsDocumentGQL),
  })
