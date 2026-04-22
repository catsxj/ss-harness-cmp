<template>
  <div>
    <!-- TODO: cmp-element AdvanceTable -->
    <AdvanceTable title="租户列表" :search-configs="searchConfigs" :data="listData" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="selectionChange">
      <template #action>
        <el-button type="primary" @click="handleCreate()">
          <el-icon><Plus /></el-icon>新增
        </el-button>
        <ImportData url="/api/sms/v1/tenants/import" @get-data="getList" template-url="/sms/v1/tenants/import/template"></ImportData>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <el-button @click="handleLock('lock')" :disabled="!tenantIds.length">
          <el-icon><Lock /></el-icon>批量冻结
        </el-button>
        <el-button @click="handleLock('active')" :disabled="!tenantIds.length">
          <el-icon><Unlock /></el-icon>批量解冻
        </el-button>
        <el-button @click="handleLock('remove')" :disabled="!tenantIds.length">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </template>
      <template #account="{ val, record }">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="{ val: status, record }">
        <!-- TODO: cmp-element status-icon -->
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #openFlow="{ val, record }">
        {{ booleanFilter(val) }}
      </template>
      <template #isInstallSoftware="{ val, record }">
        {{ booleanFilter(val) }}
      </template>
      <template #paymentMode="{ val, record }">
        <span v-if="Array.isArray(val)">{{ val.map((item: string) => paymentModeFilter(item)).join('，') }}</span>
        <span v-else>--</span>
      </template>
      <template #operate="{ val, record }">
        <el-button link @click="handleCreate('edit', record)">
          <el-icon><Edit /></el-icon>编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button link @click="handleRemove(record.id)" :disabled="record.status !== 'LOGOUT'">
          <el-icon><Delete /></el-icon>删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多
            <!-- TODO: cmp-element svg-icon -->
            <svg-icon icon-name="el-icon-arrow-down" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleAssignPool(record)"> 资源分配 </el-dropdown-item>
              <el-dropdown-item @click="handleService(record)"> 服务授权 </el-dropdown-item>
              <el-dropdown-item @click="handlePermission(record)"> 权限设置 </el-dropdown-item>
              <el-dropdown-item @click="handleReset(record.id)"> 密码重置 </el-dropdown-item>
              <el-dropdown-item @click="handleUserConfig(record)"> 用户管理 </el-dropdown-item>
              <el-dropdown-item @click="handleRecharge(record)"> 账户授权 </el-dropdown-item>
              <el-dropdown-item v-if="record.status === 'NORMAL'" @click="handleOperate(record.id, 'lock')"> 账户冻结 </el-dropdown-item>
              <el-dropdown-item v-if="record.status === 'ABNORMAL'" @click="handleOperate(record.id, 'active')"> 账户解冻 </el-dropdown-item>
              <el-dropdown-item v-if="record.status !== 'LOGOUT'" @click="handleOperate(record.id, 'logout')"> 账户注销 </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <TenantDetail v-if="detailComponent.visible" :config="detailComponent"></TenantDetail>
    <AddDialog :dialog="addDialog" v-if="addDialog.visible" @get-data="getList" @clear-add-dialog="clearAddDialog">
      <template #first>
        <BasicInfo ref="basicInfo" />
      </template>
      <template #second>
        <Quota catalog="TENANT" ref="quota" />
      </template>
      <template #third>
        <service-item ref="service" />
      </template>
    </AddDialog>
    <!--新增编辑-->
    <el-dialog title="编辑租户" :close-on-click-modal="false" v-if="addDialogVisible" v-model="addDialogVisible">
      <BasicInfo :info-data="addData" ref="basicInfo"></BasicInfo>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!--重置密码-->
    <el-dialog title="重置密码" v-model="resetDialogVisible" width="35%">
      <!-- TODO: cmp-element basic-form -->
      <basic-form :model="resetData" ref="resetForm">
        <el-row>
          <el-col :span="24">
            <basic-form-item label="登录密码：" prop="password" :validate="pwdRule">
              <el-input v-model="resetData.password" auto-complete="off" show-password></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="resetSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!--服务界面-->
    <ServiceDialog v-if="serviceDialog.visible" :dialog="serviceDialog" @service-success="getList"></ServiceDialog>
    <!--权限设置-->
    <PermissionDialog v-if="permissionDialog.visible" :dialog="permissionDialog" @success="getList"></PermissionDialog>
    <assignPool :add-data="assignPoolData" v-if="assignPoolData.dialog"></assignPool>
    <!--授信账户-->
    <el-dialog title="授信账户" v-model="rechargeDialogVisible" width="600px">
      <basic-form label-width="150px">
        <el-row>
          <el-col :span="12">
            <basic-form-item label="信用额度：">
              <span>{{ rechargeData.accountTotal }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="已用额度：">
              <span>{{ rechargeData.accountUsed }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="已分配：">
              <span>{{ rechargeData.accountAllocated }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="可用额度：">
              <span>{{ rechargeData.balanceFree }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="账户余额：">
              <span>{{ rechargeData.balance }}元</span>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="是否超支：">
              <el-switch v-model="rechargeData.overdraft" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="授信额度(元)：">
              <el-input-number :min="rechargeData.minBalance" :max="rechargeData.maxBalance" v-model="rechargeData.accountTotal"></el-input-number>
              <span class="tip m-l">最小值为：{{ rechargeData.minBalance }},最大值为：{{ rechargeData.maxBalance }}</span>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rechargeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="rechargeSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="API授权" :close-on-click-modal="false" v-if="apiGrantVisible" v-model="apiGrantVisible" width="70%">
      <basic-form>
        <el-select v-model="apiGrantData.module" placeholder="请选择服务" :loading="loading" @change="changeModule">
          <el-option v-for="item in modulesData" :key="item.value" :label="item.name" :value="item.value"> </el-option>
        </el-select>
        <el-row class="m-t" :gutter="10" v-loading="loading">
          <el-col :span="12">
            <el-checkbox v-model="apiGrantData.selectAll" @change="selectAll">全选</el-checkbox>
            <el-tree ref="apitreeRef" :expand-on-click-node="false" :data="modulesList" node-key="pattern" :props="{ label: 'label', children: 'value' }" show-checkbox @check-change="changeCheckApi">
              <template #default="{ node }">
                <span>
                  <span :class="node.label.indexOf(':') > -1 ? 'custom-tree-node' : ''">{{ node.label.split(':')[0] }}</span><span>: {{ node.label.split(':')[1] }}</span>
                </span>
              </template>
            </el-tree>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="apiGrantVisible = false">取消</el-button>
          <el-button type="primary" @click="apiGrantSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!--用户管理-->
    <Transfer :key="2" ref="transferRef" @success="getList" v-if="userConfig.visible" :config="userConfig"></Transfer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Download, Lock, Unlock } from '@element-plus/icons-vue'
import crypto from 'utils/crypto'
import TenantDetail from './tenantDetail.vue'
import ServiceDialog from './ServiceDialog.vue'
import PermissionDialog from './permissionDialog.vue'
import AddDialog from './AddDialog.vue'
import BasicInfo from './components/basicInfo.vue'
import Quota from './components/quota.vue'
import ServiceItem from './components/ServiceItem.vue'
import assignPool from './assignPool.vue'
import Transfer from './components/transfer.vue'
import ImportData from '@/common/components/import-data/index.vue'
import { getTenant, modifyTenant, removeTenant, operateTenant, exportTenantList, lockTenant, resetTenantPsw, getTenantAccount, createTenantAccount, getApiById, updateApi } from 'services/system/tenant'
import { getModules, getModulesByName } from 'services/system/role'
import { columns, searchConfigs } from './config'
import { generalStatusFilter, booleanFilter, paymentModeFilter } from '@/filters/common'
import { handleSearchParam } from 'utils'
import { useAppStore, usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'

const appStore = useAppStore()
const permissionStore = usePermissionStore()

const listData = ref<any[]>([])
const total = ref(0)
const params = reactive<any>({ page: 1, rows: 10 })
const addDialogVisible = ref(false)
const detailComponent = reactive<any>({})
const loading = ref(false)
const dialogStatus = ref('')
const textMap: Record<string, string> = { update: '编辑租户', create: '新增租户' }
const userConfig = reactive<any>({ visible: false, id: '' })
const addData = ref<any>({})
const serviceDialog = reactive<any>({})
const addDialog = reactive<any>({
  visible: false,
  parentId: 0,
  title: '快速导航',
  des: '您可以通过本向导轻松新增租户进行管理',
  leftStepList: ['基本信息', '资源分配', '服务授权'],
  rightContent: [
    { title: '基本信息', ref: 'basicInfo' },
    { title: '资源分配', ref: 'quota' },
    { title: '服务授权', ref: 'service' }
  ]
})
const resetDialogVisible = ref(false)
const resetData = ref<any>({})
const assignPoolData = reactive<any>({ dialog: false, data: {} })
const rechargeDialogVisible = ref(false)
const rechargeData = ref<any>({ accountTotal: 0, accountUsed: 0 })
const apiGrantVisible = ref(false)
const apiGrantData = ref<any>({ apis: [] })
const modulesData = ref<any[]>([])
const modulesList = ref<any[]>([])
const apisById = ref<any[]>([])
const permissionDialog = reactive<any>({ visible: false, record: {} })
const tenantIds = ref<any[]>([])

const basicInfo = ref<any>(null)
const resetForm = ref<any>(null)
const apitreeRef = ref<any>(null)
const transferRef = ref<any>(null)

const pwdRule = computed(() => (appStore.systemConfig as any).pwdStrength)
const ids = computed(() => tenantIds.value.join(','))


function exportData() {
  const p = JSON.parse(params.params)
  p.push(
    ...JSON.parse(handleSearchParam({ 'id:IN': ids.value }))
  )
  exportTenantList({ params: JSON.stringify(p) })
}

function selectionChange(val: any[]) {
  tenantIds.value = val.map((item: any) => item.id)
}

function handleLock(action: string) {
  let title = ''
  if (action === 'lock') title = '冻结'
  else if (action === 'active') title = '解冻'
  else if (action === 'remove') title = '删除'
  ElMessageBox.confirm(`您确定要${title}所选租户吗？`, '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    lockTenant({ ids: tenantIds.value, action }).then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        getList()
      }
    })
  })
}

function handleUserConfig(record: any) {
  userConfig.id = record.id
  userConfig.visible = true
}

function clearAddDialog() {
  addDialog.visible = false
}

function handleAssignPool(data: any) {
  Object.assign(assignPoolData, { dialog: true, data: { id: data.id } })
}

function handleRemove(id: number) {
  ElMessageBox.confirm('您确定要删除该租户吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    removeTenant(id).then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        getList()
      }
    })
  })
}

function getList() {
  loading.value = true
  getTenant(params)
    .then((data: any) => {
      if (data.success) {
        listData.value = data.data.rows.map((item: any) => {
          item.openFlow = !!item.openFlow
          item.isInstallSoftware = !!item.isInstallSoftware
          item.paymentMode = JSON.parse(item.paymentMode || '["Hour","Month"]')
          return item
        })
        total.value = data.data.total
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function handleCreate(type?: string, data?: any) {
  if (type === 'edit') {
    addData.value = Object.assign({}, data)
    dialogStatus.value = 'update'
    addDialogVisible.value = true
  } else {
    addDialog.visible = true
  }
}

async function addSubmit() {
  const data = await basicInfo.value?.getPostData()
  if (data) {
    loading.value = true
    modifyTenant(data)
      .then((res: any) => {
        if (res.success) {
          ElMessage.success(res.message)
          addDialogVisible.value = false
          getList()
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
}

function handleService(record: any) {
  Object.assign(serviceDialog, { id: record.id, quotaAble: record.quotaAble, visible: true })
}

function handlePermission(record: any) {
  Object.assign(permissionDialog, { record: { ...record }, visible: true })
}

function getDetail(id: number) {
  Object.assign(detailComponent, { id, visible: true })
}

function handleReset(id: number) {
  resetDialogVisible.value = true
  resetData.value = { id }
}

function resetSubmit() {
  resetForm.value?.validate((valid: boolean) => {
    if (valid) {
      const { id, password } = resetData.value
      loading.value = true
      resetTenantPsw(id, { password: crypto.encrypt(password) })
        .then((data: any) => {
          if (data.success) {
            resetDialogVisible.value = false
            ElMessage.success(data.message)
          }
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

function handleOperate(id: number, action: string) {
  let tip: string | undefined
  if (action === 'lock') tip = '是否冻结该租户？'
  else if (action === 'active') tip = '是否解冻该租户？'
  else if (action === 'logout') tip = '是否注销该租户？'
  if (!tip) return
  ElMessageBox.confirm(tip, '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  })
    .then(() => {
      operateTenant(id, action).then((data: any) => {
        if (data.success) {
          ElMessage.success(data.message)
          getList()
        }
      })
    })
    .catch(() => {})
}

async function handleRecharge(row: any) {
  const data = await getTenantAccount(row.id)
  if (data.success) {
    rechargeData.value = data.data
    rechargeDialogVisible.value = true
  }
}

function rechargeSubmit() {
  if (rechargeData.value.accountTotal !== 0 && !rechargeData.value.accountTotal) {
    ElMessage.error('授信额度不能为空')
    return
  }
  loading.value = true
  createTenantAccount(rechargeData.value)
    .then((data: any) => {
      if (data.success) {
        rechargeDialogVisible.value = false
        ElMessage.success(data.message)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

async function getModulesData() {
  loading.value = true
  const data = await getModules()
  if (data.success) {
    loading.value = false
    modulesData.value = data.data
    if (modulesData.value.length) {
      apiGrantData.value.module = modulesData.value[0].value
      changeModule(apiGrantData.value.module)
    }
  }
}

async function changeModule(value: string) {
  modulesList.value = []
  apiGrantData.value.selectAll = false
  apiGrantData.value.apis = []
  loading.value = true
  const data = await getApiById(apiGrantData.value.id, { module: value })
  if (data.success) {
    apisById.value = data.data
  }
  getModulesByName(value).then((data2: any) => {
    if (data2.success) {
      loading.value = false
      modulesList.value = data2.data
      modulesList.value.forEach((item: any) => {
        item.label = item.name
        item.value.forEach((target: any) => {
          target.label = `${target.method}: ${target.operation} (${target.url})`
          if (apisById.value.indexOf(target.operation) > -1) {
            apiGrantData.value.apis.push(target)
          }
          apitreeRef.value?.setCheckedKeys(apisById.value)
        })
      })
    }
  })
}

function changeCheckApi(obj: any, isChecked: boolean) {
  if (isChecked) {
    apiGrantData.value.apis.push(obj)
  } else {
    const index = apiGrantData.value.apis.indexOf(obj.pattern)
    if (index != -1) apiGrantData.value.apis.splice(index, 1)
  }
}

function selectAll(val: boolean) {
  const arr: string[] = []
  if (val) {
    modulesList.value.forEach((item: any) => {
      item.value.forEach((target: any) => {
        arr.push(target.pattern)
      })
    })
  }
  apitreeRef.value?.setCheckedKeys(arr)
}

async function changeRoutes() {
  const { asyncRouterMap } = await import('@/router')
  return permissionStore.changeRoutes(asyncRouterMap, router, resetRouter)
}

function apiGrantSubmit() {
  const nodes: any[] = apitreeRef.value?.getCheckedNodes() || []
  const { id, module } = apiGrantData.value
  const apis: any[] = []
  nodes.forEach((item: any) => {
    if (!item.value) apis.push(item)
  })
  loading.value = true
  updateApi(id, { apis: JSON.stringify(apis), module }).then((data: any) => {
    if (data.success) {
      ElMessage.success(data.message)
      apiGrantVisible.value = false
      changeRoutes()
      getList()
    }
    loading.value = false
  })
}

</script>

<style scoped>
.custom-tree-node {
  color: #409eff;
}
</style>
