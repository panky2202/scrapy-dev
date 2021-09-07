import {Context} from '@azure/functions'
import {ApolloServer} from 'apollo-server-azure-functions'
import {
  AzureGQLFunction,
  GQLContext,
  Permission,
} from '../application/ports/AzureGQLFunction'
import {EmailSchema} from '../domain/value-objects'
import {GlobalConfig} from '../application/globalConfig'
import {optional} from '../domain/schema'
import {RateLimitProvider} from './ports/RateLimitProvider'

function mapContext(context: Context): GQLContext {
  const headers: Record<string, string | undefined> = context.req?.headers ?? {}

  context.log(headers)

  const email = optional(EmailSchema)(
    GlobalConfig.env === 'development'
      ? 'test@gmail.com'
      : headers['x-ms-client-principal-name'],
  )

  const permissions = new Set<Permission>()
  if (headers['x-original-url']?.startsWith('/api/system')) {
    permissions.add('System')
  }
  if (GlobalConfig.env === 'development') {
    permissions.add('System')
  }

  context.log('Permissions', GlobalConfig.env, permissions)

  return {
    permissions,
    email,
    log: (...args) => context.log(...args),
  }
}

const rateLimitMiddleware = (rateLimit: RateLimitProvider) => {
  return async (gqlContext: GQLContext) =>
    await rateLimit.throwIfCalledTooOftenWith(gqlContext.email!)
}

const applyMiddleware = async (
  {context}: {context: Context},
  callbacks: Array<(context: GQLContext) => Promise<void>>,
) => {
  const gqlContext = await mapContext(context)
  for (const cb of callbacks) {
    await cb(gqlContext)
  }
  return gqlContext
}

export const azureGQLFunctionApollo: AzureGQLFunction = ({
  rateLimiter,
  schema,
  resolvers,
  allowedCorsOrigins,
}) => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    introspection: true,
    playground: {
      settings: {
        'request.credentials': 'same-origin',
      },
    },
    context: ({context}) =>
      applyMiddleware({context}, [rateLimitMiddleware(rateLimiter)]),
  })

  return server.createHandler(
    allowedCorsOrigins
      ? {
          cors: {
            origin: allowedCorsOrigins,
            credentials: true,
          },
        }
      : undefined,
  )
}
