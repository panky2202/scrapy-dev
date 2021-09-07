import {MailService} from '@sendgrid/mail'
import {SendMail} from './ports/SendMail'

export function sendMailAzure(apiKey: string): SendMail {
  const service = new MailService()
  service.setApiKey(apiKey)
  return async function ({to, from, subject, body}) {
    await service.send({to, from, subject, html: body})
  }
}
