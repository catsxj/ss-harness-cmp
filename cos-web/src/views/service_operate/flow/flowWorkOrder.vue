<template>
  <div>
    <AdvanceTable v-show="!detailFlag" title="流程工单" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
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
    <ApplyDetail v-if="detailFlag" :record="currentRecord" @goBack="goBack"> </ApplyDetail>
  </div>
</template>
<script>
import ApplyDetail from 'views/personal/apply/ApplyDetail.vue'
import { searchConfigs } from '@/views/personal/apply/applied/config'
import { getFlowInstance } from 'services/services/flow'

export default {
  components: {
    ApplyDetail
  },
  data() {
    return {
      columns: [
        {
          label: '申请单号',
          prop: 'instanceNo',
          scopedSlots: { customRender: 'instanceNo' }
        },
        {
          label: '类型',
          prop: 'applyCategory',
          scopedSlots: { customRender: 'applyCategory' }
        },
        {
          label: '审批标题',
          prop: 'name'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '用户',
          prop: 'creatorName'
        },
        {
          label: '发起时间',
          prop: 'gmtCreate'
        },
        {
          label: '完成时间',
          prop: 'gmtFinish'
        },
        {
          label: '审批状态',
          prop: 'instanceState',
          scopedSlots: { customRender: 'instanceState' }
        }
      ],
      searchConfigs,
      loading: false,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10,
        type: 'ALL'
      },
      detailFlag: false,
      currentRecord: {}
    }
  },
  methods: {
    getList() {
      this.loading = true
      getFlowInstance(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 跳转详情页
    getDetail(record) {
      this.currentRecord = record
      this.detailFlag = true
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
