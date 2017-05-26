import { SMTPChannel } from './smtp'

const validateEmails = async (emails, host, {
  port = 25,
  fdqn = 'mailflow.io',
  sender = 'info@mailflow.io',
  timeout = 5000,
  verbose = false
} = {}) => {
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

  const catchAllEmail = `sdfjhskdjhkfshks${emails[0].split('@')[0]}@${emails[0].split('@')[1]}`
  const catchAllHandler = async (res, info) => {
    if (verbose) {
      console.log(res, info.code)
    }
    if (info.isLast && info.code !== '550') {
      await smtp.write('QUIT\r\n')
      const err = new Error('Domain has catch-all.')
      err.tested = host
      err.code = 'CATCHALL'
      return Promise.reject(err)
    }
  }

  const validAddresses = []
  const isAccepted = (res, { code, isLast } = {}, email) => {
    if (verbose) {
      console.log(res, code)
    }
    if (isLast && (code === '250' || code === '450')) {
      validAddresses.push(email)
    }
  }

  await smtp.connect({ handler, timeout })
  await write(`EHLO ${fdqn}\r\n`, { handler }, verbose)
  await write(`MAIL FROM:<${sender}>\r\n`, { handler }, verbose)
  await write(`RCPT TO:<${catchAllEmail}>\r\n`, { handler: catchAllHandler }, verbose)

  for (let i = 0; i < emails.length; i++) {
    await write(`RCPT TO:<${emails[i]}>\r\n`, { handler: (...args) => isAccepted(...args, emails[i]) }, verbose)
  }

  await write('QUIT\r\n', { handler }, verbose)

  return Promise.resolve(validAddresses)
}

export default validateEmails
