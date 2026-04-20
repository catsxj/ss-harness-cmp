<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="16">
        <div class="view-card">
          <div class="card-title">告警处理</div>
          <div class="card-body">
            <alarm-count></alarm-count>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="view-card">
          <div class="card-title">单日告警统计</div>
          <div class="card-body">
            <loop-charts class="full-height" ref="line2" id="alarm1" v-if="todayAlarmData" :data="todayAlarmData" width="100%" height="230px" type="half"></loop-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="8" v-for="(item, i) in statsMap" :key="i">
        <div class="view-card">
          <div class="card-title">{{ item.title }}</div>
          <div class="card-body">
            <pie-charts class="full-height" :ref="`stats${i}`" :id="'stats' + i" v-if="item.data" :data="item.data" width="100%" height="230px" type="half"></pie-charts>
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <div class="view-card">
          <div class="card-title">平台资源使用率</div>
          <div class="card-body">
            <res-used :item-data="usedData"></res-used>
          </div>
        </div>
      </el-col>
      <el-col :span="24">
        <res-used-top></res-used-top>
      </el-col>
      <el-col :span="24">
        <el-card class="box-card">
          <div class="card-title">
            告警历史
            <span class="pull-right">
              <el-button type="text" @click="historyAll">查看全部</el-button>
            </span>
          </div>
          <basic-table ref="table" :data="historyList">
            <el-table-column show-overflow-tooltip label="告警名称" prop="name"></el-table-column>
            <el-table-column show-overflow-tooltip label="告警级别">
              <template v-slot="scope">
                <level-icon :color="alarmLevelColorFilter(scope.row.level)">
                  {{ alarmLevelFilter(scope.row.level) }}
                </level-icon>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip label="告警源" prop="targetName"></el-table-column>
            <el-table-column show-overflow-tooltip label="资源类型" prop="resourceType">
              <template v-slot="scope">
                {{ resourceTypeMonitorFilter(scope.row.type) }}
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip label="告警状态" prop="resourceType">
              <template v-slot="scope"> {{ scope.row.confirmed ? '已确认' : '未确认' }}，{{ scope.row.solved ? '已清除' : '未清除' }} </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip label="告警内容" prop="remark"></el-table-column>
            <el-table-column show-overflow-tooltip label="告警触发时间" prop="gmtTrigger"></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { alarmLevelFilter, alarmLevelColorFilter, resourceTypeMonitorFilter } from '@/filters/index'
import { getAlarmChart, getAlarmList } from 'services/monitor/index.js'
import { getPortal } from 'services/system'
import AlarmCount from '../components/AlarmCount.vue'
import ResUsed from '../components/ResUsed.vue'
import ResUsedTop from '../components/ResUsedTop5.vue'
import levelIcon from 'views/components/statusIcon.vue'
export default {
  components: { AlarmCount, ResUsed, ResUsedTop, levelIcon },
  filters: {},
  data() {
    return {
      alarmLevelFilter,
      alarmLevelColorFilter,
      resourceTypeMonitorFilter,
      todayAlarmData: null,
      statsMap: [
        {
          title: '云主机状态统计',
          code: 'VmPie',
          data: null
        },
        {
          title: '宿主机状态统计',
          code: 'PM',
          data: null
        },
        {
          title: '平台状态统计',
          code: 'vendorStatus',
          data: null
        }
      ],
      usedData: {},
      historyList: []
    }
  },
  created() {
    this.getTodayAlarm()
    this.statsMap.forEach((item, i) => {
      this.getPlatformStats(item.code, i)
    })
    this.getHistory()
  },
  beforeDestroy() {},
  methods: {
    getTodayAlarm() {
      getAlarmChart({
        action: 'pieChart',
        time: 'TODAY'
      }).then((data) => {
        if (data.success) {
          this.todayAlarmData = data.data
        }
      })
    },
    getPlatformStats(type, i) {
      getPortal({
        code: type
      }).then((data) => {
        if (data.success) {
          this.statsMap[i].data = data.data
        }
      })
    },
    getHistory() {
      getAlarmList({
        page: 1,
        rows: 10,
        params: this.$tools.handleSearchParam({
          eventAlarm: 0,
          status: 'SOLVED'
        })
      }).then((data) => {
        if (data.success) {
          this.historyList = data.data.rows
        }
      })
    },
    historyAll() {
      this.$router.push({ name: 'HistoryMonitor' })
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .el-card__body {
  padding: 0 !important;
}
.view-card {
  height: 300px;
  box-sizing: border-box;
  border-radius: 4px;
  background: #ffffff;
  padding: 20px;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
  .card-title {
    font-weight: bold;
    color: #393b3e;
    margin-bottom: 20px;
  }
  .card-body {
    height: calc(100% - 40px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .card-operate {
    position: absolute;
    right: -32.5px;
    top: -32.5px;
    display: flex;
    z-index: 2;
    align-items: center;
    justify-content: center;
    width: 65px;
    height: 65px;
    border-radius: 50%;
    background: rgba(30, 84, 222, 0.25);
    .operate-icon {
      color: #fff;
      position: absolute;
      bottom: -24px;
      left: -18px;
      cursor: pointer;
    }
  }
}
.full-height {
  height: 100%;
}
.box-card {
  padding: 20px;
  .card-title {
    font-weight: bold;
    color: #393b3e;
    margin-bottom: 20px;
  }
}
</style>
