import findEmails from 'utils/findEmails'

(async function () {
  const domain = 'kriek.hu'
  const name = 'peter gombos'
  const emails = await findEmails(name, domain)
  console.log(emails)
})().catch(console.log)
