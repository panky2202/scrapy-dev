export type UseQuery<T> = () => {
  query: Record<keyof T, string | undefined | string[]>
}
