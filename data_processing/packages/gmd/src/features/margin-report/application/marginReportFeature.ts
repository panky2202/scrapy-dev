import {marginReportToHTML} from '../infrastructure/marginReportToHTML'
import {MarginOutliersFilter} from '../domain/ports/GetMarginReport'
import {
  EmailSchema,
  NonEmptyStringSchema,
} from '../../../common/domain/value-objects'
import {GlobalConfig} from '../../../common/application/globalConfig'
import {getMarginReport} from '../domain/getMarginReport'
import {getMarginOutliersMSSQL} from '../infrastructure/getMarginOutliersMSSQL'
import {parseEmailsFromString} from '../infrastructure/parseEmailsFromString'
import {MSSQLProvider} from '../../../common/infrastructure/ports/MSSQLProvider'
import {
  MailSchema,
  SendMail,
} from '../../../common/infrastructure/ports/SendMail'

/*
This feature generates MarginReport and sends it to stakeholders
Refer to MarginReport.ts for additional details
 */
export function marginReportFeature({
  sqlWithBigTimeout,
  sendMail,
}: {
  sqlWithBigTimeout: MSSQLProvider
  sendMail: SendMail
}) {
  const getReport = getMarginReport({
    sourceName: NonEmptyStringSchema(sqlWithBigTimeout.name() ?? 'unknown'),
    getMarginOutliers: getMarginOutliersMSSQL({sql: sqlWithBigTimeout}),
  })

  return async function (filter: MarginOutliersFilter) {
    const report = await getReport(filter)
    const mail = MailSchema({
      to: parseEmailsFromString(GlobalConfig.REPORTING.toEmailsCommaSeparated),
      from: EmailSchema(GlobalConfig.REPORTING.fromEmail),
      subject: 'Margin Report ' + report.sourceName,
      body: marginReportToHTML(report),
    })
    await sendMail(mail)
  }
}
