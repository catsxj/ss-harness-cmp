<template>
  <el-card>
    <common-detail :setting="{ type: 'MySQL' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detailData.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="vmStatusColorFilter(detailData.status)">{{ databaseFilter(detailData.status) }} </status-icon>
        </common-detail-item>
        <common-detail-item label="部署方式">{{ detailData.categoryName }}</common-detail-item>
        <common-detail-item label="配置">{{ detailData.spec ? detailData.spec : '--' }}</common-detail-item>
        <common-detail-item label="数据盘">{{ detailData.dataDisk ? detailData.dataDisk + 'GB' : '--' }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="过期时间">{{ detailData.expiredTime ? detailData.expiredTime : '无限期' }}</common-detail-item>
        <common-detail-item label="服务地址">{{ detailData.address }}</common-detail-item>
      </template>
      <basic-form label-width="60px">
        <el-row>
          <el-col :span="8">
            <basic-form-item label="节点：">
              <el-select v-model="node" placeholder="请选择" @change="changeNode">
                <el-option v-for="item in nodesData" :key="item.id" :label="item.address + ':' + item.port + '(' + item.role + ')'" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <el-row :gutter="5">
        <el-col :span="12" v-for="chart in typeData" :key="chart.value">
          <el-card class="box-card m-t-xs">
            <div slot="header" class="clearfix">
              <span>
                {{ chart.name }}
              </span>
              <span class="pull-right">
                <el-button-group>
                  <el-button size="mini" :type="item.value == mysql[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                  <el-button size="mini" :type="mysql[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <line-charts ref="mysql" height="220px" width="100%" :id="chart.value + 'mysql'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
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
  { name: 'TPS', value: 'tps' },
  { name: 'QPS', value: 'qps' },
  { name: '语句计数', value: 'opcounters' },
  { name: '连接数', value: 'connections' },
  { name: '网络', value: 'bytes' },
  { name: '网络速率', value: 'rate' },
  { name: '操作概览', value: 'operate' },
  { name: 'InnoDB缓冲池命中率', value: 'innodb' }
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
      node: '',
      nodesData: [],
      server: '',
      port: '',
      // 图表
      dashboradData: {
        opcounters: null,
        qps: null,
        tps: null,
        connections: null,
        operate: null,
        bytes: null,
        rate: null,
        innodb: null
      },
      mysql: {
        opcounters: {},
        qps: {},
        tps: {},
        connections: {},
        operate: {},
        bytes: {},
        rate: {},
        innodb: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      opcountersTime: [],
      qpsTime: [],
      tpsTime: [],
      connectionsTime: [],
      operateTime: [],
      bytesTime: [],
      rateTime: [],
      innodbTime: [],
      opcountersInterval: '',
      qpsInterval: '',
      tpsInterval: '',
      connectionsInterval: '',
      operateInterval: '',
      bytesInterval: '',
      rateInterval: '',
      innodbInterval: ''
    }
  },
  methods: {
    handleClick() {
      this.changeInterval('1H', 'opcounters')
      this.changeInterval('1H', 'qps')
      this.changeInterval('1H', 'tps')
      this.changeInterval('1H', 'connections')
      this.changeInterval('1H', 'operate')
      this.changeInterval('1H', 'bytes')
      this.changeInterval('1H', 'rate')
      this.changeInterval('1H', 'innodb')
    },
    goBack() {
      history.go(-1)
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
          this.nodesData = data.data.nodes
          if (this.nodesData.length) {
            this.node = this.nodesData[0].id
            this.server = this.nodesData[0].address
            this.port = this.nodesData[0].port
            this.handleClick()
          }
        }
      })
    },
    changeNode(id) {
      for (let index = 0; index < this.nodesData.length; index++) {
        const element = this.nodesData[index]
        if (id == element.id) {
          this.server = element.address
          this.port = element.port
          this.computeInterval('opcounters', this.mysql.opcounters.step, this.getOpcounters)
          this.computeInterval('qps', this.mysql.qps.step, this.getQPS)
          this.computeInterval('tps', this.mysql.tps.step, this.getTPS)
          this.computeInterval('connections', this.mysql.connections.step, this.getConnections)
          this.computeInterval('operate', this.mysql.operate.step, this.getOperate)
          this.computeInterval('bytes', this.mysql.bytes.step, this.getBytes)
          this.computeInterval('rate', this.mysql.rate.step, this.getRate)
          this.computeInterval('innodb', this.mysql.innodb.step, this.getInnodb)
          return
        }
      }
    },
    computeInterval(type, value, callback) {
      this.mysql[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.mysql[type].start = this.mysql[type].end - 3600
          break
        case '6H':
          this.mysql[type].start = this.mysql[type].end - 6 * 3600
          break
        case '1D':
          this.mysql[type].start = this.mysql[type].end - 24 * 3600
          break
        case '7D':
          this.mysql[type].start = this.mysql[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.mysql[type].start = this.mysql[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.mysql[type].end - this.mysql[type].start
        this.mysql[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.mysql[type].step = value
      switch (type) {
        case 'opcounters':
          this.computeInterval(type, value, this.getOpcounters)
          break
        case 'qps':
          this.computeInterval(type, value, this.getQPS)
          break
        case 'tps':
          this.computeInterval(type, value, this.getTPS)
          break
        case 'connections':
          this.computeInterval(type, value, this.getConnections)
          break
        case 'operate':
          this.computeInterval(type, value, this.getOperate)
          break
        case 'bytes':
          this.computeInterval(type, value, this.getBytes)
          break
        case 'rate':
          this.computeInterval(type, value, this.getRate)
          break
        case 'innodb':
          this.computeInterval(type, value, this.getInnodb)
          break
      }
    },
    getOpcounters() {
      const str2 = 'sum(mysql_com_select{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const str3 = 'sum(mysql_com_insert{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const str4 = 'sum(mysql_com_update{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const str5 = 'sum(mysql_com_delete{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const str6 = 'sum(mysql_com_commit{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const str7 = 'sum(mysql_com_rollback{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const expr = JSON.stringify([str2, str3, str4, str5, str6, str7])
      getCharts({
        step: this.mysql.opcounters.stepValue,
        start: this.mysql.opcounters.start,
        end: this.mysql.opcounters.end,
        expr: expr,
        name: '["select","insert","update","delete","commit","rollback"]',
        unit: '次'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.opcounters = Object.assign({}, data.data)
          if (this.opcountersInterval) {
            clearInterval(this.opcountersInterval)
            this.opcountersInterval = ''
          }
          if (this.mysql.opcounters.step != 0) {
            this.opcountersInterval = setInterval(() => {
              this.computeInterval('opcounters', this.mysql.opcounters.step, this.getOpcounters)
            }, 60 * 1000)
          }
        }
      })
    },
    getQPS() {
      const str1 = 'round(sum(irate(mysql_questions{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}[5m]))by(server),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mysql.qps.stepValue,
        start: this.mysql.qps.start,
        end: this.mysql.qps.end,
        expr: expr,
        name: '["每秒查询数"]',
        unit: '次/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.qps = Object.assign({}, data.data)
          if (this.qpsInterval) {
            clearInterval(this.qpsInterval)
            this.qpsInterval = ''
          }
          if (this.mysql.qps.step != 0) {
            this.qpsInterval = setInterval(() => {
              this.computeInterval('qps', this.mysql.qps.step, this.getQPS)
            }, 60 * 1000)
          }
        }
      })
    },
    getTPS() {
      const expr = JSON.stringify(['round(sum(rate(mysql_com_commit{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}[5m]) + rate(mysql_com_rollback[5m]))by(server),0.001)'])
      getCharts({
        step: this.mysql.tps.stepValue,
        start: this.mysql.tps.start,
        end: this.mysql.tps.end,
        expr: expr,
        name: '["每秒事务数"]',
        unit: '次/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.tps = Object.assign({}, data.data)
          if (this.tpsInterval) {
            clearInterval(this.tpsInterval)
            this.tpsInterval = ''
          }
          if (this.mysql.tps.step != 0) {
            this.tpsInterval = setInterval(() => {
              this.computeInterval('tps', this.mysql.tps.step, this.getTPS)
            }, 60 * 1000)
          }
        }
      })
    },
    getConnections() {
      const str1 = 'sum(sum(mysql_users_connections{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}))by(server)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mysql.connections.stepValue,
        start: this.mysql.connections.start,
        end: this.mysql.connections.end,
        expr: expr,
        name: '["当前连接数"]',
        unit: '个'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.connections = Object.assign({}, data.data)
          if (this.connectionsInterval) {
            clearInterval(this.connectionsInterval)
            this.connectionsInterval = ''
          }
          if (this.mysql.connections.step != 0) {
            this.connectionsInterval = setInterval(() => {
              this.computeInterval('connections', this.mysql.connections.step, this.getConnections)
            }, 60 * 1000)
          }
        }
      })
    },
    getOperate() {
      const str1 = 'sum(mysql_open_streams{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const str2 = 'sum(mysql_open_tables{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const str3 = 'sum(mysql_open_files{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"})by(server)'
      const expr = JSON.stringify([str1, str2, str3])
      getCharts({
        step: this.mysql.operate.stepValue,
        start: this.mysql.operate.start,
        end: this.mysql.operate.end,
        expr: expr,
        name: '["打开的流的数量","打开的表的数量","打开的文件数量"]',
        unit: '个'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.operate = Object.assign({}, data.data)
          if (this.operateInterval) {
            clearInterval(this.operateInterval)
            this.operateInterval = ''
          }
          if (this.mysql.operate.step != 0) {
            this.operateInterval = setInterval(() => {
              this.computeInterval('operate', this.mysql.operate.step, this.getOperate)
            }, 60 * 1000)
          }
        }
      })
    },
    getBytes() {
      const str1 = 'round(sum(mysql_bytes_received{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}/1024/1024)by(server),1)'
      const str2 = 'round(sum(mysql_bytes_sent{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}/1024/1024)by(server),1)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mysql.bytes.stepValue,
        start: this.mysql.bytes.start,
        end: this.mysql.bytes.end,
        expr: expr,
        name: '["客户端接收流量","客户端发送流量"]',
        unit: 'MB'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.bytes = Object.assign({}, data.data)
          if (this.bytesInterval) {
            clearInterval(this.bytesInterval)
            this.bytesInterval = ''
          }
          if (this.mysql.bytes.step != 0) {
            this.bytesInterval = setInterval(() => {
              this.computeInterval('bytes', this.mysql.bytes.step, this.getBytes)
            }, 60 * 1000)
          }
        }
      })
    },
    getRate() {
      const str1 = 'round(sum(irate(mysql_bytes_received{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}[5m])/1024)by(server),0.01)'
      const str2 = 'round(sum(irate(mysql_bytes_sent{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}[5m])/1024)by(server),0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.mysql.rate.stepValue,
        start: this.mysql.rate.start,
        end: this.mysql.rate.end,
        expr: expr,
        name: '["每秒接收流量","每秒发送流量"]',
        unit: 'KB/s'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.rate = Object.assign({}, data.data)
          if (this.rateInterval) {
            clearInterval(this.rateInterval)
            this.rateInterval = ''
          }
          if (this.mysql.rate.step != 0) {
            this.rateInterval = setInterval(() => {
              this.computeInterval('rate', this.mysql.rate.step, this.getRate)
            }, 60 * 1000)
          }
        }
      })
    },
    getInnodb() {
      const str1 = 'round(sum((mysql_innodb_buffer_pool_read_requests{rds_id="' + this.resourceId + '",server="' + this.server + ':' + this.port + '"}/(mysql_innodb_buffer_pool_read_requests + mysql_innodb_buffer_pool_read_ahead + mysql_innodb_buffer_pool_reads)*100))by(server),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.mysql.innodb.stepValue,
        start: this.mysql.innodb.start,
        end: this.mysql.innodb.end,
        expr: expr,
        name: '["InnoDB缓冲池命中率"]',
        unit: '%'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.innodb = Object.assign({}, data.data)
          if (this.innodbInterval) {
            clearInterval(this.innodbInterval)
            this.innodbInterval = ''
          }
          if (this.mysql.innodb.step != 0) {
            this.innodbInterval = setInterval(() => {
              this.computeInterval('innodb', this.mysql.innodb.step, this.getInnodb)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.mysql[this.chartType].step = 0
        this.mysql[this.chartType].start = Math.round(value[0] / 1000)
        this.mysql[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.mysql[this.chartType].end - this.mysql[this.chartType].start
        this.mysql[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'opcounters':
            this.opcountersTime = value
            this.getOpcounters()
            break
          case 'qps':
            this.qpsTime = value
            this.getQPS()
            break
          case 'tps':
            this.tpsTime = value
            this.getTPS()
            break
          case 'connections':
            this.connectionsTime = value
            this.getConnections()
            break
          case 'operate':
            this.operateTime = value
            this.getOperate()
            break
          case 'bytes':
            this.bytesTime = value
            this.getBytes()
            break
          case 'rate':
            this.rateTime = value
            this.getRate()
            break
          case 'innodb':
            this.innodbTime = value
            this.getInnodb()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'opcounters':
          this.userDefindTime = this.opcountersTime
          break
        case 'qps':
          this.userDefindTime = this.qpsTime
          break
        case 'tps':
          this.userDefindTime = this.tpsTime
          break
        case 'connections':
          this.userDefindTime = this.connectionsTime
          break
        case 'operate':
          this.userDefindTime = this.operateTime
          break
        case 'bytes':
          this.userDefindTime = this.bytesTime
          break
        case 'rate':
          this.userDefindTime = this.rateTime
          break
        case 'innodb':
          this.userDefindTime = this.innodbTime
          break
      }
      this.userDefindVisible = true
    },
    clear() {
      clearInterval(this.opcountersInterval)
      clearInterval(this.qpsInterval)
      clearInterval(this.tpsInterval)
      clearInterval(this.connectionsInterval)
      clearInterval(this.operateInterval)
      clearInterval(this.bytesInterval)
      clearInterval(this.rateInterval)
      clearInterval(this.innodbInterval)
    }
  },
  created() {
    this.getDetail()
  }
}
</script>
<style scopes></style>
