const trigger = null
export default {
  datebasePassword: {
    validator: (rule, value, callback) => {
      const reg = /(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()+_-]).{8,32}/
      if (!value || reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入8-32位，必须同时包含大小写字母、数字、特殊字符[!@#$%^&*()+_-]'))
      }
    },
    trigger: trigger
  }
}
