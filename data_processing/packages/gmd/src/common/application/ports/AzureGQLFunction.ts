import {DocumentNode, GraphQLResolveInfo} from 'graphql'
import {AzureFunction} from '@azure/functions'
import {Email} from '../../domain/value-objects'
import {Logger} from '../../domain/ports/Logger'
import {RateLimitProvider} from "../../infrastructure/ports/RateLimitProvider";

export type GQLResolver<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult

export type GQLResolvers<
  TResult = any,
  TParent = any,
  TContext = GQLContext,
  TArgs = any
> = Record<
  string,
  Record<string, GQLResolver<TResult, TParent, TContext, TArgs>>
>

export type Permission = 'System'

export type GQLContext = {
  email?: Email
  permissions: Set<Permission>
  log: Logger
}

export type AzureGQLFunction = (deps: {
  schema: DocumentNode | DocumentNode[]
  rateLimiter: RateLimitProvider
  resolvers: GQLResolvers
  allowedCorsOrigins?: string | string[]
}) => AzureFunction
