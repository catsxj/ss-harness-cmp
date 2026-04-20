/**
 * Created by HaijunZhang on 2018/11/19.
 */
import CryptoJS from 'crypto-js'

// base64解码
function decryptByBase64(word) {
  const base64string = CryptoJS.enc.Base64.parse(word)
  return CryptoJS.enc.Utf8.stringify(base64string)
}

// base64编码
function encryptByBase64(word) {
  const src = CryptoJS.enc.Utf8.parse(word)
  const base64string = CryptoJS.enc.Base64.stringify(src)
  return base64string
}

const defaultKey = CryptoJS.enc.Utf8.parse(decryptByBase64('Qm9jbG91ZENNUFY1ODchIQ=='))
const iv = CryptoJS.enc.Utf8.parse(decryptByBase64('QmV5b25kQ01QVjU4NyEhIQ=='))
const options = {
  iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
}

// 加密方法
export function encrypt(word, key = defaultKey) {
  const srcs = CryptoJS.enc.Utf8.parse(typeof word === 'object' ? JSON.stringify(word) : word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, options)
  return encrypted.toString()
}

// 解密方法
export function decrypt(word, key = defaultKey) {
  const decryptRes = CryptoJS.AES.decrypt(word, key, options)
  return decryptRes.toString(CryptoJS.enc.Utf8)
}

export default {
  encrypt,
  decrypt,
  encryptByBase64,
  decryptByBase64,
}
