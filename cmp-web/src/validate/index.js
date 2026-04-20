/**
 * Created by Zhang Haijun on 2018/1/25.
 */
const trigger = null
export default {
  required: { required: true, message: '请输入内容', trigger: trigger },
  number: { type: 'number', trigger: trigger, message: '请输入数字' },
  email: { type: 'email', trigger: trigger, message: '请输入正确的邮箱' },
  code: { pattern: /^[a-zA-Z0-9]*$/, message: '仅支持数字、字母', trigger: trigger },
  name: { pattern: /^[a-zA-Z0-9-_.]*$/, message: '仅支持数字、字母、下划线、中划线、点', trigger: trigger },
  // ip地址
  ip: {
    validator: (rule, value, callback) => {
      const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的IP地址'))
      }
    },
    trigger: trigger
  },
  // 端口号
  port: {
    validator: (rule, value, callback) => {
      const reg = /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的端口号'))
      }
    },
    trigger: trigger
  },
  // 子网掩码
  mask: {
    validator: (rule, value, callback) => {
      const reg = /^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的子网掩码'))
      }
    },
    trigger: trigger
  }
}
