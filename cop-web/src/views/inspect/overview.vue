<template>
  <div class="wrapper-sm">
    <el-row class="panel data-view-panel" :gutter="20">
      <el-col :span="24" class="panel-heading">统计信息</el-col>
      <el-col :span="24" class="panel-body p-none">
        <el-col :span="6">
          <div class="small-box s-bg-primary">
            <div class="small-box-h bg-primary-h">
              <p class="m-t-lg">
                <i style="font-size:50px;" class="el-icon-success"></i>
              </p>
              <p>您今日执行数</p>
            </div>
            <div class="small-box-count">
              <div class="font-large">{{ digit.youTodayTime }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="small-box s-bg-green">
            <div class="small-box-h bg-green-h">
              <p class="m-t-lg">
                <i style="font-size:50px;" class="el-icon-success"></i>
              </p>
              <p>今日执行总数</p>
            </div>
            <div class="small-box-count">
              <div class="font-large">{{ digit.allTodayTime }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="small-box s-bg-orange">
            <div class="small-box-h bg-orange-h">
              <p class="m-t-lg">
                <i style="font-size:50px;" class="el-icon-warning"></i>
              </p>
              <p>今日告警次数</p>
            </div>
            <div class="small-box-count">
              <div class="font-large">{{ digit.warningTodayTime }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="small-box s-bg-yellow">
            <div class="small-box-h bg-yellow-h">
              <p class="m-t-lg">
                <i style="font-size:50px;" class="el-icon-error"></i>
              </p>
              <p>今日错误次数</p>
            </div>
            <div class="small-box-count">
              <div class="font-large">{{ digit.errorTodayTime }}</div>
            </div>
          </div>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="panel data-view-panel" :gutter="20">
      <el-col :span="24" class="panel-heading">巡检分类</el-col>
      <el-col :span="24" class="panel-body p-none">
        <el-col :span="4" v-for="item in category" :key="item.code" @click.native="getHistoryInfo(item.code)">
          <div class="mini-box" :class="item.code === activeCode ? 'active_box' : ''">
            <span class="label"> 今日{{ item.name }}数 </span>
            <span class="count">
              {{ item.count }}
            </span>
          </div>
        </el-col>
      </el-col>
    </el-row>
    <el-row class="panel" :gutter="20">
      <el-col :span="24" class="panel-heading">
        <span>历史巡检情况</span>
      </el-col>
      <el-col :span="24" class="panel-body">
        <line-charts height="300px" width="100%" id="taskLine" :data="history" v-if="history"></line-charts>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-row class="panel" :gutter="20">
          <el-col :span="24" class="panel-heading">
            <span style="line-height: 22px">历史巡检执行情况(近10天)</span>
          </el-col>
          <el-col :span="24" class="panel-body">
            <pie-charts height="251px" id="taskResultPie" width="100%" :data="result" v-if="result" theme="任务执行时长统计" :setting="setting"></pie-charts>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="12">
        <el-row class="panel" style="margin-right: -10px">
          <el-col :span="24" class="panel-heading">
            <span>最近巡检记录</span>
            <router-link to="/inspect/history">
              <el-button type="primary" size="mini" icon="el-icon-more" class="pull-right">更多</el-button>
            </router-link>
          </el-col>
          <el-col :span="24" class="panel-body">
            <div class="table-container">
              <el-table :data="tableData" stripe fit header-cell-class-name="custom-header" height="250">
                <el-table-column label="巡检名称" prop="name" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span class="detail-href" @click="toHistory(scope.row)">
                      {{ scope.row.name }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="执行状态" prop="status" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <status-icon v-if="scope.row.status == 'STARTING'" type="primary">启动中</status-icon>
                    <status-icon v-else-if="scope.row.status == 'RUNNING'" type="normal">执行中</status-icon>
                    <status-icon v-else-if="scope.row.status == 'SUCCESS'" type="success">成功</status-icon>
                    <status-icon v-else-if="scope.row.status == 'ERROR'" type="danger">错误</status-icon>
                  </template>
                </el-table-column>
                <el-table-column label="巡检结果" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span v-if="['STATRING', 'RUNNING'].includes(scope.row.status) || scope.row.warning == null">-</span>
                    <span v-else-if="scope.row.warning" style="color:red">告警</span>
                    <span v-else style="color:mediumseagreen">正常</span>
                  </template>
                </el-table-column>
                <el-table-column label="执行时长(s)" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{ typeof scope.row.totalTime == 'number' ? scope.row.totalTime.toFixed(2) + '秒' : '-' }}
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { getFirstPage, getHistoryInfo, getOverviewToday } from 'services/task/inspect'
export default {
  data() {
    return {
      digit: {},
      activeCode: '',
      category: [],
      history: {
        keys: [],
        values: []
      },
      result: [],
      tableData: [],
      historySetting: {
        color: ['#7270A8', '#58c386', '#ff7f50']
      },
      setting: {
        color: ['#58C386', '#ff7f50']
      }
    }
  },
  created() {
    this.getInspectData()
    this.getCategory()
  },
  methods: {
    getCategory() {
      getOverviewToday({
        limitDay: 10
      }).then(res => {
        const category = res.data?.category
        this.category = [
          {
            code: 'APPLICATION',
            name: '应用巡检',
            count: category.APPLICATION || 0
          },
          {
            code: 'HOST',
            name: '主机巡检',
            count: category.HOST || 0
          },
          {
            code: 'DB',
            name: '数据库巡检',
            count: category.DB || 0
          },
          {
            code: 'MIDDLEWARE',
            name: '中间件巡检',
            count: category.MIDDLEWARE || 0
          },
          {
            code: 'NETWORK',
            name: '网络巡检',
            count: category.NETWORK || 0
          },
          {
            code: 'OTHERS',
            name: '其他巡检',
            count: category.OTHERS || 0
          }
        ]
      })
    },
    getHistoryInfo(code) {
      if (this.activeCode === code) {
        this.activeCode = ''
        return this.getInspectData()
      }
      this.activeCode = code
      getHistoryInfo({
        category: code,
        limitDay: 10
      }).then(data => {
        if (data.success) {
          const res = data.data
          const chartData = res.chartData || {}
          this.history = {
            keys: chartData.date,
            values: [
              { name: '总数(个)', data: chartData.total || 0 },
              { name: '执行成功(个)', data: chartData.success || 0 },
              { name: '告警(个)', data: chartData.warning || 0 }
            ]
          }
          this.result = [
            { value: res.peiChartData.success, name: '执行成功' },
            { value: res.peiChartData.fail, name: '执行失败' }
          ]
          this.tableData = res.tableData?.rows
        }
      })
    },
    getInspectData() {
      getFirstPage({
        limitDay: 10
      }).then(data => {
        if (data.success) {
          const res = data.data
          this.digit.errorTodayTime = res.errorTodayTime
          this.digit.warningTodayTime = res.warningTodayTime
          this.digit.allTodayTime = res.allTodayTime
          this.digit.youTodayTime = res.youTodayTime
          this.history = {
            keys: res.chartData.date,
            values: [
              { name: '总数(个)', data: res.chartData.total },
              { name: '执行成功(个)', data: res.chartData.success },
              { name: '告警(个)', data: res.chartData.warning }
            ]
          }
          this.result = [
            { value: res.peiChartData.success, name: '执行成功' },
            { value: res.peiChartData.fail, name: '执行失败' }
          ]
          this.tableData = res.tableData.rows
        }
      })
    },
    toHistory(data) {
      if (data.type === 1) {
        // 常规巡检
        this.$router.push({
          name: 'InspectHistory',
          query: {
            routineId: data.routineId
          }
        })
      } else if (data.type === 2) {
        // 定时巡检
        this.$router.push({
          name: 'InspectHistory',
          query: {
            timingId: data.timingId
          }
        })
      } else {
        // 快速巡检
        this.$router.push({
          name: 'InspectHistory',
          query: {
            fastInspectId: data.id
          }
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.mini-box {
  border-radius: 5px;
  position: relative;
  margin: 20px 0;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
  cursor: pointer;
  background: #fff;

  &:hover {
    background: #58c386;

    .label {
      color: #fff;
    }

    .count {
      color: #fff;
    }
  }

  .label {
    display: inline-block;
    margin: 20px 0;
    font-size: 18px;
    color: #333;
    font-weight: 500;
  }

  .count {
    display: inline-block;
    font-size: 22px;
    color: #409eff;
  }
}

.active_box {
  border-radius: 5px;
  position: relative;
  margin: 20px 0;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #eee;
  cursor: pointer;
  color: #fff;
  background: #58c386;

  .label {
    display: inline-block;
    margin: 20px 0;
    font-size: 18px;
    color: #fff;
  }

  .count {
    display: inline-block;
    font-size: 22px;
    color: #fff;
  }
}

.small-box {
  border-radius: 2px;
  position: relative;
  display: block;
  margin: 20px 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  height: 155px;
  color: #fff;
}

.small-box-h {
  position: absolute;
  top: 0;
  right: 0;
  width: 35%;
  height: 100%;
}

.small-box-h > p {
  text-align: center;
}

.data-view-panel .small-box-count {
  width: 65%;
  color: #fff;
  padding: 10px 5px 5px 20px;
}

.font-large {
  font-size: 25px;
}

.s-bg-primary {
  background-color: #7c79b6;
}

.bg-primary-h {
  background-color: #7270a8;
}

.s-bg-green {
  background-color: #58c386;
}

.bg-green-h {
  background-color: #51b47b;
}

.s-bg-orange {
  background-color: #ff9a50;
}

.bg-orange-h {
  background-color: coral;
}

.s-bg-yellow {
  background-color: #efb04e;
}

.bg-yellow-h {
  background-color: #dca249;
}

.dashborad-task .chart {
  height: 400px;
  padding-top: 15px;
}

.m-t-xs {
  margin-top: 3px;
}
</style>
