import {
  UserDocumentGQL,
  UserQueryGQL,
  UserQueryVariablesGQL,
} from '../../../application/types'
import {makeAsyncDataSource} from '../../../ui/makeAsyncDataSource'
import {UseUser} from './ports/UseUser'
import {fetchGQL} from '../../../ui/makeAsyncDataSource/fetchGQL'

export function makeUserGQL({endpoint}: {endpoint: string}): UseUser {
  return makeAsyncDataSource({
    key: 'user',
    fetchFn: fetchGQL<UserQueryVariablesGQL, UserQueryGQL>(
      endpoint,
      UserDocumentGQL,
    ),
    enabledFn: () => true,
    extractResultsFn: (pages) => (pages ? pages[0].user : undefined),
  })
}
