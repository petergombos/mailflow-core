import dns from 'dns'
import Promise from 'bluebird'

const getMailServers = async (domain) =>
  new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, servers) => {
      if (err) {
        err.message = `Could not found valid MX records for ${domain}`
        reject(err)
      } else {
        resolve(servers)
      }
    })
  })

export default getMailServers
