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
      </AdvanceTable>
    </div>
    <!--详情界面-->
    <ApplyDetail v-if="detailVisible" :record="currentRecord" @goBack="detailVisible = false"></ApplyDetail>
  </div>
</template>
<script lang="ts">
import { columns, searchConfigs } from './config'
import ApplyDetail from '../ApplyDetail.vue'
import { getFlowInstance, terminateInstance } from 'services/services/flow'
import { defineComponent, ref } from '@vue/composition-api'
import useTable from 'hooks/useTable'
export default defineComponent({
  components: {
    ApplyDetail
  },
  setup() {
    const { getList, loading, params, total, list } = useTable({
      getService: getFlowInstance,
      params: {
        type: 'AUDITED'
      }
    })
    // 详情
    const detailVisible = ref(false)
    const currentRecord = ref({})
    function getDetail(record: any) {
      detailVisible.value = true
      currentRecord.value = record
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
      currentRecord
    }
  }
})
</script>
