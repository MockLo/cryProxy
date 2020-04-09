const REG = {
  json: /application\/json/i,
  image: /image\//i,
  urlencoded: /\/x-www-form-urlencoded/i,
  text: /text\//i,
  font: /application\/font-/i
}

/**
 * @param {string} contentType
 */
const getMimeType = (contentType) => {
  for (const key in REG) {
    if (REG.hasOwnProperty(key)) {
      if (REG[key].test(contentType)) return key
    }
  }
  return 'other'
}

export { getMimeType }
