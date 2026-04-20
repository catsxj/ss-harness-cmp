/**
 * Created by Zhang Haijun on 2018/1/25.
 */
const trigger = null
export default {
  required: { required: true, message: '请输入内容', trigger: trigger },
  number: { type: 'number', trigger: trigger, message: '请输入数字' },
  noNumber: { pattern: /^[^0-9]*$/, message: '不允许输入数字' },
  numberStr: { pattern: /^[0-9]*$/, message: '仅支持由数字组成的字符串', trigger: trigger },
  email: { type: 'email', trigger: trigger, message: '请输入正确的邮箱' },
  code: { pattern: /^[a-zA-Z0-9]*$/, message: '仅支持数字、字母', trigger: trigger },
  name: { pattern: /^[a-zA-Z0-9-_.]*$/, message: '仅支持数字、字母、下划线、中划线、点', trigger: trigger },
  blankName: { pattern: /^[a-zA-Z 0-9-_.]+$/, message: '不可输入中文', trigger: trigger },
  spec: { pattern: /^[0-9]+\/[0-9]+\/[0-9]+$/, message: '请输入长/宽/高，中间以斜杠隔开', trigger: trigger },
  newVmName: { pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, message: '支持数字，字母，下划线，短横线，以字母开头', trigger: trigger },
  hmcVolumeName: { pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, message: '支持数字，字母，下划线，短横线，以字母开头', trigger: trigger },
  startNotNumber: { pattern: /^[a-zA-Z][a-zA-Z0-9-_.]*$/, message: '支持数字，字母，下划线，短横线，点，以字母开头', trigger: trigger },
  vmName: { pattern: /^[a-zA-Z][a-zA-Z0-9]*$/, message: '支持数字，字母，以字母开头', trigger: trigger },
  vcName: { pattern: /^[a-zA-Z0-9]{5,15}$/, message: '请按提示输入正确格式' },
  vmHostName: { pattern: /^[a-zA-Z0-9]{5,15}$/, message: '5~15位英文、数字的组合', trigger },
  purposeName: { pattern: /^.{0,20}$/, message: '最长输入20个字符' },
  wwpn: { pattern: /^[A-Fa-f0-9]{16}$/, message: '可取字符0-9、A-F、a-f长度必须是16位', trigger: trigger },
  iScsi: { pattern: /^[iI][qQ][nN].[0-9]{4}-0?[1-9]|1[0-2].[a-zA-Z0-9:.]*$/, message: 'iqn.< yyyy-mm >.< tld.domain.some.host > [:< identifier >]', trigger: trigger },
  cephIqn: { pattern: /^iqn\.[0-9]{4}-(0?[1-9]|1[0-2])\.[-0-9a-z.:]+$/, message: 'iqn.< yyyy-mm >.< tld.domain.some.host > [:< identifier >]', trigger: trigger },
  // 正整数
  positiveInteger: {
    validator: (rule, value, callback) => {
      if (/^[1-9][0-9]*$/.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正整数'))
      }
    },
    trigger: trigger
  },
  postInteger: {
    validator: (rule, value, callback) => {
      if (value >= 1 && value <= 65535) {
        callback()
      } else {
        callback(new Error('仅允许数字1-65535'))
      }
    },
    trigger: trigger
  },
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
  awsRule: {
    validator: (rule, value, callback) => {
      const reg1 = /^[A-Za-z0-9]+$/
      const reg4 = '-_.:/()#,@$*+=&{}![]'
      let flag = true
      for (const i in value) {
        if (!reg1.test(value[i]) && reg4.indexOf(value[i]) === -1) {
          flag = false
          break
        }
      }
      if (flag) {
        callback()
      } else {
        callback(new Error('只能由数字、字母、-_.:/()#,@$*+=&{}![]组成'))
      }
    },
    trigger: trigger
  },
  qcloudPassword: {
    validator: (rule, value, callback) => {
      if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,64}$/.test(value)) {
        callback()
      } else {
        callback(new Error('密码至少8位，并包括大小写字母及数字'))
      }
    },
    trigger: trigger
  },
  NumberEmpty: {
    validator: (rule, value, callback) => {
      const reg = /^[0-9 ]*$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('只能输入数字和空格'))
      }
    },
    trigger: trigger
  },
  dns: {
    validator: (rule, value, callback) => {
      const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))?$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的DNS'))
      }
    },
    trigger: trigger
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
    trigger: trigger
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
    trigger: trigger
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
    trigger: trigger
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
    trigger: trigger
  },
  // 手机或者座机
  mobileOrPhone: {
    validator: (rule, value, callback) => {
      const reg = /(^1[3|4|5|7|6|8|9]\d{9}$)|(^0\d{2,3}-?\d{7,8}$)/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的座机号或者手机号'))
      }
    },
    trigger: trigger
  },
  // 手机或者座机
  mobileOrPhoneNoValue: {
    validator: (rule, value, callback) => {
      const reg = /(^1[3|4|5|7|6|8|9]\d{9}$)|(^0\d{2,3}-?\d{7,8}$)/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的座机号或者手机号'))
      }
    },
    trigger: trigger
  },
  numTen: {
    validator: (rule, value, callback) => {
      if (value % 10 == 0) {
        callback()
      } else {
        callback(new Error('请输入10的倍数'))
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
  mac: {
    validator: (rule, value, callback) => {
      const reg = /^[A-F0-9]{2}(-[A-F0-9]{2}){5}$|^[A-F0-9]{2}(:[A-F0-9]{2}){5}$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的Mac地址'))
      }
    },
    trigger: trigger
  },
  memory: {
    validator: (rule, value, callback) => {
      if (Number(value) % 64 == 0) {
        callback()
      } else {
        callback(new Error('请输入64的倍数'))
      }
    },
    trigger: trigger
  },
  cpu: {
    validator: (rule, value, callback) => {
      if (Number(value) % 2 == 0) {
        callback()
      } else {
        callback(new Error('请输入2的倍数'))
      }
    },
    trigger: trigger
  },
  specmemory: {
    validator: (rule, value, callback) => {
      if (Number(value) % 2 == 0 || Number(value) == 1) {
        callback()
      } else {
        callback(new Error('请输入2的倍数或者1'))
      }
    },
    trigger: trigger
  },
  gbMemory: {
    validator: (rule, value, callback) => {
      if ((Number(value) * 1024) % 64 == 0) {
        callback()
      } else {
        callback(new Error('请输入64MB的整数倍'))
      }
    },
    trigger: trigger
  },
  templateMemory: {
    validator: (rule, value, callback) => {
      if ((Number(value) * 1024) % 16 == 0) {
        callback()
      } else {
        callback(new Error('请输入16MB的整数倍'))
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
  // 腾讯云云主机
  tencentWindowsVm: {
    validator: (rule, value, callback) => {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{12,30}$')
      if (reg.test(value) && value.length >= 12 && value.length <= 30) {
        callback()
      } else {
        callback(new Error("Windows机器密码需12到30位，至少包括三项（[a-z,A-Z],[0-9]和[()`~!@#$%^&*-+=_|{}[]:;',.?/])的特殊符号"))
      }
    },
    trigger: trigger
  },
  tencentLinuxVm: {
    validator: (rule, value, callback) => {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,16}$')
      if (reg.test(value) && value.length >= 8 && value.length <= 16) {
        callback()
      } else {
        callback(new Error("Linux机器密码需8到16位，至少包括三项（[a-z,A-Z],[0-9]和[()`~!@#$%^&*-+=_|{}[]:;',.?/])的特殊符号"))
      }
    },
    trigger: trigger
  },
  // 华为云云主机
  huaweiVm: {
    validator: (rule, value, callback) => {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      if (reg.test(value) && value.length >= 8 && value.length <= 26) {
        callback()
      } else {
        callback(new Error("密码需8到26位，至少包括三项（[a-z,A-Z],[0-9]和[()`~!@#$%^&*-+=_|{}[]:;',.?/])的特殊符号"))
      }
    },
    trigger: trigger
  },
  // 深信服云主机
  sangforVM: {
    validator: (rule, value, callback) => {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      if (!value || (reg.test(value) && value.length >= 8 && value.length <= 30)) {
        callback()
      } else {
        callback(new Error('长度为8-30个字符，至少包含大写字母、小写字母、数字和特殊字符中3项，支持特殊字符_!@#$%^&*`~()-+='))
      }
    },
    trigger: trigger
  },
  // IBM存储新增复制卷
  ibmStorage: {
    validator: (rule, value, callback) => {
      const reg = new RegExp('^[a-zA-Z]([-_a-zA-Z0-9]{1,64})$')
      const reg1 = new RegExp('^[a-zA-Z]+$')
      if ((reg.test(value) || reg1.test(value.slice(0, 1))) && value.length >= 1 && value.length <= 64) {
        callback()
      } else {
        callback(new Error('支持数字，字母，下划线，短横线，要求以字母开头'))
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
  // 中文
  chinese: {
    validator: (rule, value, callback) => {
      const reg = /^[\u4e00-\u9fa5]*$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入中文'))
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
  },
  vmPassword: {
    validator: (rule, value, callback) => {
      const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[a-zA-Z0-9\S]{12,36}$/
      if (!value.match(pattern)) {
        callback(new Error('同时包含大小写字母，数字和特殊字符,长度介于12-36字符'))
      } else {
        callback()
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
  azureUser: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z][a-zA-Z0-9_-]*$/
      if (reg.test(value) && value.length >= 1 && value.length <= 64) {
        callback()
      } else {
        callback(new Error('仅支持数字、字母、下划线、中划线,且以字母开头'))
      }
    },
    trigger: trigger
  },
  azurePassword: {
    validator: (rule, value, callback) => {
      const pattern = '^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_]+$)(?![a-z0-9]+$)(?![a-z\\W_]+$)(?![0-9\\W_]+$)[a-zA-Z0-9\\W_]{12,72}$'
      if (!value.match(pattern)) {
        callback(new Error('同时包含大小写字母，数字或特殊字符任意三项,长度介于12-72字符'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  azureVmName: {
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
  awsAmi: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9-+,/.]*$/
      if (reg.test(value) && value.length >= 3 && value.length <= 128) {
        callback()
      } else {
        callback(new Error('仅支持数字、大小写字母、中划线、下划线、句号及/和点，长度介于3-128'))
      }
    },
    trigger: trigger
  },
  hicNoChinese: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z0-9-_]*$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('仅支持数字、字母、下划线、中划线'))
      }
    },
    trigger: trigger
  },
  hostName: {
    validator: (rule, value, callback) => {
      const pattern = '^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_]+$)(?![a-z0-9]+$)(?![a-z\\W_]+$)(?![0-9\\W_]+$)[a-zA-Z0-9\\W_]{8,30}$'
      if (!value.match(pattern)) {
        callback(new Error('8-30字符,同时包含大写/小写字母，数字或特殊字符三项'))
      } else {
        callback()
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
        result.forEach(function (item) {
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
        const reg =
          /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
        result.forEach(function (item) {
          if (!reg.test(item)) {
            callback(new Error('请按照提示输入'))
          }
        })
        callback()
      }
    },
    trigger: trigger
  },
  // openstack云主机
  sanforOpVm: {
    validator: (rule, value, callback) => {
      const reg1 = /^[A-Z]+$/
      const reg2 = /^[a-z]+$/
      const reg3 = /^[0-9]+$/
      const reg4 = "()`~!@#$%^&*_-+=|{}[]:;'<>,.?/"
      let index = 0
      for (const i in value) {
        if (reg1.test(value[i])) {
          index = index + 1
          continue
        }
        if (reg2.test(value[i])) {
          index = index + 1
          continue
        }
        if (reg3.test(value[i])) {
          index = index + 1
          continue
        }
        if (reg4.indexOf(value[i]) > -1) {
          index = index + 1
          continue
        }
      }
      if (index >= 3 && value.length >= 8) {
        callback()
      } else {
        callback(new Error("密码最少8位，至少包括三项（[a-z,A-Z],[0-9]和()`~!@#$%^&*_-+=|{}[]:;'<>,.?/)的特殊符号"))
      }
    },
    trigger: trigger
  },
  sanforOpVmName: {
    validator: (rule, value, callback) => {
      const reg1 = /^[A-Za-z0-9]+$/
      const reg2 = /^[\u4e00-\u9fa5]*$/
      const reg4 = '()[]{}（）【】｛｝@|._-+ '
      let flag = true
      for (const i in value) {
        if (!reg1.test(value[i]) && !reg2.test(value[i]) && reg4.indexOf(value[i]) === -1) {
          flag = false
          break
        }
      }
      if (flag && value.length <= 70) {
        callback()
      } else {
        callback(new Error('只能由中文、数字、字母、()[]{}（）【】｛｝@|._-+以及空格组成'))
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
        result.forEach(function (item) {
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
        result.forEach(function (item) {
          item.split('-').forEach(function (t) {
            testList.push(t)
          })
        })
        if (testList.length % 2 != 0) {
          callback(new Error('请按照提示输入'))
        }
        const reg = /^((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))?$/
        testList.forEach(function (item) {
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
        const reg =
          /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
        result.forEach(function (item) {
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
        result.forEach(function (item) {
          item.split('-').forEach(function (t) {
            testList.push(t)
          })
        })
        if (testList.length % 2 != 0) {
          callback(new Error('请按照提示输入'))
        }
        const reg =
          /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
        testList.forEach(function (item) {
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
  specialNoChinese: { pattern: /^[\w%\-+._]{1,}$/, message: '不能输入中文和除.+=_空格外的其他特殊字符', trigger: trigger },
  // ipV6校验
  ipV6: {
    validator: (rule, value, callback) => {
      const reg =
        /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
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
      const reg =
        /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/
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
  headSlash: { pattern: /^\/.{0,}$/, message: '须以/开头', trigger: trigger },
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
  vlanId: {
    validator: (rule, value, callback) => {
      if (/^[1-9][0-9]*$/.test(value) && parseInt(value) <= 4095 && parseInt(value) >= 1) {
        callback()
      } else if (value || value === 0) {
        callback(new Error('范围1-4095'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  url: {
    validator: (rule, value, callback) => {
      const reg = /^(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i
      const reg1 = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9]):\d{0,5}$/
      const reg2 = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      if (reg.test(value) || reg1.test(value) || reg2.test(value) || !value) {
        callback()
      } else {
        callback(new Error('请输入正确的地址'))
      }
    },
    trigger: trigger
  },
  noChineseSpace: {
    validator: (rule, value, callback) => {
      if (/[\u4e00-\u9fa5\s]/.test(value)) {
        callback(new Error('输入的命令不能包含中文和空格'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  // Int类型最大取值范围，配额输入值
  maxInt: {
    pattern: /^(?:[0-9]|[1-9]\d{1,8}|[1-3]\d{0}|21474836[0-3]\d|214748364[0-7])$/,
    message: '输入有误，范围是0-2147483647',
    trigger: trigger
  },
  nginxSet: {
    validator: (rule, value, callback) => {
      const pattern = new RegExp("[`!@#^&*()|{}';',<>?！@#￥……&*（）——|{}【】‘；”“'。，、？]")
      if (pattern.test(value)) {
        callback(new Error('特殊字符仅支持/ \\ . ~:$='))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  syncedsetsName: {
    validator: (rule, value, callback) => {
      const pattern1 = /^[\s ]|[ ]$/gi
      const pattern2 = /^[a-zA-Z_][a-zA-Z0-9-_.\s]*$/
      if (!pattern1.test(value) && pattern2.test(value)) {
        callback()
      } else {
        callback(new Error('输入字母、数字、空格、点、中划线和下划线,以字母或下划线开始,首尾不能包含空格'))
      }
    },
    trigger: trigger
  },
  uuid: {
    validator: (rule, value, callback) => {
      if (!value || (parseInt(value) <= 32767 && parseInt(value) >= 0)) {
        callback()
      } else {
        callback(new Error('范围0-32767'))
      }
    },
    trigger: trigger
  },
  hmcName: {
    validator: (rule, value, callback) => {
      const regEn = /[`~!@#$%^&*()+<>?:"{}\\,./;'[\]]/im,
        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im,
        regCN = /^[^\u4e00-\u9fa5]+$/
      if (regEn.test(value) || regCn.test(value) || !regCN.test(value)) {
        callback(new Error('不能输入中文和特殊字符'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  huaweiStorageName: {
    validator: (rule, value, callback) => {
      const reg1 = /^[A-Za-z0-9]+$/
      const reg2 = /^[\u4e00-\u9fa5]*$/
      const reg3 = '._-'
      let flag = true
      for (const i in value) {
        if (!reg1.test(value[i]) && !reg2.test(value[i]) && reg3.indexOf(value[i]) === -1) {
          flag = false
          break
        }
      }
      function getValLen(value, strlen) {
        for (let i = 0; i < value.length; i++) {
          if (value.charCodeAt(i) < 27 || value.charCodeAt(i) > 126) {
            // 中文和中文字符
            strlen += 3
          } else {
            strlen++
          }
        }
        return strlen
      }
      if (flag && getValLen(value, 0) <= 31 && getValLen(value, 0) >= 1) {
        callback()
      } else {
        callback(new Error('只能由中文、数字、字母、._-组成,长度为1-31位,中文为3个字符'))
      }
    },
    trigger: trigger
  },
  iscsiClientName: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z\d.:@_-]{8,64}$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('名称8-64个字符，支持大小写字母数字和.:@_-'))
      }
    },
    trigger: trigger
  },
  iscsiClientPassword: {
    validator: (rule, value, callback) => {
      const reg = /^[a-zA-Z\d/@_-]{6,12}$/
      if (reg.test(value) || !value) {
        callback()
      } else {
        callback(new Error('密码6-12位字符，支持大小写字母数字和/@_-'))
      }
    },
    trigger: trigger
  },
  aliPassword: {
    validator: (rule, value, callback) => {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      if (reg.test(value) && value.length >= 8 && value.length <= 30) {
        callback()
      } else {
        callback(new Error('密码需8到30位，至少包括三项（大小写字母、数字、特殊符号）'))
      }
    },
    trigger: trigger
  },
  // 曙光云主机VNC密码
  sugonVNCPassword: {
    validator: (rule, value, callback) => {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*,./`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*,./`~()-+=]+$)(?![0-9_!@#$%^&*,./`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*,./`~()-+=]{1,8}$')
      if (reg.test(value) && value.length >= 1 && value.length <= 8) {
        callback()
      } else {
        callback(new Error('密码长度应大于等于1位且不大于8位，必须至少包含英文大写、小写、数字、特殊字符中的三种'))
      }
    },
    trigger: trigger
  }
}
