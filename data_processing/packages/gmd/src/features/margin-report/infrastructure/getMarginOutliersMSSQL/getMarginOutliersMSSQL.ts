import {arraySchema} from '../../../../common/domain/schema'
import {SQLRequestSource} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {
  MarginReportItem,
  MarginReportItemSchema,
} from '../../domain/value-objects/MarginReport'
import {MarginOutliersFilter} from '../../domain/ports/GetMarginReport'
import {selectMarginOutliersSQL} from './selectMarginOutliersSQL'

export function getMarginOutliersMSSQL(deps: {sql: SQLRequestSource}) {
  const {sql} = deps
  return async function ({
    since,
    count,
  }: MarginOutliersFilter): Promise<MarginReportItem[]> {
    const results = await sql
      .request()
      .input('since', since.toISOString())
      // !!! 'SELECT TOP @count' could not be passed as a param, we need replace, aware of injection!
      .query(
        `
        ${selectMarginOutliersSQL('MarginReport')}
        SELECT TOP ${count} MarginReport.*
        FROM MarginReport 
        LEFT JOIN DismissedItems
        ON MarginReport.ItemId = DismissedItems.ItemId
        WHERE MarginReport.MarginStatus IS NOT NULL
        AND DismissedItems.ItemID IS NULL
        `,
      )

    return arraySchema(MarginReportItemSchema)(results.records)
  }
}
