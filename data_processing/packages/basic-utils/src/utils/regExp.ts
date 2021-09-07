export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function regExpFromText(text: string, flags: string = 'gi') {
  const pattern = escapeRegExp(`${text}`)
  return new RegExp(pattern, flags)
}
