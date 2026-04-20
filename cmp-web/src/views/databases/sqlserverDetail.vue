<template>
  <el-card>
    <common-detail :setting="{ type: 'Sqlserver' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detailData.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="vmStatusColorFilter(detailData.status)">{{ databaseFilter(detailData.status) }} </status-icon>
        </common-detail-item>
        <common-detail-item label="部署方式">{{ detailData.category }}</common-detail-item>
        <common-detail-item label="配置">{{ detailData.spec ? detailData.spec : '--' }}</common-detail-item>
        <common-detail-item label="数据盘">{{ detailData.dataDisk ? detailData.dataDisk + 'GB' : '--' }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="过期时间">{{ detailData.expiredTime ? detailData.expiredTime : '无限期' }}</common-detail-item>
        <common-detail-item label="服务地址">{{ detailData.address }}</common-detail-item>
      </template>
      <el-row :gutter="5">
        <el-col :span="12" v-for="chart in typeData" :key="chart.value">
          <el-card class="box-card m-t-xs">
            <div slot="header" class="clearfix">
              <span>
                {{ chart.name }}
              </span>
              <span class="pull-right">
                <el-button-group>
                  <el-button size="mini" :type="item.value == mssql[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                  <el-button size="mini" :type="mssql[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <line-charts ref="mssql" height="220px" width="100%" :id="chart.value + 'mssql'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </common-detail>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </el-card>
</template>
<script>
import { vmStatusColorFilter, databaseFilter } from '@/filters/index'
import userDefind from '../compute/cloud/hostDetail/userDefind.vue'
import { getCharts } from 'services/monitor'
import { getRdsDetail } from 'services/monitor/database'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: 'CPU', value: 'first' },
  { name: '内存', value: 'second' },
  { name: '连接数', value: 'third' },
  { name: '文件使用量', value: 'fourth' },
  { name: 'TPS', value: 'fifth' },
  { name: 'IOPS', value: 'sixth' },
  { name: '登录', value: 'seventh' },
  { name: 'SQL', value: 'eighth' },
  { name: '表扫描', value: 'ninth' },
  { name: '缓存', value: 'tenth' }
]
export default {
  components: {
    userDefind
  },
  beforeDestroy() {
    this.clear()
  },
  data() {
    return {
      vmStatusColorFilter,
      databaseFilter,
      categoryFilter: {
        standalone: '单机',
        cluster: '集群'
      },
      intervalData,
      typeData,
      resourceId: Number(this.$route.query.id),
      detailData: {},
      // 图表
      dashboradData: {
        first: null,
        second: null,
        third: null,
        fourth: null,
        fifth: null,
        sixth: null,
        seventh: null,
        eighth: null,
        ninth: null,
        tenth: null
      },
      mssql: {
        first: {},
        second: {},
        third: {},
        fourth: {},
        fifth: {},
        sixth: {},
        seventh: {},
        eighth: {},
        ninth: {},
        tenth: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      firstTime: [],
      secondTime: [],
      thirdTime: [],
      fourthTime: [],
      fifthTime: [],
      sixthTime: [],
      seventhTime: [],
      eighthTime: [],
      ninthTime: [],
      tenthTime: [],
      firstInterval: '',
      secondInterval: '',
      thirdInterval: '',
      fourthInterval: '',
      fifthInterval: '',
      sixthInterval: '',
      seventhInterval: '',
      eighthInterval: '',
      ninthInterval: '',
      tenthInterval: ''
    }
  },
  methods: {
    handleClick() {
      this.changeInterval('1H', 'first')
      this.changeInterval('1H', 'second')
      this.changeInterval('1H', 'third')
      this.changeInterval('1H', 'fourth')
      this.changeInterval('1H', 'fifth')
      this.changeInterval('1H', 'sixth')
      this.changeInterval('1H', 'seventh')
      this.changeInterval('1H', 'eighth')
      this.changeInterval('1H', 'ninth')
      this.changeInterval('1H', 'tenth')
    },
    goBack() {
      this.$router.go(-1)
    },
    getDetail() {
      getRdsDetail(this.resourceId).then((data) => {
        if (data.success) {
          this.detailData = data.data
          if (this.detailData.spec) {
            this.detailData.spec = JSON.parse(this.detailData.spec)
            this.detailData.dataDisk = this.detailData.spec ? this.detailData.spec.dataDisk : ''
            this.detailData.spec = this.detailData.spec.cpu + '核/' + this.detailData.spec.memory + 'GB/' + this.detailData.spec.disk + 'GB'
          }
          this.detailData.category = this.categoryFilter[this.detailData.category]
          this.detailData.expiredTime = this.detailData.expiredTime ? (this.detailData.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detailData.expiredTime) : this.detailData.expiredTime
        }
      })
    },
    computeInterval(type, value, callback) {
      this.mssql[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.mssql[type].start = this.mssql[type].end - 3600
          break
        case '6H':
          this.mssql[type].start = this.mssql[type].end - 6 * 3600
          break
        case '1D':
          this.mssql[type].start = this.mssql[type].end - 24 * 3600
          break
        case '7D':
          this.mssql[type].start = this.mssql[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.mssql[type].start = this.mssql[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.mssql[type].end - this.mssql[type].start
        this.mssql[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.mssql[type].step = value
      switch (type) {
        case 'first':
          this.computeInterval(type, value, this.getFirst)
          break
        case 'second':
          this.computeInterval(type, value, this.getSecond)
          break
        case 'third':
          this.computeInterval(type, value, this.getThird)
          break
        case 'fourth':
          this.computeInterval(type, value, this.getFourth)
          break
        case 'fifth':
          this.computeInterval(type, value, this.getFifth)
          break
        case 'sixth':
          this.computeInterval(type, value, this.getSixth)
          break
        case 'seventh':
          this.computeInterval(type, value, this.getSeventh)
          break
        case 'eighth':
          this.computeInterval(type, value, this.getEighth)
          break
        case 'ninth':
          this.computeInterval(type, value, this.getNinth)
          break
        case 'tenth':
          this.computeInterval(type, value, this.getTenth)
          break
      }
    },
    getFirst() {
      const str1 = 'round(sum(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="CPU usage %",object=~".*:Resource Pool Stats"}) by (counter,object,sql_instance,rds_id),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mssql.first.stepValue,
        start: this.mssql.first.start,
        end: this.mssql.first.end,
        expr: expr,
        name: '["CPU使用率"]',
        unit: '%'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.first = Object.assign({}, data.data)
          if (this.firstInterval) {
            clearInterval(this.firstInterval)
            this.firstInterval = ''
          }
          if (this.mssql.first.step != 0) {
            this.firstInterval = setInterval(() => {
              this.computeInterval('first', this.mssql.first.step, this.getFirst)
            }, 60 * 1000)
          }
        }
      })
    },
    getSecond() {
      const str1 = 'round(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Target Server Memory (KB)"}/1024,0.01)'
      const str2 = 'round(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Total Server Memory (KB)"}/1024,0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mssql.second.stepValue,
        start: this.mssql.second.start,
        end: this.mssql.second.end,
        expr: expr,
        name: '["实例内存总量", "内存使用总量"]',
        unit: 'MB'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.second = Object.assign({}, data.data)
          if (this.secondInterval) {
            clearInterval(this.secondInterval)
            this.secondInterval = ''
          }
          if (this.mssql.second.step != 0) {
            this.secondInterval = setInterval(() => {
              this.computeInterval('second', this.mssql.second.step, this.getSecond)
            }, 60 * 1000)
          }
        }
      })
    },
    getThird() {
      const str1 = 'sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="User Connections"}'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mssql.third.stepValue,
        start: this.mssql.third.start,
        end: this.mssql.third.end,
        expr: expr,
        name: '["用户连接数"]',
        unit: '个'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.third = Object.assign({}, data.data)
          if (this.thirdInterval) {
            clearInterval(this.thirdInterval)
            this.thirdInterval = ''
          }
          if (this.mssql.third.step != 0) {
            this.thirdInterval = setInterval(() => {
              this.computeInterval('third', this.mssql.third.step, this.getThird)
            }, 60 * 1000)
          }
        }
      })
    },
    getFourth() {
      const str1 = 'round(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Data File(s) Size (KB)",case="Total"}/1024,0.01)'
      const str2 = 'round(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Log File(s) Size (KB)",case="Total"}/1024,0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mssql.fourth.stepValue,
        start: this.mssql.fourth.start,
        end: this.mssql.fourth.end,
        expr: expr,
        name: '["数据文件使用总量", "日志文件使用总量"]',
        unit: 'MB'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.fourth = Object.assign({}, data.data)
          if (this.fourthInterval) {
            clearInterval(this.fourthInterval)
            this.fourthInterval = ''
          }
          if (this.mssql.fourth.step != 0) {
            this.fourthInterval = setInterval(() => {
              this.computeInterval('fourth', this.mssql.fourth.step, this.getFourth)
            }, 60 * 1000)
          }
        }
      })
    },
    getFifth() {
      const str1 = 'round(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Transactions/sec",case="Total"}[5m]),0.01)'
      const str2 = 'round(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Number of Deadlocks/sec",case="Total"}[5m]),0.01)'
      const str3 = 'round(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Lock Timeouts/sec"}[5m]),0.01)'
      const str4 = 'round(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Lock Waits/sec"}[5m]),0.01)'
      const expr = JSON.stringify([str1, str2, str3, str4])
      getCharts({
        step: this.mssql.fifth.stepValue,
        start: this.mssql.fifth.start,
        end: this.mssql.fifth.end,
        expr: expr,
        name: '["每秒事务数", "每秒死锁数", "每秒锁超时数", "每秒锁等待数"]',
        unit: '次'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.fifth = Object.assign({}, data.data)
          if (this.fifthInterval) {
            clearInterval(this.fifthInterval)
            this.fifthInterval = ''
          }
          if (this.mssql.fifth.step != 0) {
            this.fifthInterval = setInterval(() => {
              this.computeInterval('fifth', this.mssql.fifth.step, this.getFifth)
            }, 60 * 1000)
          }
        }
      })
    },
    getSixth() {
      const str1 = 'round(sum(irate(sqlserver_database_io_reads{rds_id="' + this.resourceId + '",}[5m])+ irate(sqlserver_database_io_writes[5m])),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mssql.sixth.stepValue,
        start: this.mssql.sixth.start,
        end: this.mssql.sixth.end,
        expr: expr,
        name: '["IOPS"]',
        unit: 'IO/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.sixth = Object.assign({}, data.data)
          if (this.sixthInterval) {
            clearInterval(this.sixthInterval)
            this.sixthInterval = ''
          }
          if (this.mssql.sixth.step != 0) {
            this.sixthInterval = setInterval(() => {
              this.computeInterval('sixth', this.mssql.sixth.step, this.getSixth)
            }, 60 * 1000)
          }
        }
      })
    },
    getSeventh() {
      const str1 = 'round(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Logins/sec"}[5m]),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mssql.seventh.stepValue,
        start: this.mssql.seventh.start,
        end: this.mssql.seventh.end,
        expr: expr,
        name: '["每秒登录次数"]',
        unit: '次'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.seventh = Object.assign({}, data.data)
          if (this.seventhInterval) {
            clearInterval(this.seventhInterval)
            this.seventhInterval = ''
          }
          if (this.mssql.seventh.step != 0) {
            this.seventhInterval = setInterval(() => {
              this.computeInterval('seventh', this.mssql.seventh.step, this.getSeventh)
            }, 60 * 1000)
          }
        }
      })
    },
    getEighth() {
      const str1 = 'round(sum(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Request Count"}[5m])),0.01)'
      const str2 = 'round(sum(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="SQL Compilations/sec"}[5m])),0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mssql.eighth.stepValue,
        start: this.mssql.eighth.start,
        end: this.mssql.eighth.end,
        expr: expr,
        name: '["每秒SQL语句执行数", "每秒SQL语句编译数"]',
        unit: '次'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.eighth = Object.assign({}, data.data)
          if (this.eighthInterval) {
            clearInterval(this.eighthInterval)
            this.eighthInterval = ''
          }
          if (this.mssql.eighth.step != 0) {
            this.eighthInterval = setInterval(() => {
              this.computeInterval('eighth', this.mssql.eighth.step, this.getEighth)
            }, 60 * 1000)
          }
        }
      })
    },
    getNinth() {
      const str1 = 'round(irate(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Full Scans/sec"}[5m]),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mssql.ninth.stepValue,
        start: this.mssql.ninth.start,
        end: this.mssql.ninth.end,
        expr: expr,
        name: '["每秒全表扫描次数"]',
        unit: '次'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.ninth = Object.assign({}, data.data)
          if (this.ninthInterval) {
            clearInterval(this.ninthInterval)
            this.ninthInterval = ''
          }
          if (this.mssql.ninth.step != 0) {
            this.ninthInterval = setInterval(() => {
              this.computeInterval('ninth', this.mssql.ninth.step, this.getNinth)
            }, 60 * 1000)
          }
        }
      })
    },
    getTenth() {
      const str1 = 'round(sqlserver_performance_value{rds_id="' + this.resourceId + '",counter="Buffer cache hit ratio"},0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mssql.tenth.stepValue,
        start: this.mssql.tenth.start,
        end: this.mssql.tenth.end,
        expr: expr,
        name: '["缓存命中率"]',
        unit: '%'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.tenth = Object.assign({}, data.data)
          if (this.tenthInterval) {
            clearInterval(this.tenthInterval)
            this.tenthInterval = ''
          }
          if (this.mssql.tenth.step != 0) {
            this.tenthInterval = setInterval(() => {
              this.computeInterval('tenth', this.mssql.tenth.step, this.getTenth)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.mssql[this.chartType].step = 0
        this.mssql[this.chartType].start = Math.round(value[0] / 1000)
        this.mssql[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.mssql[this.chartType].end - this.mssql[this.chartType].start
        this.mssql[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'first':
            this.firstTime = value
            this.getFirst()
            break
          case 'second':
            this.secondTime = value
            this.getSecond()
            break
          case 'third':
            this.thirdTime = value
            this.getThird()
            break
          case 'fourth':
            this.fourthTime = value
            this.getFourth()
            break
          case 'fifth':
            this.fifthTime = value
            this.getFifth()
            break
          case 'sixth':
            this.sixthTime = value
            this.getSixth()
            break
          case 'seventh':
            this.seventhTime = value
            this.getSeventh()
            break
          case 'eighth':
            this.eighthTime = value
            this.getEighth()
            break
          case 'ninth':
            this.ninthTime = value
            this.getNinth()
            break
          case 'tenth':
            this.tenthTime = value
            this.getTenth()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'first':
          this.userDefindTime = this.firstTime
          break
        case 'second':
          this.userDefindTime = this.secondTime
          break
        case 'third':
          this.userDefindTime = this.thirdTime
          break
        case 'fourth':
          this.userDefindTime = this.fourthTime
          break
        case 'fifth':
          this.userDefindTime = this.fifthTime
          break
        case 'sixth':
          this.userDefindTime = this.sixthTime
          break
        case 'seventh':
          this.userDefindTime = this.seventhTime
          break
        case 'eighth':
          this.userDefindTime = this.eighthTime
          break
        case 'ninth':
          this.userDefindTime = this.ninthTime
          break
        case 'tenth':
          this.userDefindTime = this.tenthTime
          break
      }
      this.userDefindVisible = true
    },
    clear() {
      clearInterval(this.firstInterval)
      clearInterval(this.secondInterval)
      clearInterval(this.thirdInterval)
      clearInterval(this.fourthInterval)
      clearInterval(this.fifthInterval)
      clearInterval(this.sixthInterval)
      clearInterval(this.seventhInterval)
      clearInterval(this.eighthInterval)
      clearInterval(this.ninthInterval)
      clearInterval(this.tenthInterval)
    }
  },
  created() {
    this.getDetail()
    this.handleClick()
  }
}
</script>
<style scopes></style>
