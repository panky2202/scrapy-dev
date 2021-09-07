import {
  UserQueryGQL,
  UserQueryVariablesGQL,
} from '../../../../application/types'
import {AsyncDataSource} from '../../../../ui/AsyncDataSource'

export type UseUser = (params: {}) => AsyncDataSource<
  UserQueryVariablesGQL,
  UserQueryGQL['user']
>
