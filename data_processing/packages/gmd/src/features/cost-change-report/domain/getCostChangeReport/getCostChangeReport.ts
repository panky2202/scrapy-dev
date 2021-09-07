import {GetCostChangeReport} from '../ports/GetCostChangeReport'
import {
  CostChangeEvent,
  CostChangeReportSchema,
  MAX_COST_CHANGE_EVENTS_IN_REPORT,
} from '../value-objects/CostChangeReport'
import {NonEmptyString} from '../../../../common/domain/value-objects'
import {formatException} from '../../../../common/utils/formatException'

export function getCostChangeReport(deps: {
  sourceName: NonEmptyString
  getCostChangeEvents: () => Promise<CostChangeEvent[]>
}): GetCostChangeReport {
  const {sourceName, getCostChangeEvents} = deps
  return async function () {
    const reportStarted = new Date()
    try {
      const items = await getCostChangeEvents()
      return CostChangeReportSchema({
        sourceName,
        reportStarted,
        reportEnded: new Date(),
        resultsArePartial: items.length >= MAX_COST_CHANGE_EVENTS_IN_REPORT,
        items,
      })
    } catch (e) {
      return CostChangeReportSchema({
        sourceName,
        reportStarted,
        reportEnded: new Date(),
        resultsArePartial: false,
        items: [],
        error: formatException(e),
      })
    }
  }
}
