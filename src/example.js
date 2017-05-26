import findEmails from './index.js'

(async function () {
  const domain = 'spacex.com'
  const name = 'elon musk'
  const emails = await findEmails(name, domain, { verbose: true })
  console.log(emails)
})().catch(console.log)
