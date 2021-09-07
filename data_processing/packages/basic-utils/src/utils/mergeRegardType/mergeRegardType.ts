import {DeepPartial} from '@engaging-enterprises/basic-utils'
import {merge, cloneDeep} from 'lodash'

export function mergeDeep<A, B>(a: A, b: B): A & B {
  return merge(cloneDeep(a), b)
}

export function mergeRegardType<T>(object: T, source: DeepPartial<T>): T {
  return merge(cloneDeep(object), source)
}
