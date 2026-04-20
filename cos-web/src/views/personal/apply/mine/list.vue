<template>
  <div class="wrapper">
    <div v-show="!detailVisible">
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
        </template>
      </AdvanceTable>
    </div>
    <ApplyDetail v-if="detailVisible" :record="currentRecord" @goBack="detailVisible = false"></ApplyDetail>
  </div>
</template>
<script lang="ts">
import { columns, searchConfigs } from './config'
import ApplyDetail from '../ApplyDetail.vue'
import { getFlowInstance, terminateInstance } from 'services/services/flow'
import { defineComponent, ref } from '@vue/composition-api'
import useTable from 'hooks/useTable'
import { MessageBox, Message } from 'element-ui'
export default defineComponent({
  components: {
    ApplyDetail
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
      stopApply
    }
  }
})
</script>
