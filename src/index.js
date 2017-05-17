import validateDomain from 'utils/validateDomain'

(async function () {
  const domain = 'fidesz.hu'
  const validation = await validateDomain(domain)
  console.log(validation)
})().catch(console.log)
