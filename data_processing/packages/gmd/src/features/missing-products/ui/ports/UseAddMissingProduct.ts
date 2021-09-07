import {
  MissingProductsMutationGQL,
  MissingProductsMutationVariablesGQL,
} from '../../../../common/application/types'
import {AsyncDataMutation} from '../../../../common/ui/AsyncDataSource'

export type UseAddMissingProduct = () => AsyncDataMutation<
  MissingProductsMutationVariablesGQL,
  MissingProductsMutationGQL
>
