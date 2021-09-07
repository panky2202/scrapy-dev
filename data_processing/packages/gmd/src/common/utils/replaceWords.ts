import {reduce} from 'lodash'

export function replaceWords(
  replace: Record<string, string>,
  str: string,
): string {
  return reduce(
    replace,
    (acc, value, key) =>
      acc.replace(new RegExp('\\b' + key + '\\b', 'g'), value),
    str,
  )
}
