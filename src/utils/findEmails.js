import validateEmails from './validateEmails'
import createAccountVariations from './createAccountVariations'
import validateDomain from './validateDomain'

const findEmails = async (name, domain, options) => {
  const posibbleEmails = createAccountVariations(name).map(o => `${o}@${domain}`)
  const mx = await validateDomain(domain, options)
  return validateEmails(posibbleEmails, mx.tested, options)
}

export default findEmails
