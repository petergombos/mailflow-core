import _ from 'lodash'
import getMailServers from './getMailServers'
import { SMTPChannel } from './smtp'

const validateDomain = async (domain, {
  port = 25,
  fdqn = 'mailflow.io',
  sender = 'info@mailflow.io',
  timeout = 5000
} = {}) => {
  const hosts = await getMailServers(domain)
  const host = _.sortBy(hosts, o => o.priority).map(o => o.exchange)[0]

  const smtp = new SMTPChannel({ host, port })

  const handler = async (res, info) => {
    if (info.isLast && info.code.charAt(0) !== '2') {
      await smtp.write('QUIT\r\n')
      const err = new Error('Server is not cooperating.')
      err.response = res
      err.tested = host
      return Promise.reject(err)
    }
  }

  const catchAllHandler = async (res, info) => {
    if (info.isLast && info.code !== '550') {
      await smtp.write('QUIT\r\n')
      const err = new Error('Domain has catch-all found.')
      err.tested = host
      return Promise.reject(err)
    }
  }

  await smtp.connect({ handler, timeout })
  await smtp.write(`EHLO ${fdqn}\r\n`, { handler })
  await smtp.write(`MAIL FROM:<${sender}>\r\n`, { handler })
  await smtp.write(`RCPT TO:<sdfjhskdjhkfshkspepe@${domain}>\r\n`, { handler: catchAllHandler })
  await smtp.write('QUIT\r\n', { handler })

  return Promise.resolve({
    message: 'MX server is accepting connections, catch-all not found.',
    mxRecords: hosts,
    tested: host,
    isValid: true
  })
}

export default validateDomain
