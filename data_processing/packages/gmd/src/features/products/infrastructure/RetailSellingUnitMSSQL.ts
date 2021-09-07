import {CleanNonEmptyStringSchema} from '../../../common/domain/value-objects'
import {hasBrand, InferSchemaType, refine} from '../../../common/domain/schema'
import {pipe} from 'lodash/fp'

export const _sellingUnitToNumber = (unit: string): number | undefined => {
  const tunit = unit.trim()
  if (tunit === '1 Unit') {
    return 1.0
  }

  const parts = tunit.split(' ')
  if (parts.length !== 3 || parts[1] !== 'FOR') {
    return
  }

  const a = Number.parseInt(parts[0], 10)
  const b = Number.parseInt(parts[2], 10)

  if (isNaN(a) || isNaN(b)) {
    return
  }

  return b / a
}

export type RetailSellingUnitMSSQL = InferSchemaType<
  typeof RetailSellingUnitMSSQLSchema
>
export const RetailSellingUnitMSSQLSchema = pipe(
  CleanNonEmptyStringSchema,
  refine((x) => Boolean(_sellingUnitToNumber(x))),
  hasBrand('RetailSellingUnitMSSQL'),
)
