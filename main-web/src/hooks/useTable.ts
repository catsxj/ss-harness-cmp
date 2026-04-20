import { ref, toRefs, reactive } from 'vue'
// import { MessageBox, Message } from 'element-'
import { handleSearchParam } from 'cmp-element/utils'

interface IRemoveService {
  (id: number): Promise<Base.IResponseData>
}
interface IConfigs {
  getService: {
    (params: Base.IListParams): Promise<Base.IResponseList>
  }
  removeService?: IRemoveService
  listFormat?: {
    (data: any): any[]
  }
  afterGetList?: {
    (): void
  }
  rows?: number
  params?: any
  initParams?: any
  deleteTipKey?: string
}

export function useDelete(removeService: IRemoveService, getData: { (): void }, deleteTipKey = 'name') {
  function handleDelete(record: any) {
    console.log(record)
    // MessageBox.confirm(`您确定要删除【${record[deleteTipKey]}】吗?`, '提示', {
    //   confirmButtonClass: 'el-button--danger',
    //   type: 'warning',
    // })
    //   .then(async () => {
    //     const res = await removeService(record.id)
    //     if (res.success) {
    //       Message.success(res.message)
    //       getData()
    //     }
    //   })
    //   .catch((e: any) => {
    //     console.error(e)
    //   })
  }
  return {
    handleDelete,
  }
}
export default function <T = any>(configs: IConfigs) {
  const { getService, removeService, listFormat, rows = 10, params = {}, afterGetList, initParams, deleteTipKey = 'name' } = configs
  const loading = ref(false)
  const state: Base.IListState<T> = reactive({
    list: [],
    total: 0,
    params: {
      page: 1,
      rows,
      ...params,
    },
  })
  if (initParams) {
    state.params.params = handleSearchParam(initParams)
  }
  async function getList() {
    loading.value = true
    try {
      const data = await getService(state.params)
      loading.value = false
      if (data.success) {
        if (listFormat) {
          state.list = listFormat(data.data.rows)
        } else {
          state.list = data.data.rows
        }
        state.total = data.data.total
        afterGetList && afterGetList()
      }
    } catch (e) {
      loading.value = false
    }
  }
  const { handleDelete } = useDelete(removeService as IRemoveService, getList, deleteTipKey)
  return {
    loading,
    ...toRefs(state),
    getList,
    handleDelete,
  }
}
