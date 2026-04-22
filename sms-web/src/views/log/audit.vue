<template>
  <div>
    <!-- TODO: cmp-element -->
    <AdvanceTable ref="tableRef" title="审计日志列表" :before-search="beforeSearch" :search-configs="searchConfigs" :data="list" :columns="adminColumns" :params="params" :get-list="getList" :total="total" :loading="loading">
      <template #action>
        <el-button type="ghost" @click="handleArchive">归档</el-button>
        <el-button type="ghost" @click="handleArchiveHistory">归档记录</el-button>
      </template>
    </AdvanceTable>
    <el-dialog title="归档" :close-on-click-modal="false" v-if="addVisible" v-model="addVisible">
      <el-form :model="addData" label-width="100px" ref="solveDataRef">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="归档时间：" prop="date">
              <el-date-picker v-model="addData.date" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始时间" end-placeholder="结束时间"> </el-date-picker>
            </el-form-item>
            <el-form-item label="" prop="deleted">
              <el-checkbox v-model="addData.deleted">是否清空服务器中的数据</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="归档记录" :close-on-click-modal="false" v-if="recordVisible" v-model="recordVisible" width="900px">
      <!-- TODO: cmp-element -->
      <table-search class="m-b-sm" :configs="recordSearchs" :onSearch="handleSearchRecord"></table-search>
      <!-- TODO: cmp-element -->
      <basic-table :data="recordList" :params="recordParams" :get-list="getRecordList" :total="recordTotal">
        <el-table-column label="归档人" prop="userName"> </el-table-column>
        <el-table-column label="归档时间" prop="gmtArchive"> </el-table-column>
        <el-table-column label="是否同步删除数据库" prop="deleted">
          <template #default="scope">
            {{ scope.row.deleted || scope.row.syncDelete ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="归档结果" prop="result"> </el-table-column>
      </basic-table>
      <template #footer>
        <div class="dialog-footer"></div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getLog, accessLog, getRecords } from 'services/system/log'
import { getUser as getManager } from 'services/system/manager'
import { getUser } from 'services/system/user'
import { getTenant } from 'services/system/tenant'

interface SearchConfig {
  type: string
  label: string
  value: string
  data?: Array<{ id: string; name: string }>
}

interface ListParams {
  page: number
  rows: number
  params?: unknown
}

const searchConfigs = reactive<SearchConfig[]>([
  { type: 'Input', label: '请求IP', value: 'requestIp' },
  {
    type: 'Select',
    label: '账号类型',
    value: 'catalog',
    data: [
      { id: 'Manager', name: '管理员' },
      { id: 'Tenant', name: '租户' },
      { id: 'User', name: '用户' }
    ]
  },
  { type: 'Select', label: '用户列表', value: 'userId', data: [] },
  { type: 'DateRange', label: '请求', value: 'gmtCreate' },
  { type: 'Input', label: '操作', value: 'action' }
])

const recordSearchs = [{ label: '归档人', value: 'userName', type: 'Input' }]

const adminColumns = [
  { label: '服务名称', prop: 'module' },
  { label: '请求IP', prop: 'requestIp' },
  { label: '操作账号', prop: 'account' },
  { label: '用户名', prop: 'userName' },
  { label: '请求对象', prop: 'target' },
  { label: '操作', prop: 'action' },
  { label: '参数', prop: 'detail' },
  { label: '请求时间', prop: 'gmtCreate' },
  { label: '请求耗时(ms)', prop: 'cost' }
]

// TODO: type - 审计日志行数据结构未定义
const list = ref<any[] | null>(null)
const total = ref<number | null>(null)
const loading = ref(false)
const params = reactive<ListParams>({ page: 1, rows: 10 })

const addData = reactive<{ date?: unknown; deleted?: boolean }>({})
const addVisible = ref(false)
const recordVisible = ref(false)
const recordList = ref<any[]>([])
const recordTotal = ref(0)
const recordParams = reactive<ListParams>({ page: 1, rows: 10 })
const catalog = ref('')

const tableRef = ref()
const solveDataRef = ref()

async function getAccountList(cat: string, handleSearch: () => void): Promise<void> {
  const map: Record<string, (p: any) => Promise<any>> = {
    Manager: getManager,
    Tenant: getTenant,
    User: getUser
  }
  const data = await map[cat]({ simple: true })
  if (data.success) {
    searchConfigs[2].data = data.data.rows
    handleSearch()
  }
}

function getList(): void {
  loading.value = true
  getLog(params)
    .then((data: any) => {
      if (data.success) {
        list.value = data.data.rows
        total.value = data.data.total
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function beforeSearch({ handleSearch, listQuery }: { handleSearch: () => void; listQuery?: Record<string, any> }): void {
  if (listQuery) {
    const { catalog: cat, userId } = listQuery
    if (cat !== catalog.value) {
      if (userId) {
        listQuery.userId = ''
      }
      catalog.value = cat
      getAccountList(cat, handleSearch)
    }
  }
}

function handleArchive(): void {
  addData.date = null
  addData.deleted = false
  addVisible.value = true
}

function addSubmit(): void {
  if (!addData.date) {
    ElMessage.error('请选择开始结束时间！')
    return
  }
  const payload = {
    startTime: (addData.date as any[])[0],
    endTime: (addData.date as any[])[1],
    deleted: addData.deleted
  }
  accessLog(payload)
  addVisible.value = false
}

function handleArchiveHistory(): void {
  recordVisible.value = true
}

function getRecordList(): void {
  getRecords(recordParams).then((data: any) => {
    if (data.success) {
      recordList.value = data.data.rows
      recordTotal.value = data.data.total
    }
  })
}

function handleSearchRecord(searchParams: unknown): void {
  recordParams.page = 1
  recordParams.params = searchParams
  getRecordList()
}
</script>
