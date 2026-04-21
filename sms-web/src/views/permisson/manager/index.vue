<template>
  <div>
    <!-- TODO: cmp-element AdvanceTable -->
    <AdvanceTable v-show="!detailVisible" title="用户列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="handleSelectionChange">
      <template #action>
        <el-button type="primary" @click="handleCreate()">
          <el-icon><Plus /></el-icon>新增
        </el-button>
        <ImportData url="/api/sms/v1/users/import" @get-data="getList" template-url="/sms/v1/users/import/template"></ImportData>
        <el-button @click="downloadUser">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <el-button @click="batchOperate('lock')" :disabled="!selectionIds.length">
          <el-icon><Lock /></el-icon>批量冻结
        </el-button>
        <el-button @click="batchOperate('active')" :disabled="!selectionIds.length">
          <el-icon><Unlock /></el-icon>批量解冻
        </el-button>
        <el-button @click="batchOperate('remove')" :disabled="!selectionIds.length">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </template>
      <template #account="{ val, record }">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #sex="val">
        <span>{{ sexFilter(val) }}</span>
      </template>
      <template #status="status">
        <!-- TODO: cmp-element status-icon -->
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #operate="{ val, record }">
        <el-button type="text" @click="handleCreate(record)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多<el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleGrant(record.id)"> 角色授权 </el-dropdown-item>
              <el-dropdown-item @click="handleReset(record.id)"> 密码重置 </el-dropdown-item>
              <el-dropdown-item v-if="record.status === 'NORMAL'" @click="handleOperate(record, 'lock')"> 账户冻结 </el-dropdown-item>
              <el-dropdown-item v-if="record.status === 'ABNORMAL'" @click="handleOperate(record, 'active')"> 账户解冻 </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <UserDetail v-if="detailVisible" :user-data="addDialog.record" @go-back="goBack" />
    <!--新增编辑界面-->
    <AddDialog :tenant-list="tenantList" :dialog="addDialog" v-if="addDialog.visible" @get-data="getList"></AddDialog>
    <!--重置密码-->
    <ResetPassword :dialog="resetDialog" v-if="resetDialog.visible" />
    <!-- 授权 -->
    <GrantRole :dialog="grantDialog" v-if="grantDialog.visible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Download, Lock, Unlock, ArrowDown } from '@element-plus/icons-vue'
import AddDialog from './AddDialog.vue'
import UserDetail from './UserDetail.vue'
import ResetPassword from './ResetPassword.vue'
import GrantRole from './GrantRole.vue'
import { getRole } from 'services/system/role'
import { getTenant } from 'services/system/tenant'
import { getUser, removeUser, operateManager, exportUser, batchOperateManager } from 'services/system/manager'
import { columns, searchConfigs as searchConfig, sexData } from './config'
import type { IUser } from '@/models/user'
import ImportData from '@/common/components/import-data/index.vue'
import useTable from '@/common/hooks/useTable'
import useSelection from '@/common/hooks/useSelection'
import { generalStatusFilter, sexFilter } from '@/filters/common'

const { list, total, params, handleDelete, loading, getList } = useTable<IUser>({
  getService: getUser,
  removeService: removeUser
})
const searchConfigs = ref(searchConfig)
const tenantList = ref<any[]>([])

async function getTenants() {
  const data = await getTenant({ page: 1, rows: 10000 })
  if (data.success) {
    tenantList.value = data.data.rows
    searchConfigs.value[4].data = tenantList.value
  }
}
getTenants()

async function getRoles() {
  const data: any = await getRole({ simple: true })
  if (data.success) {
    searchConfigs.value[3].data = data.data.rows
  }
}
getRoles()

const addDialog = ref<{ visible: boolean; record: any }>({ visible: false, record: {} })
function handleCreate(data?: any) {
  addDialog.value = { visible: true, record: { ...data } }
}

const detailVisible = ref(false)
function getDetail(record: any) {
  addDialog.value.record = record
  detailVisible.value = true
}
function goBack() {
  detailVisible.value = false
}

function handleOperate(record: IUser, action: string) {
  let tip = ''
  if (action === 'lock') tip = `是否冻结【${record.name}】？`
  else if (action === 'active') tip = `是否解冻【${record.name}】？`
  ElMessageBox.confirm(tip, '提示', { type: 'warning' }).then(async () => {
    const res = await operateManager(Number(record.id), action)
    if (res.success) {
      ElMessage.success(res.message)
      getList()
    }
  })
}

function batchOperate(action: string) {
  let tip = ''
  if (action === 'lock') tip = '是否冻结这些用户？'
  else if (action === 'active') tip = '是否解冻这些用户？'
  else if (action === 'remove') tip = '是否删除这些用户？'
  ElMessageBox.confirm(tip, '提示', { type: 'warning' }).then(async () => {
    const res = await batchOperateManager(selectionIds.value as any, action)
    if (res.success) {
      ElMessage.success(res.message)
      getList()
    }
  })
}

const resetDialog = ref<{ userId: number; visible: boolean }>({ userId: 0, visible: false })
function handleReset(userId: number) {
  resetDialog.value = { userId, visible: true }
}

const grantDialog = ref<{ userId: number; visible: boolean }>({ userId: 0, visible: false })
function handleGrant(userId: number) {
  grantDialog.value = { userId, visible: true }
}

function downloadUser() {
  const paramsArr: any[] = JSON.parse(params.value.params as string)
  if (selectionIds.value.length) {
    paramsArr.push({ param: { id: selectionIds.value.join(',') }, sign: 'IN' })
  }
  exportUser({ params: JSON.stringify(paramsArr) })
}

const { selectionIds, handleSelectionChange } = useSelection()

</script>
