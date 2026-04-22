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
  blankName: { pattern: /^[a-zA-Z 0-9-_.]+$/, message: '不可输入中文', trigger: trigger },
  spec: { pattern: /^[0-9]+\/[0-9]+\/[0-9]+$/, message: '请输入长/宽/高，中间以斜杠隔开', trigger: trigger },
  vcName: { pattern: /^[a-zA-Z0-9]{5,22}$/, message: '请按提示输入正确格式' },
  awsName: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9-]*$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('仅支持数字、大小写字母、中划线'))
      }
    },
    trigger: trigger
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
  // 英文
  english: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z]+$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入英文'))
      }
    },
    trigger: trigger
  },
  noChinese: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9-_.]*$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('仅支持数字、字母、下划线、中划线、点'))
      }
    },
    trigger: trigger
  },
  aliName: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z][a-zA-Z0-9_-]*$/
      if (reg.test(value) && !value.startsWith('http://') && !value.startsWith('https://')) {
        callback()
      } else {
        callback(new Error('不能以特殊字符、数字、http:://、https://开头'))
      }
    },
    trigger: trigger
  },
  muchDns: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let i = ''
        let result = ''
        let c = ''
        for (i = 0; i < value.length; i++) {
          c = value.substr(i, 1)
          if (c == '\n') {
            result = result + '/'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('/')
        const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))?$/
        result.forEach(function(item) {
          if (!reg.test(item)) {
            callback(new Error('请按照提示输入'))
          }
        })
        callback()
      }
    },
    trigger: trigger
  },
  v6MuchDns: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let i = ''
        let result = ''
        let c = ''
        for (i = 0; i < value.length; i++) {
          c = value.substr(i, 1)
          if (c == '\n') {
            result = result + '/'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('/')
        const reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
        result.forEach(function(item) {
          if (!reg.test(item)) {
            callback(new Error('请按照提示输入'))
          }
        })
        callback()
      }
    },
    trigger: trigger
  },
  routerFilter: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let i = ''
        let result = ''
        let c = ''
        for (i = 0; i < value.length; i++) {
          c = value.substr(i, 1)
          if (c == '\n') {
            result = result + '|'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('|')
        const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))$/
        result.forEach(function(item) {
          const list = item.split(',')
          const listOne = list[0].split('/')
          if (!reg.test(listOne[0])) {
            callback(new Error('请按照提示输入'))
          }
          if (parseInt(listOne[1]) < 0 || parseInt(listOne[1]) >= 32) {
            callback(new Error('请按照提示输入'))
          }
          if (!reg.test(list[1])) {
            callback(new Error('请按照提示输入'))
          }
        })
        callback()
      }
    },
    trigger: trigger
  },
  ipPool: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let i,
          result = '',
          c
        const testList = []
        for (i = 0; i < value.length; i++) {
          c = value.substr(i, 1)
          if (c == '\n') {
            result = result + '/'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('/')
        result.forEach(function(item) {
          item.split('-').forEach(function(t) {
            testList.push(t)
          })
        })
        if (testList.length % 2 != 0) {
          callback(new Error('请按照提示输入'))
        }
        const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))?$/
        testList.forEach(function(item) {
          const tet = reg.test(item)
          if (!tet) {
            callback(new Error('请按照提示输入'))
          }
        })
        callback()
      }
    },
    trigger: trigger
  },
  v6RouterFilter: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let i = ''
        let result = ''
        let c = ''
        for (i = 0; i < value.length; i++) {
          c = value.substr(i, 1)
          if (c == '\n') {
            result = result + '|'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('|')
        const reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
        result.forEach(function(item) {
          const list = item.split(',')
          const listOne = list[0].split('/')
          if (!reg.test(listOne[0])) {
            callback(new Error('请按照提示输入'))
          }
          if (parseInt(listOne[1]) < 0 || parseInt(listOne[1]) >= 128) {
            callback(new Error('请按照提示输入'))
          }
          if (!reg.test(list[1])) {
            callback(new Error('请按照提示输入'))
          }
        })
        callback()
      }
    },
    trigger: trigger
  },
  v6IpPool: {
    validator: (rule, value, callback) => {
      if (!value) {
        callback()
      } else {
        let i,
          result = '',
          c
        const testList = []
        for (i = 0; i < value.length; i++) {
          c = value.substr(i, 1)
          if (c == '\n') {
            result = result + '/'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('/')
        result.forEach(function(item) {
          item.split('-').forEach(function(t) {
            testList.push(t)
          })
        })
        if (testList.length % 2 != 0) {
          callback(new Error('请按照提示输入'))
        }
        const reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
        testList.forEach(function(item) {
          const tet = reg.test(item)
          if (!tet) {
            callback(new Error('请按照提示输入'))
          }
        })
        callback()
      }
    },
    trigger: trigger
  },
  // ipV6校验
  ipV6: {
    validator: (rule, value, callback) => {
      const reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
      // 另外一种
      // ([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){0,7}::[a-f0-9]{0,4}(:[a-f0-9]{1,4}){0,7})
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的IP地址'))
      }
    },
    trigger: trigger
  },
  ipV6Cidr: {
    validator: (rule, value, callback) => {
      const reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
      // 另外一种
      // ([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){0,7}::[a-f0-9]{0,4}(:[a-f0-9]{1,4}){0,7})
      if (value.split('/')) {
        const result = value.split('/')
        const ret1 = reg.test(result[0])
        if (ret1 && result[1] && Number(result[1]) >= 1 && Number(result[1]) <= 128) return callback()
        else return callback(new Error('请输入2222::/24类型格式'))
      } else {
        callback(new Error('请输入2222::/24类型格式'))
      }
    },
    trigger: trigger
  },
  cidr: {
    pattern: /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/(\d{3}\d{2}|\d{1,2}\d|\d))?$/,
    message: '请输入10.12.2.1/24类型格式',
    trigger: trigger
  },
  ipORcidr: {
    validator: (rule, value, callback) => {
      const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      const reg1 = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\/(\d{3}\d{2}|\d{1,2}\d|\d))?$/
      if (reg.test(value) || reg1.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的地址'))
      }
    },
    trigger: trigger
  },
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
  },
  noOnlyNum: {
    validator: (rule, value, callback) => {
      const pattern = /^\d+$/g
      if (value.match(pattern)) {
        callback(new Error('内容不能为纯数字'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  // 非中文
  notChinese: {
    validator: (rule, value, callback) => {
      const reg = /^[\u4e00-\u9fa5]*$/
      if (value && reg.test(value)) {
        callback(new Error('不支持中文字符'))
      } else {
        callback()
      }
    },
    trigger: trigger
  }
}
