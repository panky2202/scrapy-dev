import {RequiredAppResolvers} from '../../../application/types'

export type UserFeature = {
  Mutation: {},
  Query: Pick<RequiredAppResolvers['Query'], 'user'>
}

export function userFeatureGQL(): UserFeature {
  return {
    Mutation: {},
    Query: {
      user: async (_, __, {email}) => ({email: email ?? 'unknown'}),
    },
  }
}
