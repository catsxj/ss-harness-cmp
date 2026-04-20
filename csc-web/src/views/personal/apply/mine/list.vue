<template>
  <div class="wrapper">
    <div v-show="!detailVisible && !resubmitDialog.visible">
      <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
        <template #instanceNo="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #applyCategory="val">
          {{ val | categoryFilter }}
        </template>
        <template #instanceState="val">
          <status-icon :type="val | templateStatusFilter('color')">
            {{ val | templateStatusFilter('status') }}
          </status-icon>
        </template>
        <template #operate="val, record">
          <el-button type="text" :disabled="record.instanceState != 'ACTIVE'" @click="stopApply(record.id)" icon="el-icon-refresh-left">撤销</el-button>
          <template v-if="record.applyCategory === 'ApplicationOperate' || record.applyCategory === 'EFCApplicationOperate'">
            <div class="action-divider"></div>
            <el-button type="text" @click="resubmit(record)" icon="el-icon-help">重新发起</el-button>
          </template>
        </template>
      </AdvanceTable>
    </div>
    <re-submit v-if="resubmitDialog.visible" :configs="resubmitDialog" @getData="getList"></re-submit>
    <ApplyDetail v-if="detailVisible" :record="currentRecord" @goBack="detailVisible = false"></ApplyDetail>
  </div>
</template>
<script lang="ts">
import { columns, searchConfigs } from './config'
import ApplyDetail from '../ApplyDetail.vue'
import ReSubmit from './ReSubmit.vue'
import { getFlowInstance, terminateInstance } from 'services/services/flow'
import { defineComponent, ref } from '@vue/composition-api'
import useTable from 'hooks/useTable'
import { MessageBox, Message } from 'element-ui'
export default defineComponent({
  components: {
    ApplyDetail,
    ReSubmit
  },
  setup() {
    const { getList, loading, params, total, list } = useTable({
      getService: getFlowInstance,
      params: {
        type: 'SUBMIT'
      }
    })
    // 详情
    const detailVisible = ref(false)
    const currentRecord = ref({})
    function getDetail(record: any) {
      detailVisible.value = true
      currentRecord.value = record
    }
    // 终止
    function stopApply(id: number) {
      MessageBox.confirm('此操作将撤销该审批, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await terminateInstance(id)
        if (res.success) {
          Message.success(res.message)
          getList()
        }
      })
    }
    // 重新发起
    const resubmitDialog = ref({
      visible: false,
      record: {}
    })
    function resubmit(record: any) {
      resubmitDialog.value = {
        visible: true,
        record: { ...record }
      }
    }
    return {
      getList,
      list,
      params,
      total,
      loading,
      columns,
      searchConfigs,
      // 详情
      detailVisible,
      getDetail,
      currentRecord,
      stopApply,
      // 重新发起
      resubmitDialog,
      resubmit
    }
  }
})
</script>
