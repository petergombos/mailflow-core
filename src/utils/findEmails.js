import validateEmails from './validateEmails'
import createAccountVariations from './createAccountVariations'
import validateDomain from './validateDomain'

const findEmails = async (name, domain) => {
  const posibbleEmails = createAccountVariations(name).map(o => `${o}@${domain}`)
  const mx = await validateDomain(domain)
  return validateEmails(posibbleEmails, mx.tested)
}

export default findEmails
