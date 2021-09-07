import {PriceSchema} from './Price'
import {hasBrand, InferSchemaType} from '../schema'
import {pipe} from 'lodash/fp'

export type USD = InferSchemaType<typeof USDSchema>
export const USDSchema = pipe(PriceSchema, hasBrand('USD'))
