export interface IUser {
  id?: number
  account: string
  name: string
  status: string
  isManager: boolean
  sex: boolean
  password: string
  email: string
  mobile: string
  dingtalk: string
  wechat: string
  company: string
  jobNumber: string
  tenantId: number
  remark: string
  departId: number | undefined
  departIds: number[]
}
