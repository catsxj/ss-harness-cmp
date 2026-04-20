export interface IListParams {
  page: number
  rows: number
  simple?: boolean
  params?: string
}

export interface IAjaxData {
  success: boolean
  failed: boolean
  solution: string
  message: string
  errorMsg: string
  data: any
  status: string
}

export interface IDialogConfig {
  visible: boolean
  id?: number
  vendorId?: number
}
