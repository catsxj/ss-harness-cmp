export const required = { required: true, message: '请输入内容' }
export const complexPassword = {
  validator: (rule: any, value: string, callback: any) => {
    const reg = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)(?=.*?[~!@#￥%&*()$])[a-zA-Z\d~!@#￥%&*()$]{6,12}$/
    if (reg.test(value)) {
      callback()
    } else {
      callback(new Error('密码必须由6-12位大小写字母数字和~!@#￥%&*()$组成'))
    }
  }
}
export const email = { type: 'email', message: '请输入正确的邮箱' }
// 手机
export const mobile = {
  validator: (rule: any, value: string) => {
    const reg = /^(13[0123456789]|14[57]|15[012356789]|18[0123456789]|17[0,3,5-8]|166|198|199)[0-9]{8}$/
    if (reg.test(value) || !value) {
      return Promise.resolve()
    } else {
      return Promise.reject('请输入正确的手机号')
    }
  }
}
