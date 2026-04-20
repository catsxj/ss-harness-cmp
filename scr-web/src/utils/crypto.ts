import CryptoJS from 'crypto-js'

function decryptByBase64(word: string): string {
  const base64string = CryptoJS.enc.Base64.parse(word)
  return CryptoJS.enc.Utf8.stringify(base64string)
}

function encryptByBase64(word: string): string {
  const src = CryptoJS.enc.Utf8.parse(word)
  return CryptoJS.enc.Base64.stringify(src)
}

const defaultKey = CryptoJS.enc.Utf8.parse(decryptByBase64('Qm9jbG91ZENNUFY1ODchIQ=='))
const iv = CryptoJS.enc.Utf8.parse(decryptByBase64('QmV5b25kQ01QVjU4NyEhIQ=='))
const options = {
  iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
}

export function encrypt(word: string | object, key = defaultKey): string {
  const str = typeof word === 'object' ? JSON.stringify(word) : word
  const srcs = CryptoJS.enc.Utf8.parse(str)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, options)
  return encrypted.toString()
}

export function decrypt(word: string, key = defaultKey): string {
  const decrypted = CryptoJS.AES.decrypt(word, key, options)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export default { encrypt, decrypt, encryptByBase64, decryptByBase64 }
