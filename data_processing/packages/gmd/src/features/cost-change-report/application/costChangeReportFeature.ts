import {
  EmailSchema,
  NonEmptyStringSchema,
} from '../../../common/domain/value-objects'
import {GlobalConfig} from '../../../common/application/globalConfig'
import {parseEmailsFromString} from '../infrastructure/parseEmailsFromString'
import {getCostChangeReport} from '../domain/getCostChangeReport'
import {MSSQLProvider} from '../../../common/infrastructure/ports/MSSQLProvider'
import {
  MailSchema,
  SendMail,
} from '../../../common/infrastructure/ports/SendMail'
import {costChangeReportToHTML} from '../infrastructure/costChangeReportToHTML'
import {getCostChangeEventsMSSQL} from '../infrastructure/getCostChangeEventsMSSQL'
import {TableNameSchema} from '../../../common/infrastructure/sql'

/*
This feature generates CostChangeReport and sends it to stakeholders
Refer to CostChangeReport.ts for additional details
 */
export function costChangeReportFeature({
  sqlWithBigTimeout,
  sendMail,
}: {
  sqlWithBigTimeout: MSSQLProvider
  sendMail: SendMail
}) {
  const getReport = getCostChangeReport({
    sourceName: NonEmptyStringSchema(sqlWithBigTimeout.name() ?? 'unknown'),
    getCostChangeEvents: getCostChangeEventsMSSQL({
      sql: sqlWithBigTimeout,
      resultTable: TableNameSchema('CostChangeReport'),
    }),
  })

  return async function () {
    const report = await getReport()
    const mail = MailSchema({
      to: parseEmailsFromString(GlobalConfig.REPORTING.toEmailsCommaSeparated),
      from: EmailSchema(GlobalConfig.REPORTING.fromEmail),
      subject: 'Cost Change Report ' + report.sourceName,
      body: costChangeReportToHTML(report),
    })
    await sendMail(mail)
  }
}
