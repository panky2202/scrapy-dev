export function formatException(e: any) {
  return e?.stack
    ? e.stack
    : typeof e.toString === 'function'
    ? e.toString()
    : e
}
