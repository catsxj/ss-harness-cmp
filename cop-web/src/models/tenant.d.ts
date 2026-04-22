export interface ITenant {
  id?: number,
  account: string,
  name: string,
  status: string,
  discount: number,
  groupCode: string,
  password: string,
  remark: string,
  departId: number | undefined,
  departIds: number[] | string,
}
