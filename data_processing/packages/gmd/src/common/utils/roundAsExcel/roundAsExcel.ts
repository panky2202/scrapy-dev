import {round} from 'lodash'

export const roundAsExcel = (n: number, precision?: number) =>
  (n >= 0 ? 1.0 : -1.0) * round(Math.abs(n), precision)
