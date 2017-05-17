import { SMTPChannel } from './smtp'

const validateEmails = async (emails, host, {
  port = 25,
  fdqn = 'mailflow.io',
  sender = 'info@mailflow.io',
  timeout = 5000
} = {}) => {
  const smtp = new SMTPChannel({ host, port })

  const handler = async (res, info) => {
    if (info.isLast && info.code.charAt(0) !== '2') {
      await smtp.write('QUIT\r\n')
      const err = new Error('Server is not cooperating.')
      err.response = res
      err.tested = host
      err.code = 'SERVER'
      return Promise.reject(err)
    }
  }

  const catchAllEmail = `sdfjhskdjhkfshkspepe@${emails[0].split('@')[1]}`
  const catchAllHandler = async (res, info) => {
    if (info.isLast && info.code !== '550') {
      await smtp.write('QUIT\r\n')
      const err = new Error('Domain has catch-all.')
      err.tested = host
      err.code = 'CATCHALL'
      return Promise.reject(err)
    }
  }

  const validAddresses = []
  const isAccepted = (res, { code } = {}, email) => {
    if (code === '250' || code === '450') {
      validAddresses.push(email)
    }
  }

  await smtp.connect({ handler, timeout })
  await smtp.write(`EHLO ${fdqn}\r\n`, { handler })
  await smtp.write(`MAIL FROM:<${sender}>\r\n`, { handler })
  await smtp.write(`RCPT TO:<${catchAllEmail}>\r\n`, { handler: catchAllHandler })

  for (let i = 0; i < emails.length; i++) {
    await smtp.write(`RCPT TO:<${emails[i]}>\r\n`, { handler: (...args) => isAccepted(...args, emails[i]) })
  }

  await smtp.write('QUIT\r\n', { handler })

  return Promise.resolve(validAddresses)
}

export default validateEmails
