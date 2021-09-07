import {arraySchema} from '../../../../common/domain/schema'
import {SQLRequestSource} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {selectCostChangeEventsSQL} from './selectCostChangeEventsSQL'
import {
  CostChangeEvent,
  CostChangeEventSchema,
  MAX_COST_CHANGE_EVENTS_IN_REPORT,
} from '../../domain/value-objects/CostChangeReport'
import {TableName} from '../../../../common/infrastructure/sql'

export function getCostChangeEventsMSSQL(deps: {
  sql: SQLRequestSource
  resultTable: TableName
}) {
  const {sql, resultTable} = deps
  return async function (): Promise<CostChangeEvent[]> {
    const results = await sql.request().query(
      `
        ${selectCostChangeEventsSQL(resultTable)}
        SELECT TOP ${MAX_COST_CHANGE_EVENTS_IN_REPORT} ${resultTable}.*
        FROM ${resultTable}
        ORDER BY ${resultTable}.InvoiceDate DESC, ${resultTable}.InvoiceId DESC
        `,
    )

    return arraySchema(CostChangeEventSchema)(results.records)
  }
}
