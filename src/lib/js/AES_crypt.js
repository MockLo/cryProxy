import crypto from 'crypto-js'
import AES_CONSTANT from '../../config/AES'

/** 偏移量 */
const IV = crypto.enc.Utf8.parse(AES_CONSTANT.IV)

let _last = {
  UUID: null,
  AES_KEY: null
}

/**
 * 获取AES的密钥
 * @param {string} UUID
 */
const getAESKey = UUID => {
  if (!UUID || UUID === _last.UUID) return _last.AES_KEY
  _last.UUID = UUID
  _last.AES_KEY = crypto.enc.Utf8.parse(crypto.MD5(UUID.toLowerCase() + AES_CONSTANT.keySuffix))
  return _last.AES_KEY
}

/**
 * AES加密
 * @param {string} data 要加密的信息
 * @param {string} UUID
 */
const encrypt = (data, UUID) => crypto.AES.encrypt(crypto.enc.Utf8.parse(data), getAESKey(UUID), { iv: IV }).toString()

/**
 * AES解密
 * @param {string} data 要解密的信息
 * @param {string} [UUID]
 */
const decrypt = (data, UUID) => crypto.AES.decrypt(data, getAESKey(UUID), { iv: IV }).toString(crypto.enc.Utf8)

export { encrypt, decrypt }
