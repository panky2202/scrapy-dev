import {DateTypeSchema} from '../../../../common/domain/value-objects'
import {getScrapingStatusReportKQL} from './getScrapingStatusReportKQL'
import {kqlProviderNode} from '../../../../common/infrastructure/kqlProviderNode'
import dayjs from 'dayjs'
import {hoursToMS} from '../../../../common/utils/hoursToMS'
import {numberSchema} from '../../../../common/domain/schema'

const kqlRequest = kqlProviderNode({
  baseURL: process.env.KQL_BASE_URL,
  headers: {'X-API-Key': process.env.KQL_API_KEY},
  timeout: hoursToMS(1),
})

describe('getScrapingStatusReportKQL', function () {
  it('Should bring data', async function () {
    const f = getScrapingStatusReportKQL({kql: kqlRequest})

    const data = await f({
      since: DateTypeSchema(
        dayjs().subtract(numberSchema(10), 'days').toDate(),
      ),
    })

    expect(data.length).toBeGreaterThan(0)
  }, 18000)
})
