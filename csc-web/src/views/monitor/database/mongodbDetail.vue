<template>
  <el-card>
    <common-detail :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detailData.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="detailData.status | vmStatusColor">{{ detailData.status | database }} </status-icon>
        </common-detail-item>
        <common-detail-item label="部署方式">{{ detailData.category }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="服务地址" v-if="detailData.category == '单机'">{{ detailData.address }}</common-detail-item>
      </template>
      <el-form :inline="true">
        <el-form-item label="节点：">
          <el-select v-model="node" placeholder="请选择" @change="changeNode">
            <el-option v-for="item in nodesData" :key="item.id" :label="item.address + ':' + item.port + '(' + item.role + ')'" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-row :gutter="20">
        <el-col :span="12" v-for="chart in typeData" :key="chart.value">
          <el-card class="box-card m-t">
            <div slot="header" class="clearfix">
              <span>
                {{ chart.name }}
              </span>
              <span class="pull-right">
                <el-button-group>
                  <el-button size="mini" :type="item.value == mongodb[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                  <el-button size="mini" :type="mongodb[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <line-charts ref="mongodb" height="220px" width="100%" :id="chart.value + 'mongodb'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </common-detail>
    <user-defind v-if="userDefindVisible" :user-defind-visible="userDefindVisible" :user-defind-time="userDefindTime" @getData="getOverviewChart"></user-defind>
  </el-card>
</template>
<script>
import userDefind from '../virtual/userDefind.vue'
import { getCharts } from 'services/monitor'
import { vmStatusColor, database } from 'filters'
import { getKvsDetail } from 'services/monitor/database'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: 'Opcounters', value: 'first' },
  { name: 'QPS', value: 'second' },
  { name: 'Connections', value: 'third' },
  { name: 'Global Lock', value: 'fourth' },
  { name: 'Document', value: 'fifth' },
  { name: 'Cursors', value: 'sixth' },
  { name: 'Memory', value: 'seventh' },
  { name: 'Network', value: 'eighth' }
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
      categoryFilter: {
        standalone: '单机',
        cluster: '集群'
      },
      intervalData,
      typeData,
      resourceId: Number(this.$route.query.id),
      detailData: {},
      node: '',
      nodesData: [],
      server: '',
      port: '',
      // 图表
      dashboradData: {
        first: null,
        second: null,
        third: null,
        fourth: null,
        fifth: null,
        sixth: null,
        seventh: null,
        eighth: null
      },
      mongodb: {
        first: {},
        second: {},
        third: {},
        fourth: {},
        fifth: {},
        sixth: {},
        seventh: {},
        eighth: {}
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
      firstInterval: '',
      secondInterval: '',
      thirdInterval: '',
      fourthInterval: '',
      fifthInterval: '',
      sixthInterval: '',
      seventhInterval: '',
      eighthInterval: ''
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
    },
    goBack() {
      this.$router.go(-1)
    },
    getDetail() {
      getKvsDetail(this.resourceId).then(data => {
        if (data.success) {
          this.detailData = data.data
          this.detailData.category = this.categoryFilter[this.detailData.category]
          this.detailData.expiredTime = this.detailData.expiredTime ? (this.detailData.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detailData.expiredTime) : this.detailData.expiredTime
          this.nodesData = []
          data.data.nodes.forEach(item => {
            if (item.role != 'arbiter') {
              this.nodesData.push(item)
              if (this.nodesData.length == 1) {
                this.node = this.nodesData[0].id
                this.server = this.nodesData[0].address
                this.port = this.nodesData[0].port
                this.handleClick()
              }
            }
          })
        }
      })
    },
    changeNode(id) {
      for (let index = 0; index < this.nodesData.length; index++) {
        const element = this.nodesData[index]
        if (id == element.id) {
          this.server = element.address
          this.port = element.port
          this.computeInterval('first', this.mongodb.first.step, this.getFirst)
          this.computeInterval('second', this.mongodb.second.step, this.getSecond)
          this.computeInterval('third', this.mongodb.third.step, this.getThird)
          this.computeInterval('fourth', this.mongodb.fourth.step, this.getFourth)
          this.computeInterval('fifth', this.mongodb.fifth.step, this.getFifth)
          this.computeInterval('sixth', this.mongodb.sixth.step, this.getSixth)
          this.computeInterval('seventh', this.mongodb.seventh.step, this.getSeventh)
          this.computeInterval('eighth', this.mongodb.eighth.step, this.getEighth)
          return
        }
      }
    },
    computeInterval(type, value, callback) {
      this.mongodb[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.mongodb[type].start = this.mongodb[type].end - 3600
          break
        case '6H':
          this.mongodb[type].start = this.mongodb[type].end - 6 * 3600
          break
        case '1D':
          this.mongodb[type].start = this.mongodb[type].end - 24 * 3600
          break
        case '7D':
          this.mongodb[type].start = this.mongodb[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.mongodb[type].start = this.mongodb[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.mongodb[type].end - this.mongodb[type].start
        this.mongodb[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.mongodb[type].step = value
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
      }
    },
    getFirst() {
      const str1 = 'sum(mongodb_inserts{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str2 = 'sum(mongodb_updates{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str3 = 'sum(mongodb_deletes{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str4 = 'sum(mongodb_queries{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str5 = 'sum(mongodb_getmores{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str6 = 'sum(mongodb_commands{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const expr = JSON.stringify([str1, str2, str3, str4, str5, str6])
      getCharts({
        step: this.mongodb.first.stepValue,
        start: this.mongodb.first.start,
        end: this.mongodb.first.end,
        expr: expr,
        name: '["insert","update","delete","query","getmore","command"]',
        unit: '次'
      }).then(data => {
        if (data.success) {
          this.dashboradData.first = Object.assign({}, data.data)
          if (this.firstInterval) {
            clearInterval(this.firstInterval)
            this.firstInterval = ''
          }
          if (this.mongodb.first.step != 0) {
            this.firstInterval = setInterval(() => {
              this.computeInterval('first', this.mongodb.first.step, this.getFirst)
            }, 60 * 1000)
          }
        }
      })
    },
    getSecond() {
      const str1 = 'round(sum(irate(mongodb_inserts{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
      const str2 = 'round(sum(irate(mongodb_updates{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
      const str3 = 'round(sum(irate(mongodb_deletes{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
      const str4 = 'round(sum(irate(mongodb_queries{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
      const str5 = 'round(sum(irate(mongodb_getmores{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
      const str6 = 'round(sum(irate(mongodb_commands{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
      const expr = JSON.stringify([str1, str2, str3, str4, str5, str6])
      getCharts({
        step: this.mongodb.second.stepValue,
        start: this.mongodb.second.start,
        end: this.mongodb.second.end,
        expr: expr,
        name: '["insert","update","delete","query", "getmore", "command"]',
        unit: '次/秒'
      }).then(data => {
        if (data.success) {
          this.dashboradData.second = Object.assign({}, data.data)
          if (this.secondInterval) {
            clearInterval(this.secondInterval)
            this.secondInterval = ''
          }
          if (this.mongodb.second.step != 0) {
            this.secondInterval = setInterval(() => {
              this.computeInterval('second', this.mongodb.second.step, this.getSecond)
            }, 60 * 1000)
          }
        }
      })
    },
    getThird() {
      const str1 = 'sum(mongodb_connections_current{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str2 = 'sum(mongodb_connections_available{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str3 = 'sum(mongodb_connections_total_created{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.mongodb.third.stepValue,
        start: this.mongodb.third.start,
        end: this.mongodb.third.end,
        expr: expr,
        name: '["当前连接数", "可用连接数", "总共创建连接数"]',
        unit: '个'
      }).then(data => {
        if (data.success) {
          this.dashboradData.third = Object.assign({}, data.data)
          if (this.thirdInterval) {
            clearInterval(this.thirdInterval)
            this.thirdInterval = ''
          }
          if (this.mongodb.third.step != 0) {
            this.thirdInterval = setInterval(() => {
              this.computeInterval('third', this.mongodb.third.step, this.getThird)
            }, 60 * 1000)
          }
        }
      })
    },
    getFourth() {
      const str1 = 'sum(mongodb_queued_reads{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str2 = 'sum(mongodb_queued_writes{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mongodb.fourth.stepValue,
        start: this.mongodb.fourth.start,
        end: this.mongodb.fourth.end,
        expr: expr,
        name: '["队列中等待读锁数","队列中等待写锁数"]',
        unit: '个'
      }).then(data => {
        if (data.success) {
          this.dashboradData.fourth = Object.assign({}, data.data)
          if (this.fourthInterval) {
            clearInterval(this.fourthInterval)
            this.fourthInterval = ''
          }
          if (this.mongodb.fourth.step != 0) {
            this.fourthInterval = setInterval(() => {
              this.computeInterval('fourth', this.mongodb.fourth.step, this.getFourth)
            }, 60 * 1000)
          }
        }
      })
    },
    getFifth() {
      const str1 = 'sum(mongodb_document_deleted{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str2 = 'sum(mongodb_document_inserted{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str3 = 'sum(mongodb_document_returned{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str4 = 'sum(mongodb_document_updated{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const expr = JSON.stringify([str1, str2, str3, str4])
      getCharts({
        step: this.mongodb.fifth.stepValue,
        start: this.mongodb.fifth.start,
        end: this.mongodb.fifth.end,
        expr: expr,
        name: '["delete", "insert", "return", "update"]',
        unit: '个'
      }).then(data => {
        if (data.success) {
          this.dashboradData.fifth = Object.assign({}, data.data)
          if (this.fifthInterval) {
            clearInterval(this.fifthInterval)
            this.fifthInterval = ''
          }
          if (this.mongodb.fifth.step != 0) {
            this.fifthInterval = setInterval(() => {
              this.computeInterval('fifth', this.mongodb.fifth.step, this.getFifth)
            }, 60 * 1000)
          }
        }
      })
    },
    getSixth() {
      const str1 = 'sum(mongodb_cursor_total_count{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str2 = 'sum(mongodb_cursor_pinned_count{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str3 = 'sum(mongodb_cursor_timed_out_count{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str4 = 'sum(mongodb_cursor_no_timeout_count{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const expr = JSON.stringify([str1, str2, str3, str4])
      getCharts({
        step: this.mongodb.sixth.stepValue,
        start: this.mongodb.sixth.start,
        end: this.mongodb.sixth.end,
        expr: expr,
        name: '["游标总数量", "固定游标数量", "过期游标数量", "未过期游标数量"]',
        unit: '个'
      }).then(data => {
        if (data.success) {
          this.dashboradData.sixth = Object.assign({}, data.data)
          if (this.sixthInterval) {
            clearInterval(this.sixthInterval)
            this.sixthInterval = ''
          }
          if (this.mongodb.sixth.step != 0) {
            this.sixthInterval = setInterval(() => {
              this.computeInterval('sixth', this.mongodb.sixth.step, this.getSixth)
            }, 60 * 1000)
          }
        }
      })
    },
    getSeventh() {
      const str1 = 'sum(mongodb_resident_megabytes{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const str2 = 'sum(mongodb_vsize_megabytes{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mongodb.seventh.stepValue,
        start: this.mongodb.seventh.start,
        end: this.mongodb.seventh.end,
        expr: expr,
        name: '["常驻内存", "虚拟内存"]',
        unit: 'MB'
      }).then(data => {
        if (data.success) {
          this.dashboradData.seventh = Object.assign({}, data.data)
          if (this.seventhInterval) {
            clearInterval(this.seventhInterval)
            this.seventhInterval = ''
          }
          if (this.mongodb.seventh.step != 0) {
            this.seventhInterval = setInterval(() => {
              this.computeInterval('seventh', this.mongodb.seventh.step, this.getSeventh)
            }, 60 * 1000)
          }
        }
      })
    },
    getEighth() {
      const str1 = 'round(sum(irate((mongodb_net_in_bytes_count{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}/1024)[5m:]))by(hostname),0.01)'
      const str2 = 'round(sum(irate((mongodb_net_out_bytes_count{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}/1024)[5m:]))by(hostname),0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mongodb.eighth.stepValue,
        start: this.mongodb.eighth.start,
        end: this.mongodb.eighth.end,
        expr: expr,
        name: '["实例接收的网络速度","实例发送的网络速度"]',
        unit: 'KB/s'
      }).then(data => {
        if (data.success) {
          this.dashboradData.eighth = Object.assign({}, data.data)
          if (this.eighthInterval) {
            clearInterval(this.eighthInterval)
            this.eighthInterval = ''
          }
          if (this.mongodb.eighth.step != 0) {
            this.eighthInterval = setInterval(() => {
              this.computeInterval('eighth', this.mongodb.eighth.step, this.getEighth)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.mongodb[this.chartType].step = 0
        this.mongodb[this.chartType].start = Math.round(value[0] / 1000)
        this.mongodb[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.mongodb[this.chartType].end - this.mongodb[this.chartType].start
        this.mongodb[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
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
    }
  },
  created() {
    this.getDetail()
  }
}
</script>
<style scopes></style>
