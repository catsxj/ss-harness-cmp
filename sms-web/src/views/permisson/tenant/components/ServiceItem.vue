<template>
  <basic-form label-position="top">
    <basic-form-item label="启用配额：">
      <el-radio-group v-model="quotaAble" @change="quotaChange" :disabled="noConfigs">
        <el-radio-button :label="true">是</el-radio-button>
        <el-radio-button :label="false">否</el-radio-button>
      </el-radio-group>
    </basic-form-item>
    <basic-form-item label="基础配额：" v-if="quotaAble">
      <QuotaItem :quotaData="metas" style="width: 650px"></QuotaItem>
    </basic-form-item>
    <basic-form-item label="服务授权：">
      <el-row :gutter="10">
        <LeftMenu @nodeClick="handleNodeClick"></LeftMenu>
        <el-col :span="18" style="width: calc(100% - 200px); padding-bottom: 20px">
          <SmartTable :data="resultList" :rows="10" row-key="id" @selection-change="handleSelectionChange" ref="tableRef">
            <el-table-column type="selection" :reserve-selection="true"> </el-table-column>
            <el-table-column prop="name" width="160px" label="服务名称" show-overflow-tooltip=""> </el-table-column>
            <el-table-column prop="quota" label="服务配额" width="156px" v-if="quotaAble">
              <template slot-scope="scope">
                <span v-if="!scope.row.unit">该服务无需配额</span>
                <el-input-number v-else v-model="scope.row.quota" :min="scope.row.minQuota || 0" :max="scope.row.maxQuota || 0"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="配额范围" show-overflow-tooltip="" v-if="quotaAble">
              <template v-slot="scope">
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
<script lang="ts">
import { computed, defineComponent, reactive, toRefs, nextTick, ref } from '@vue/composition-api'
import QuotaItem from './QuotaItem.vue'
import LeftMenu from './LeftMenu.vue'
import { getTenantQuotaServices } from 'services/services/catelog'
import { getBaseQuotas, getTenantBaseQuotas } from 'services/system/tenant'

export default defineComponent({
  components: { LeftMenu, QuotaItem },
  props: {
    tenantId: {
      type: Number,
      default: 0
    },
    tenantQuota: {
      type: Boolean,
      default: false
    },
    noConfigs: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const state = reactive({
      loading: false,
      quotaAble: props.tenantQuota,
      nodeId: 0,
      metas: [],
      selections: [],
      action: 'toCreateTenant'
    })
    async function init() {
      if (props.tenantId) {
        state.action = 'toAssignTenant'
      }
      getTenantServices(state.action)
      const res = props.tenantId ? await getTenantBaseQuotas(props.tenantId) : await getBaseQuotas()
      if (res.success) {
        state.metas = res.data
      }
    }
    init()
    const resultList = computed(() => {
      return serviceList.value.filter((item: any) => {
        return !state.nodeId || item.catalogId === Number(state.nodeId)
      })
    })
    const tableRef = ref(null)
    // 复选框反现
    async function checkDisplay(list: any[]) {
      await nextTick()
      list
        .filter((item) => item.check)
        .forEach((row) => {
          ;(tableRef.value as any).toggleRowSelection(row, true)
        })
    }
    function handleSelectionChange(selections: any) {
      state.selections = selections
    }
    const serviceList = ref([])
    async function getTenantServices(event: string) {
      state.loading = true
      const res = await getTenantQuotaServices(props.tenantId, { event, quotaAble: state.quotaAble })
      if (res.success) {
        serviceList.value = res.data
        checkDisplay(serviceList.value)
      }
      state.loading = false
    }
    function handleNodeClick(nodeId: number) {
      state.nodeId = nodeId
    }
    function quotaChange() {
      getTenantServices(state.action)
    }
    function getPostData() {
      const metas = state.metas.map((item) => {
        const { code, quota, unit } = item
        return {
          quota,
          code,
          unit
        }
      })
      const services = state.selections.map((item) => {
        const { id: serviceId, code, unit, quota } = item
        return {
          serviceId,
          code,
          unit,
          quota
        }
      })
      return {
        services,
        quotaAble: state.quotaAble,
        metas: metas
      }
    }
    return {
      ...toRefs(state),
      resultList,
      tableRef,
      handleSelectionChange,
      handleNodeClick,
      getPostData,
      quotaChange
    }
  }
})
</script>
<style scoped lang="scss">
::v-deep {
  .el-form-item {
    display: flex;
  }
  .el-form-item__content {
    line-height: normal;
    flex: 1;
  }
}
</style>
