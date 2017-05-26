import _ from 'lodash'
import getMailServers from './getMailServers'
import { SMTPChannel } from './smtp'

const validateDomain = async (domain, {
  port = 25,
  fdqn = 'mailflow.io',
  sender = 'info@mailflow.io',
  timeout = 5000,
  verbose = false
} = {}) => {
  const hosts = await getMailServers(domain)
  const host = _.sortBy(hosts, o => o.priority).map(o => o.exchange)[0]

  const smtp = new SMTPChannel({ host, port })

  const write = (command, options = {}, verbose) => {
    if (verbose) {
      console.log(command)
    }
    return smtp.write(command, options)
  }

  const handler = async (res, info) => {
    if (verbose) {
      console.log(res, info.code)
    }
    if (info.isLast && info.code.charAt(0) !== '2') {
      const err = new Error('Server is not cooperating.')
      err.response = res
      err.tested = host
      err.code = 'SERVER'
      return Promise.reject(err)
    }
  }

  const catchAllHandler = async (res, info) => {
    if (verbose) {
      console.log(res, info.code)
    }
    if (info.isLast && info.code !== '550') {
      await write('QUIT\r\n')
      const err = new Error('Domain has catch-all.')
      err.tested = host
      err.code = 'CATCHALL'
      return Promise.reject(err)
    }
  }

  await smtp.connect({ handler, timeout })
  await write(`EHLO ${fdqn}\r\n`, { handler })
  await write(`MAIL FROM:<${sender}>\r\n`, { handler })
  await write(`RCPT TO:<sdfjhskdjhkfshkspepe@${domain}>\r\n`, { handler: catchAllHandler })
  await write('QUIT\r\n', { handler })

  return Promise.resolve({
    message: 'MX server is accepting connections, catch-all not found.',
    mxRecords: hosts,
    tested: host,
    isValid: true
  })
}

export default validateDomain
