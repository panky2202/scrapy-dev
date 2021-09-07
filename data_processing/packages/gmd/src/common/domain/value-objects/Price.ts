import {PositiveNumberSchema} from './Numbers'
import {hasBrand, InferSchemaType} from '../schema'
import {pipe} from 'lodash/fp'
import {roundAsExcel} from '../../utils/roundAsExcel'

export const PRICE_DIGITS = 2

export type Price = InferSchemaType<typeof PriceSchema>
export const PriceSchema = pipe(
  PositiveNumberSchema,
  (x) => roundAsExcel(x, PRICE_DIGITS),
  PositiveNumberSchema,
  hasBrand('Price'),
)
