declare namespace Base {
  // ajax请求返回数据格式
  interface IResponseData<T = any> {
    success: boolean
    failed: boolean
    solution: string
    message: string
    errorMsg: string
    data: T
    status: string
  }
  // list接口返回数据格式
  interface IListData<T = any> {
    page: number
    pages: number
    total: number
    rows: T[]
  }
  interface IResponseList<T = any> extends IResponseData {
    data: IListData<T>
  }
  // 列表查询传参
  interface IListParams {
    page?: number
    rows?: number
    simple?: boolean
    params?: string
    sorter?: string
  }
  // 模态框打开
  interface IDialog<T = any> {
    visible: boolean
    record: T
  }
  // 搜索配置
  interface ISearchConfig<T = any> {
    label?: string
    value: string
    type: string
    initValue?: string | number
    sign?: string
    data?: T[]
    onChange?: {
      (val: string, listQuery: any): void
    }
  }
  // 列表
  type IListState<T = any> = {
    list: T[]
    total: number
    params: IListParams
  }
}
