export type ReplaceFunParams<
  T extends (params: any) => any,
  Params extends keyof Parameters<T>[0],
  With
> = (params: Omit<Parameters<T>[0], Params> & With) => ReturnType<T>
