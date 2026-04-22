<template>
  <div>
    <AdvanceTable title="历史记录列表" :data="list" :params="params" :total="total" :searchConfigs="historySearchConfigs" :columns="historyColumns" :get-list="getList" :loading="loading">
      <template #name="val, record">
        <el-button type="text" @click="toggleDialog(record)">
          {{ val }}
        </el-button>
      </template>
      <template #type="type">
        <span>{{ type | getInspectTypeName }}</span>
      </template>
    </AdvanceTable>
    <!--详情-->
    <add-history v-if="detailDialog.show" :dialog="detailDialog"></add-history>
  </div>
</template>

<script>
import { getInspectTypeName } from './utils/index'
import { getPatchHistory, getPatchDetailHistory } from 'services/task/patch'
import { historyColumns, historySearchConfigs } from './config'

export default {
  components: {
    AddHistory: () => import('./components/addHistory')
  },
  data() {
    return {
      historyColumns,
      historySearchConfigs: [...historySearchConfigs],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      detailDialog: {
        show: false
      },
      runStatusList: [
        { id: 'STARTING', name: '启动中' },
        { id: 'RUNNING', name: '执行中' },
        { id: 'SUCCESS', name: '成功' },
        { id: 'ERROR', name: '错误' }
      ],
      detailParams: {},
      historyData: []
    }
  },
  filters: {
    getInspectTypeName
  },
  created() {
    const patchId = this.$route.query.id
    patchId && this.historySearchConfigs.push({
      type: 'Const',
      value: 'patchId',
      initValue: patchId
    })
  },
  methods: {
    getList() {
      getPatchHistory(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    toggleDialog(item) {
      const failSuccessTotal = item.failSuccessTotal
      this.detailDialog.data = item
      if (failSuccessTotal) {
        const hd = failSuccessTotal.split(' / ')
        this.detailDialog.data.failNum = hd[0] || 0
        this.detailDialog.data.successNum = hd[1] || 0
        this.detailDialog.data.totalNum = hd[2] || 0
      }
      this.detailDialog.id = item.id
      this.detailDialog.show = true
    }
  }
}
</script>
