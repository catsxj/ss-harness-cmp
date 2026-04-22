declare module Base {
  // ajax 请求返回数据格式
  interface IResponseData<T = any> {
    success: boolean
    failed: boolean
    solution: string
    message: string
    errorMsg: string
    data: T
    status: string
  }
  interface IListData<T = any> {
    page: number
    pages: number
    total: number
    rows: T[]
  }
  interface IResponseList<T = any> extends IResponseData {
    data: IListData<T>
  }
  interface IListParams {
    page?: number
    rows?: number
    simple?: boolean
    params?: string
    sorter?: string
  }
  interface IDialog<T = any> {
    visible: boolean
    record: T
  }
  interface ISearchConfig<T = any> {
    label?: string
    value: string
    type: string
    initValue?: string | number
    sign?: string
    data?: T[]
    disabled?: boolean
    onChange?: {
      (val: string, listQuery: any): void
    }
  }
  type IListState<T = any> = {
    list: T[]
    total: number
    params: IListParams
  }
}
