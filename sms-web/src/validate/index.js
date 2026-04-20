/**
 * Created by Zhang Haijun on 2018/1/25.
 */
const trigger = null
export default {
  required: { required: true, message: '请输入内容', trigger },
  number: { type: 'number', trigger, message: '请输入数字' },
  email: { type: 'email', trigger, message: '请输入正确的邮箱' },
  code: { pattern: /^[a-zA-Z0-9]*$/, message: '仅支持数字、字母', trigger },
  name: { pattern: /^[a-zA-Z0-9-_.]*$/, message: '仅支持数字、字母、下划线、中划线、点', trigger }, // 正整数
  positiveInteger: {
    validator: (rule, value, callback) => {
      if (/^[1-9][0-9]*$/.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正整数'))
      }
    },
    trigger
  },
  password: {
    validator: (rule, value, callback) => {
      const reg = /^[\x21-\x7ea-zA-Z0-9_]{1,18}$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的密码格式'))
      }
    },
    trigger
  },
  pswNoSpace: {
    validator: (rule, value, callback) => {
      const reg = /^[^\s]+$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('密码不能使用空格'))
      }
    },
    trigger
  },
  complexPassword: {
    validator: (rule, value, callback) => {
      const reg = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[~!@#￥%&*()$])[a-zA-Z\d~!@#￥%&*()$]{6,12}$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('密码必须由6-12位大小写字母数字和~!@#￥%&*()$组成'))
      }
    },
    trigger
  },
  // 手机
  mobile: {
    validator: (rule, value, callback) => {
      const reg = /^1[3-9]\d{9}$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的手机号'))
      }
    },
    trigger
  },
  // 座机
  phone: {
    validator: (rule, value, callback) => {
      const reg = /^0\d{2,3}-?\d{7,8}|4\d{2,3}-?\d{7,8}$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的座机号'))
      }
    },
    trigger
  },
  // 手机或者座机
  mobileOrPhone: {
    validator: (rule, value, callback) => {
      const reg = /(^1[3|4|5|7|6|8|9]\d{9}$)|(^0\d{2,3}-?\d{7,8}$)/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的座机号或者手机号'))
      }
    },
    trigger
  },
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
    trigger
  },
  mac: {
    validator: (rule, value, callback) => {
      const reg = /^[A-F0-9]{2}(-[A-F0-9]{2}){5}$|^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的Mac地址'))
      }
    },
    trigger
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
    trigger
  }
}
