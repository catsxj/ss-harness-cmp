import { ref, toRefs, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handleSearchParam } from 'utils'

interface IRemoveService {
  (id: number): Promise<Base.IResponseData>
}
interface IConfigs {
  getService: (params: Base.IListParams) => Promise<Base.IResponseList>
  removeService?: IRemoveService
  listFormat?: (data: any) => any[]
  afterGetList?: () => void
  rows?: number
  params?: Record<string, unknown>
  initParams?: Record<string, unknown>
  deleteTipKey?: string
}

export function useDelete(
  removeService: IRemoveService,
  getData: () => void,
  deleteTipKey = 'name'
) {
  function handleDelete(record: any) {
    ElMessageBox.confirm(`您确定要删除【${record[deleteTipKey]}】吗?`, '提示', {
      confirmButtonClass: 'el-button--danger',
      type: 'warning'
    })
      .then(async () => {
        const res = await removeService(record.id)
        if (res.success) {
          ElMessage.success(res.message)
          getData()
        }
      })
      .catch(() => {})
  }
  return { handleDelete }
}

export default function useTable<T = any>(configs: IConfigs) {
  const {
    getService,
    removeService,
    listFormat,
    rows = 10,
    params = {},
    afterGetList,
    initParams,
    deleteTipKey = 'name'
  } = configs
  const loading = ref(false)
  const state: Base.IListState<T> = reactive({
    list: [] as T[],
    total: 0,
    params: { page: 1, rows, ...params }
  }) as Base.IListState<T>

  if (initParams) {
    ;(state.params as any).params = handleSearchParam(initParams)
  }

  async function getList() {
    loading.value = true
    try {
      const data = await getService(state.params)
      loading.value = false
      if (data.success) {
        state.list = listFormat ? listFormat(data.data.rows) : data.data.rows
        state.total = data.data.total
        afterGetList?.()
      }
    } catch {
      loading.value = false
    }
  }

  const { handleDelete } = useDelete(removeService as IRemoveService, getList, deleteTipKey)
  return { loading, ...toRefs(state), getList, handleDelete }
}
