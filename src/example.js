import findEmails from './index.js'

(async function () {
  const domain = 'uber.com'
  const name = 'peter norton'
  const emails = await findEmails(name, domain)
  console.log(emails)
})().catch(console.log)
