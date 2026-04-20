const trigger = null
export default {
  sdnName: {
    validator: (rule, value, callback) => {
      const regEn = /[ *<>?:"\\|']/im;
      if (regEn.test(value)) {
        callback(new Error('不能包含\\:*?”<>’|'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  sdnRouterName: { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '字母开头，仅支持数字、字母、下划线', trigger: trigger },
  vrfName: {
    validator: (rule, value, callback) => {
      const reg1 = /^[\u4e00-\u9fa5?]*$/; // 中文和？
      const reg2 = /^".*"$/ // 引号开始结束
      if (!value) {
        callback()
      } else {
        if (reg1.test(value) || value.indexOf('_public_') > -1) {
          callback(new Error('不能包含中文,_public_和?,以英文双引号开始和结束时，中间可包含空格，否则不可包含空格'))
        } else if (/[\s]/.test(value)) {
          if (!reg2.test(value)) {
            callback(new Error('不能包含中文,_public_和?,以英文双引号开始和结束时，中间可包含空格，否则不可包含空格'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
    },
    trigger: trigger
  },
  CbsByte: {
    validator: (rule, value, callback) => {
      const number = value === '' ? -1 : Number(value);
      if (number < 10000 || number > 4294967295) {
        callback(new Error('单位为Bytes时，取值范围为10000-4294967295'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  CbsKByte: {
    validator: (rule, value, callback) => {
      const number = value === '' ? -1 : Number(value);
      if (number < 9 || number > 4194303) {
        callback(new Error('单位为Kbytes时，取值范围为9-4194303'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  CirKbps: {
    validator: (rule, value, callback) => {
      const number = value === '' ? -1 : Number(value);
      if (number < 0 || number > 4294967295) {
        callback(new Error('单位为Kbps时，取值范围为0-4294967295'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  CirMbps: {
    validator: (rule, value, callback) => {
      const number = value === '' ? -1 : Number(value);
      if (number < 0 || number > 4294967) {
        callback(new Error('单位为Mbps时，取值范围为0-4294967'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  CirGbps: {
    validator: (rule, value, callback) => {
      const number = value === '' ? -1 : Number(value);
      if (number < 0 || number > 4294) {
        callback(new Error('单位为Gbps时，取值范围为0-4294'))
      } else {
        callback()
      }
    },
    trigger: trigger
  },
  CirMbyte: {
    validator: (rule, value, callback) => {
      const number = value === '' ? -1 : Number(value);
      if (number < 1 || number > 4095) {
        callback(new Error('单位为Mbytes时，取值范围为1-4095'))
      } else {
        callback()
      }
    },
    trigger: trigger
  }
}
