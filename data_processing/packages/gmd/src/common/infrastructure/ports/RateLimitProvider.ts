export type RateLimitInput = string | number

export type RateLimitProvider = {
  throwIfCalledTooOftenWith: (key: RateLimitInput) => Promise<void>
}

export type RateLimitConfig = {
  limit: number
  durationInSeconds: number
  errorMessage?: string
}
