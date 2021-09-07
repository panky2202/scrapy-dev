import {
  RateLimitConfig,
  RateLimitInput,
  RateLimitProvider,
} from '../ports/RateLimitProvider'
import {RateLimiterMemory} from 'rate-limiter-flexible'


export function inMemoryRateLimitProvider(
  config: RateLimitConfig,
): RateLimitProvider {
  const {limit, durationInSeconds, errorMessage} = config
  const options = {
    points: limit,
    duration: durationInSeconds,
  }
  const rateLimiter = new RateLimiterMemory(options)

  const throwIfCalledTooOftenWith = async (key: RateLimitInput) => {
    try {
      console.log('inbound request', new Date())
      const result = await rateLimiter.consume(key)
      console.log(result)
    } catch (error) {
      throw new Error(errorMessage ?? 'Rate limit exceeded')
    }
  }
  return {
    throwIfCalledTooOftenWith,
  }
}
