<template>
  <div class="detail">
    <!-- TODO: cmp-element common-detail -->
    <common-detail class="common" :title="detailData.name" @go-back="goBack">
      <template #item_container>
        <common-detail-item label="账号">{{ detailData.account }}</common-detail-item>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="状态">{{ generalStatusFilter(detailData.status) }}</common-detail-item>
        <common-detail-item label="开启流程自管">{{ detailData.openFlow ? '是' : '否' }}</common-detail-item>
        <common-detail-item label="开启软件安装">{{ detailData.isInstallSoftware ? '是' : '否' }}</common-detail-item>
        <common-detail-item label="付费模式">
          <span v-if="Array.isArray(detailData.paymentMode)">{{ detailData.paymentMode.map((item: string) => paymentModeFilter(item)).join('，') }}</span>
          <span v-else>--</span>
        </common-detail-item>
        <common-detail-item label="所属组织">{{ detailData.departmentName }}</common-detail-item>
        <common-detail-item label="集团编码">{{ detailData.groupCode }}</common-detail-item>
        <common-detail-item label="联系人姓名">{{ detailData.contactName }}</common-detail-item>
        <common-detail-item label="联系人电话">{{ detailData.contactPhone }}</common-detail-item>
        <common-detail-item label="联系人邮箱">{{ detailData.contactEmail }}</common-detail-item>
        <common-detail-item label="折扣系数">{{ detailData.discount }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
      </template>
      <el-tabs :model-value="currentValue" @tab-click="handleDetailTab">
        <el-tab-pane name="quota" v-if="detailData.quotaAble">
          <template #label><span>资源使用情况</span></template>
          <el-row :gutter="10">
            <!-- TODO: cmp-element empty -->
            <empty v-if="(chartsList as any[]).length === 0"> </empty>
            <el-col :span="8" v-for="item in chartsList" :key="(item as any).name">
              <el-card class="box-card m-t-sm">
                <template #header>
                  <div class="clearfix">
                    <span>{{ (item as any).name }}：</span>
                  </div>
                </template>
                <!-- TODO: cmp-echarts pie-charts -->
                <pie-charts :theme="(item as any).name" height="200px" width="100%" :data="(item as any).data" :id="(item as any).name" :unit="(item as any).unit"></pie-charts>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane name="user">
          <template #label><span>用户列表</span></template>
          <!-- TODO: cmp-element AdvanceTable -->
          <AdvanceTable :card-border="false" title="用户列表" :search-configs="userSearchConfigs" :data="userList" :params="params" :columns="userColumns" :get-list="getTenantUser" :total="userTotal" :loading="loading">
            <template #action>
              <el-button @click="handleUserConfig()">
                <el-icon><Setting /></el-icon>用户管理
              </el-button>
              <ImportData url="/api/sms/v1/users/import" @get-data="getTenantUser" template-url="/sms/v1/users/import/template" :params="{ tenantId: detailData.id }"></ImportData>
            </template>
            <template #status="status">
              <!-- TODO: cmp-element status-icon -->
              <status-icon :type="generalStatusFilter(status, 'color')">
                {{ generalStatusFilter(status, 'status') }}
              </status-icon>
            </template>
            <template #operate="{ val, record }">
              <el-button type="text" @click="removeUser(record.id)">
                <el-icon><Delete /></el-icon>移除
              </el-button>
            </template>
          </AdvanceTable>
        </el-tab-pane>
        <el-tab-pane name="service">
          <template #label><span>服务列表</span></template>
          <AdvanceTable :card-border="false" title="服务列表" :data="serviceList" :columns="serverColumns" :loading="loading" :show-tools="false">
            <template #pagination><div></div></template>
          </AdvanceTable>
        </el-tab-pane>
        <el-tab-pane label="登录记录" name="login">
          <AdvanceTable :card-border="false" :show-tools="false" :data="loginList" :params="loginParams" :columns="loginColumns" :get-list="getLogin" :total="loginTotal" :loading="loading"> </AdvanceTable>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <Transfer :key="1" @transfer-submit="transferSubmit" v-if="userConfig.visible" :config="userConfig"></Transfer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Delete } from '@element-plus/icons-vue'
import { getTenantInfo, getQuotaTenant, getTenantService, getTenantBus, getTrack, getUser, tenantRemoveUser, tenantCongigUser } from 'services/system/tenant'
import { getPool } from 'services/platform/pool'
import Transfer from './components/transfer.vue'
import ImportData from '@/common/components/import-data/index.vue'
import { generalStatusFilter, paymentModeFilter } from '@/filters/common'
import { useAppStore } from '@/stores'

interface DetailConfig {
  visible: boolean
  id: number
}

const props = defineProps<{ config: DetailConfig }>()

const appStore = useAppStore()

const loading = ref(false)
const chartsList = ref<any>({})
const detailData = ref<any>({})
const params = reactive<any>({ page: 1, rows: 10 })
const userList = ref<any[]>([])
const userTotal = ref(0)
const serviceList = ref<any[]>([])
const poolList = ref<any[]>([])
const businessList = ref<any[]>([])
const loginList = ref<any[]>([])
const loginParams = reactive<any>({ page: 1, rows: 10 })
const loginTotal = ref(0)

const userColumns = [
  { label: '登录账号', prop: 'account' },
  { label: '用户姓名', prop: 'name' },
  { label: '邮箱', prop: 'email' },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '操作', disabled: true, width: '220px', scopedSlots: { customRender: 'operate' } }
]
const serverColumns = [
  { label: '服务名称', prop: 'name' },
  { label: '服务描述', prop: 'remark' }
]
const loginColumns = [
  { label: '登录账号', prop: 'account' },
  { label: '登录IP', prop: 'requestIp' },
  { label: '响应地址', prop: 'responseIp' },
  { label: '登录结果', prop: 'detail' },
  { label: '登录时间', prop: 'gmtCreate' }
]

const userConfig = reactive<any>({
  visible: false,
  value: [],
  data: []
})

const userSearchConfigs = [{ type: 'Const', value: 'tenantId', initValue: '' as string | number }] as any[]

const currentValue = computed(() => (detailData.value.quotaAble ? 'quota' : 'user'))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pwdRule = computed(() => (appStore.systemConfig as any).pwdStrength)

onMounted(() => {
  getTenantInfoData()
  userSearchConfigs[0].initValue = props.config.id
})

async function transferSubmit(value: any[]) {
  const p = { id: props.config.id, ids: value }
  tenantCongigUser(p).then((res: any) => {
    if (res.success) {
      ElMessage.success(res.message)
      getTenantUser()
    }
  })
}

function handleUserConfig() {
  userConfig.id = props.config.id
  userConfig.visible = true
}

function removeUser(id: number) {
  ElMessageBox.confirm('您确定要移除该用户吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    tenantRemoveUser(id).then((res: any) => {
      if (res.success) {
        ElMessage.success(res.message)
        getTenantUser()
      }
    })
  })
}

function goBack() {
  props.config.visible = false
}

function handleDetailTab(tab: any) {
  switch (tab.props.name) {
    case 'quota':
      getQuotaData()
      break
    case 'user':
      params.page = 1
      getTenantUser()
      break
    case 'login':
      loginParams.page = 1
      getLogin()
      break
    case 'service':
      getTenantServiceData()
      break
    case 'pool':
      getTenantPool()
      break
    case 'business':
      getTenantBusiness()
      break
  }
}

function getTenantInfoData() {
  getTenantInfo(props.config.id).then((data: any) => {
    if (data.success) {
      detailData.value = data.data
      detailData.value.isInstallSoftware = !!detailData.value.isInstallSoftware
      detailData.value.paymentMode = JSON.parse(detailData.value.paymentMode || '["Hour","Month"]')
      if (detailData.value.quotaAble) {
        getQuotaData()
      }
    }
  })
}

function getLogin() {
  loading.value = true
  loginParams.params = JSON.stringify([{ param: { account: detailData.value.account }, sign: 'EQ' }])
  getTrack(loginParams)
    .then((data: any) => {
      if (data.success) {
        loginList.value = data.data.rows
        loginTotal.value = data.data.total
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function getQuotaData() {
  const p = { type: 'ringDiagram' }
  getQuotaTenant(props.config.id, p).then((data: any) => {
    if (data.success) {
      chartsList.value = data.data
    }
  })
}

function getTenantUser() {
  loading.value = true
  getUser(params)
    .then((data: any) => {
      if (data.success) {
        userList.value = data.data.rows
        userTotal.value = data.data.total
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function getTenantServiceData() {
  loading.value = true
  getTenantService(props.config.id)
    .then((data: any) => {
      if (data.success) {
        serviceList.value = data.data
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function getTenantPool() {
  getPool({ condition: 'listByTenantId', tenantId: props.config.id }).then((data: any) => {
    if (data.success) {
      poolList.value = data.data
    }
  })
}

function getTenantBusiness() {
  getTenantBus(props.config.id).then((data: any) => {
    if (data.success) {
      businessList.value = data.data
    }
  })
}
</script>

<style lang="scss" scoped>
.common-detail {
  bottom: 0;
}
</style>
