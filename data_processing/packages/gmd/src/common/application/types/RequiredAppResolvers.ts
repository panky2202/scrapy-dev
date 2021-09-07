import {GQLContext} from '../ports/AzureGQLFunction'
import {ResolversGQL} from './build/gqltypes'

/*
'Resolvers' type is compiled from gql schema with graphql-codegen.
This type defines the shape of our app api – our promise to the UI.
*/
export type RequiredAppResolvers = Required<
  Pick<ResolversGQL<GQLContext>, 'Query' | 'Mutation'>
>
