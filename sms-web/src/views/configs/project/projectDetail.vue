<template>
  <!-- TODO: cmp-element - 自研包在 compat 层处理：common-detail / common-detail-item / AdvanceTable / status-icon -->
  <common-detail :title="detailData.name" @goBack="goBack">
    <template #item_container>
      <common-detail-item :label="appStore.systemConfig.projectConfigLabel + '名称'">{{ detailData.name }}</common-detail-item>
      <common-detail-item label="资源属性">{{ handleVisibility(detailData.visibility) }}</common-detail-item>
      <common-detail-item :label="appStore.systemConfig.projectConfigLabel + '编号'">{{ detailData.code }}</common-detail-item>
      <common-detail-item :label="appStore.systemConfig.projectConfigLabel + '经理'">{{ detailData.managerName }}</common-detail-item>
      <common-detail-item :label="'所属' + appStore.systemConfig.serviceConfigLabel">{{ detailData.businessName }}</common-detail-item>
      <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
      <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
    </template>
    <el-tabs value="second">
      <el-tab-pane label="成员列表" name="second">
        <AdvanceTable :card-border="false" class="table" title="" :data="list" :search-configs="searchConfigs" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
          <template #status="{ val: status, record }">
            <status-icon :type="generalStatusFilter(status, 'color')">
              {{ generalStatusFilter(status, 'status') }}
            </status-icon>
          </template>
          <template #sex="{ val, record }"> {{ sexFilter(val) }} </template>
          <template #projectManager="{ val, record }">
            {{ projectManager(val) }}
          </template>
        </AdvanceTable>
      </el-tab-pane>
    </el-tabs>
  </common-detail>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAppStore } from '@/stores'
import { getUser } from 'services/system/user'
import { generalStatusFilter, sexFilter } from '@/filters/common'

interface DetailData {
  id: number | string
  name?: string
  visibility?: string
  code?: string
  managerName?: string
  businessName?: string
  gmtCreate?: string
  remark?: string
  visible?: boolean
  [key: string]: unknown
}

const props = defineProps<{ detailData: DetailData }>()

const appStore = useAppStore()

// TODO: type - 成员行类型后续补 interface
const list = ref<any[]>([])
const loading = ref(false)
const total = ref(0)

const columns = [
  { label: '登录账号', prop: 'account' },
  { label: '用户姓名', prop: 'name' },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '角色', prop: 'projectManager', scopedSlots: { customRender: 'projectManager' } },
  { label: '邮箱', prop: 'email' },
  { label: '创建时间', prop: 'gmtCreate' },
  { label: '性别', prop: 'sex', scopedSlots: { customRender: 'sex' } },
  { label: '联系方式', prop: 'mobile' }
]

const searchConfigs = [{ type: 'Const', value: 'projectId', sign: 'EQ', initValue: props.detailData.id }]
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })

function handleVisibility(visibility?: string): string {
  if (visibility === 'visible') return '查看权限'
  if (visibility === 'invisible') return '无权限'
  if (visibility === 'manageable') return '管理权限'
  return ''
}

function projectManager(val: any): string {
  return val ? appStore.systemConfig.projectConfigLabel + '经理' : '成员'
}

async function getList() {
  loading.value = true
  const res = await getUser(params)
  if (res.success) {
    list.value = res.data.rows
    total.value = res.data.total
  }
  loading.value = false
}

function goBack() {
  props.detailData.visible = false
}
</script>

<style lang="scss" scoped>
.name-cell {
  display: flex;
  align-items: center;
  img {
    height: 20px;
  }
}
.table {
  :deep(.table-card) {
    border-bottom: 0 !important;
    .search-row {
      height: 0;
      overflow: hidden;
    }
  }
}
</style>
