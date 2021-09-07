import assert from 'assert'
import {Branded, BrandName, Primitive} from '../types'
import {mapValues, pickBy} from 'lodash'

export type Schema = (...a: any) => any

export type InferSchemaType<T extends Schema> = ReturnType<T>

export type Unwrap<T> = T extends Promise<infer U>
  ? U
  : T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : T

export function safeToString(x: any): string {
  try {
    return typeof x === 'object' ? JSON.stringify(x) : `${x}`
  } catch {
    return '???'
  }
}

export function numberSchema(value: number | string): number {
  const x = value as unknown

  if (typeof x === 'number') {
    return x
  }

  assert(typeof x === 'string', `'${safeToString(x)}' is not a number`)
  const result = Number.parseFloat(x)
  assert(!isNaN(result), `'${safeToString(x)}' is not a number`)

  return result
}

export function stringSchema(x: string | number | boolean | object): string {
  if (typeof x === 'string') {
    return x
  }

  assert(x !== undefined && x !== null, `'${safeToString(x)}' is not a string`)

  if (typeof x === 'object') {
    return JSON.stringify(x)
  }

  return String(x)
}

export function arraySchema<T extends Schema>(
  shape: T,
  maxLength?: number,
  minLength?: number,
  throwOnInvalidItem: boolean = true,
) {
  return function (ar: Parameters<T>[0][] | string): ReturnType<T>[] {
    const x_ = typeof ar === 'string' ? JSON.parse(ar) : ar
    assert(Array.isArray(x_), `'${safeToString(x_)}' is not an array`)

    const x = maxLength !== undefined ? x_.slice(0, maxLength) : x_

    minLength !== undefined && refineMin(minLength)(x)
    maxLength !== undefined && refineMax(maxLength)(x)
    const results = []
    for (const i of x) {
      try {
        results.push(shape(i))
        // eslint-disable-next-line no-empty
      } catch (e) {
        if (throwOnInvalidItem) {
          throw e
        }
      }
    }
    return results
  }
}

export function booleanSchema(x: string | number | boolean | object) {
  if (typeof x === 'boolean') {
    return x
  }

  if (typeof x === 'number') {
    return x > 0
  }

  if (Array.isArray(x)) {
    return x.length > 0
  }

  if (typeof x === 'object' && x !== null) {
    return Object.keys(x).length > 0
  }

  if (typeof x === 'string') {
    const v = x.toLowerCase().trim()

    if (v.length === 0) {
      return false
    }

    return v !== 'false' && v !== '0'
  }

  throw `'${safeToString(x)}' is not a boolean`
}

export function unionSchema<T extends Schema[]>(shape: T) {
  return function (
    x: Parameters<typeof shape[number]>[0],
  ): ReturnType<typeof shape[number]> {
    const errors: string[] = []

    for (const s of shape) {
      try {
        return s(x)
      } catch (e) {
        errors.push(String('message' in e ? e.message : e))
      }
    }

    throw `Could not parse '${safeToString(x)}': ${errors.join(', and ')}`
  }
}

export function literalSchema<T extends Primitive>(shape: T) {
  return function (x: T): T {
    assert(x === shape, `'${safeToString(x)}' is not ${shape}`)
    return x as T
  }
}

export type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
  ...a: Parameters<T>
) => TNewReturn

export function setDefault<T extends Schema>(
  f: T,
  defaultInput: Parameters<T>[0],
): (arg?: Parameters<T>[0] | null | undefined) => ReturnType<T> {
  return (arg) => {
    return f(arg === undefined || arg === null ? defaultInput : arg)
  }
}

export function optional<T extends Schema>(
  f: T,
): (arg?: any) => ReturnType<T> | undefined {
  return (arg) => {
    try {
      return f(arg)
    } catch {
      return
    }
  }
}

type InferObjectSchemaType<T> = T extends Record<string, Schema>
  ? {[K in keyof T]: InferObjectSchemaType<T[K]>}
  : T extends Schema
  ? ReturnType<T>
  : T

type RequiredKeys<T> = Exclude<
  {[P in keyof T]: undefined extends T[P] ? never : P}[keyof T],
  undefined
>

type ApplyOptional<T extends Record<string, any>> = Partial<T> &
  Pick<T, RequiredKeys<T>>

type InferObjectSchemaArgs<T> = T extends Record<string, Schema>
  ? ApplyOptional<{[K in keyof T]: InferObjectSchemaArgs<T[K]>}>
  : T extends Schema
  ? InferObjectSchemaArgs<Parameters<T>[0]>
  : T

export function objectSchema<T extends Record<string, Schema>>(shape: T) {
  return function (
    obj: InferObjectSchemaArgs<T> | string,
  ): InferObjectSchemaType<T> {
    const x = typeof obj === 'string' ? JSON.parse(obj) : obj

    assert(
      typeof x === 'object' && x !== null,
      `'${safeToString(x)}' is not an object`,
    )

    const results = mapValues(shape, (f, key) => {
      try {
        return f(x[key])
      } catch (e) {
        throw `${key} -> ${e}`
      }
    })

    // @ts-ignore
    return pickBy(results, (x) => x !== undefined && x !== null)
  }
}

/*
 * @deprecated
 */
export const fieldName =
  <T extends Schema, U extends keyof ReturnType<T>>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    schema: T,
  ) =>
  (field: U) => {
    return field
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hasBrand<Name extends BrandName>(brand: Name) {
  return <T>(
    x: T,
  ): T extends Promise<infer U>
    ? Promise<Branded<U, Name>>
    : Branded<T, Name> => {
    // @ts-ignore
    return x
  }
}

export const refine =
  <T>(isValid: (x: T) => boolean, errorMessage: string = 'is not valid') =>
  (x: T): T => {
    assert(isValid(x), `'${safeToString(x)}' ${errorMessage}`)
    return x
  }

export const refineAsync =
  <T>(
    isValid: (x: T) => Promise<boolean>,
    errorMessage: string = 'is not valid',
  ) =>
  async (x: T): Promise<T> => {
    const valid = await isValid(x)
    return refine<T>(() => valid, errorMessage)(x)
  }

const getLength = (x: number | any[] | string) =>
  typeof x === 'string'
    ? x.length
    : typeof x === 'number'
    ? x
    : Array.isArray(x)
    ? x.length
    : 0

export const refineMin =
  (min: number) =>
  <T extends number | any[] | string>(x: T): T =>
    refine((y: T) => getLength(y) >= min, `should be bigger than ${min}`)(x)

export const refineMax =
  (max: number) =>
  <T extends number | any[] | string>(x: T): T =>
    refine((y: T) => getLength(y) <= max, `should be smaller than ${max}`)(x)
