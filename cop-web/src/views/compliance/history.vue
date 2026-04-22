<template>
  <div>
    <AdvanceTable :title="titleName" :data="list" :params="params" :total="total" :searchConfigs="historySearchConfigs" :columns="historyColumns" :get-list="getList" :loading="loading" r>
      <template #name="val, record">
        <!-- 执行结束可以查看详情 -->
        <template v-if="record.status == 'SUCCESS' || record.status == 'ERROR'">
          <span class="detail-href" @click="toggleDialog(record)">
            {{ val }}
          </span>
        </template>
        <template v-else>
          {{ val }}
        </template>
      </template>
      <template #type="type">
        {{ type === 0 ? '常规任务' : '定时任务' }}
      </template>
      <template #status="status">
        <status-icon v-if="status == 'STARTING'" type="primary">启动中</status-icon>
        <status-icon v-else-if="status == 'RUNNING'" type="normal">执行中</status-icon>
        <status-icon v-else-if="status == 'SUCCESS'" type="success">成功</status-icon>
        <status-icon v-else-if="status == 'ERROR'" type="danger">错误</status-icon>
      </template>
      <template #passRates="passRates">
        <el-progress :text-inside="true" :stroke-width="16" :percentage="parseInt(passRates)" :status="getStatusColor(passRates)"></el-progress>
      </template>
    </AdvanceTable>
    <!--详情-->
    <history-detail v-if="detailDialog.show" :dialog="detailDialog"></history-detail>
  </div>
</template>

<script>
import { getHistoryList } from 'services/task/compliance'
import { historyColumns, historySearchConfigs } from './config'
export default {
  components: {
    HistoryDetail: () => import('./components/historyDetail')
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
      searchData: [],
      superSearchList: [],
      total: 0,
      detailDialog: {
        show: false
      },
      detailParams: {},
      detailInfo: {},
      historyData: [],
      runErrorData: [],
      warningData: [],
      activeNames: [],
      activeName: 'history',
      createVisible: false
    }
  },
  computed: {
    titleName() {
      const { name = '' } = this.$route.query;
      return `${name && `【${name}】`}历史记录列表`
    }
  },
  created() {
    const { timingId, routineId } = this.$route.query;
    timingId && (this.historySearchConfigs.push({
      type: 'Const',
      value: 'timingId',
      initValue: timingId
    }));
    routineId && (this.historySearchConfigs.push({
      type: 'Const',
      value: 'routineId',
      initValue: routineId
    }));
  },
  methods: {
    getStatusColor(data) {
      const parseData = parseFloat(data)
      if (parseData <= 60) {
        return 'exception'
      } else if (parseData > 60 && parseData <= 80) {
        return 'warning'
      } else {
        return 'success'
      }
    },
    // 获取所有数据
    getAll() {
      this.$router.replace({ name: 'ComplianceHistory' })
      this.searchData = []
      this.getList()
    },
    getColorClass(val) {
      if (val !== null) {
        const data = parseInt(val.replace('%', ''), 10)
        let className = ''
        if (data < 60) {
          className = 'color_r'
        } else if (data >= 60 && data < 80) {
          className = 'color_y'
        } else {
          className = 'color_g'
        }
        return className
      }
    },
    getList(data) {
      // const params = {
      //   page: this.params.page,
      //   rows: this.params.rows,
      //   sorter: JSON.stringify({ gmtCreate: '1' })
      // }
      // this.searchData = data?.searchData || this.searchData
      // if (this.$route.query.routingId) {
      //   // 常规检查
      //   this.searchData = this.searchData.concat([
      //     {
      //       param: {
      //         routineId: this.$route.query.routingId
      //       },
      //       sign: 'EQ'
      //     },
      //     {
      //       param: {
      //         type: 0
      //       },
      //       sign: 'EQ'
      //     }
      //   ])
      // } else if (this.$route.query.timingId) {
      //   this.searchData = this.searchData.concat([
      //     {
      //       param: {
      //         timingId: this.$route.query.timingId
      //       },
      //       sign: 'EQ'
      //     },
      //     {
      //       param: {
      //         type: 1
      //       },
      //       sign: 'EQ'
      //     }
      //   ])
      // }
      // params.params = JSON.stringify([...this.searchData])
      getHistoryList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    toggleDialog(item) {
      this.detailDialog.data = item
      this.detailDialog.id = item.id
      this.detailDialog.show = true
    }
  }
}
</script>

<style lang="scss" scoped>
.color_r {
  color: #f56c6c;
}
.color_y {
  color: #e6a23c;
}
.color_g {
  color: #67c23a;
}
</style>
