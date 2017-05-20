import latinize from 'latinize'
import Combinatorics from 'js-combinatorics'
import _ from 'lodash'

const createAccountVariations = (name) => {
  const addresses = []
  let variations = []

  // Removing non english characters and converting name to lovercase
  name = latinize(name.toLowerCase())

  // Converting name string to an array
  const nameParts = []
  nameParts[0] = name.trim().replace(/[^a-zA-Z ]/g, '').split(' ')

  // Conuter for variations
  let j = 0

  // Execute cominations on simpla name parts
  let cmb = Combinatorics.permutationCombination(nameParts[0])
  variations[0] = cmb.toArray()

  // Creating initials with normal name parts
  for (let i = 0; i < nameParts[0].length; i++) {
    j++
    nameParts[j] = _.clone(nameParts[0])
    nameParts[j][i] = nameParts[j][i].substring(0, 1)
    cmb = Combinatorics.permutationCombination(nameParts[j])
    variations[j] = cmb.toArray()
  }

  // Creating initials only nameparts
  j++
  nameParts[j] = _.clone(nameParts[0])
  for (let i = 0; i < nameParts[0].length; i++) {
    nameParts[j][i] = nameParts[j][i].substring(0, 1)
  }
  cmb = Combinatorics.permutationCombination(nameParts[j])
  variations[j] = cmb.toArray()

  // Flattening array
  variations = _.flatten(variations)

  // Creating final addresses from variations
  for (let i = 0; i < variations.length; i++) {
    addresses.push(variations[i].join(''))
    addresses.push(variations[i].join('.'))
    addresses.push(variations[i].join('_'))
  }

  return _.sortBy(_.uniq(addresses), (o) => o.length).reverse()
}

export default createAccountVariations
