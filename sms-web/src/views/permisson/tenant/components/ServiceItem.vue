<template>
  <!-- TODO: cmp-element basic-form / basic-form-item -->
  <basic-form label-position="top">
    <basic-form-item label="启用配额：">
      <el-radio-group v-model="quotaAble" @change="quotaChange" :disabled="props.noConfigs">
        <el-radio-button :value="true">是</el-radio-button>
        <el-radio-button :value="false">否</el-radio-button>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="基础配额：" v-if="quotaAble">
      <QuotaItem :quotaData="metas" style="width: 650px"></QuotaItem>
    </basic-form-item>
    <basic-form-item label="服务授权：">
      <el-row :gutter="10">
        <LeftMenu @node-click="handleNodeClick"></LeftMenu>
        <el-col :span="18" style="width: calc(100% - 200px); padding-bottom: 20px">
          <!-- TODO: cmp-element SmartTable -->
          <SmartTable :data="resultList" :rows="10" row-key="id" @selection-change="handleSelectionChange" ref="tableRef">
            <el-table-column type="selection" :reserve-selection="true"> </el-table-column>
            <el-table-column prop="name" width="160px" label="服务名称" show-overflow-tooltip=""> </el-table-column>
            <el-table-column prop="quota" label="服务配额" width="156px" v-if="quotaAble">
              <template #default="scope">
                <span v-if="!scope.row.unit">该服务无需配额</span>
                <el-input-number v-else v-model="scope.row.quota" :min="scope.row.minQuota || 0" :max="scope.row.maxQuota || 0"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="配额范围" show-overflow-tooltip="" v-if="quotaAble">
              <template #default="scope">
                <span>{{ scope.row.minQuota }} - {{ scope.row.maxQuota }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位"> </el-table-column>
          </SmartTable>
        </el-col>
      </el-row>
    </basic-form-item>
  </basic-form>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted } from 'vue'
import QuotaItem from './QuotaItem.vue'
import LeftMenu from './LeftMenu.vue'
import { getTenantQuotaServices } from 'services/services/catelog'
import { getBaseQuotas, getTenantBaseQuotas } from 'services/system/tenant'

const props = defineProps<{
  tenantId?: number
  tenantQuota?: boolean
  noConfigs?: boolean
}>()

const loading = ref(false)
const quotaAble = ref<boolean>(!!props.tenantQuota)
const nodeId = ref<number>(0)
const metas = ref<any[]>([])
const selections = ref<any[]>([])
const action = ref('toCreateTenant')
const serviceList = ref<any[]>([])
const tableRef = ref<any>(null)

const resultList = computed(() => {
  return serviceList.value.filter((item: any) => {
    return !nodeId.value || item.catalogId === Number(nodeId.value)
  })
})

onMounted(() => {
  init()
})

async function init() {
  if (props.tenantId) {
    action.value = 'toAssignTenant'
  }
  getTenantServices(action.value)
  const res: any = props.tenantId ? await getTenantBaseQuotas(props.tenantId) : await getBaseQuotas()
  if (res.success) {
    metas.value = res.data
  }
}

async function checkDisplay(list: any[]) {
  await nextTick()
  list
    .filter((item) => item.check)
    .forEach((row) => {
      tableRef.value?.toggleRowSelection(row, true)
    })
}

function handleSelectionChange(selected: any[]) {
  selections.value = selected
}

async function getTenantServices(event: string) {
  loading.value = true
  const res: any = await getTenantQuotaServices(props.tenantId, { event, quotaAble: quotaAble.value })
  if (res.success) {
    serviceList.value = res.data
    checkDisplay(serviceList.value)
  }
  loading.value = false
}

function handleNodeClick(id: string | number) {
  nodeId.value = Number(id)
}

function quotaChange() {
  getTenantServices(action.value)
}

function getPostData() {
  const metasResult = metas.value.map((item: any) => {
    const { code, quota, unit } = item
    return { quota, code, unit }
  })
  const services = selections.value.map((item: any) => {
    const { id: serviceId, code, unit, quota } = item
    return { serviceId, code, unit, quota }
  })
  return {
    services,
    quotaAble: quotaAble.value,
    metas: metasResult
  }
}

defineExpose({ getPostData, selections })
</script>

<style scoped lang="scss">
:deep(.el-form-item) {
  display: flex;
}
:deep(.el-form-item__content) {
  line-height: normal;
  flex: 1;
}
</style>
