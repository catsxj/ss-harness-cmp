<template>
  <el-card>
    <common-detail :setting="{ type: 'Redis' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detailData.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="vmStatusColorFilter(detailData.status)">{{ databaseFilter(detailData.status) }} </status-icon>
        </common-detail-item>
        <common-detail-item label="部署方式">{{ detailData.category }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
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
                  <el-button size="mini" :type="item.value == redis[chart.value].step ? 'primary' : ''" v-for="item in intervalData" :key="item.value" @click="changeInterval(item.value, chart.value)">{{ item.name }}</el-button>
                  <el-button size="mini" :type="redis[chart.value].step === 0 ? 'primary' : ''" @click="userDefind(chart.value)">自定义</el-button>
                </el-button-group>
              </span>
            </div>
            <div>
              <line-charts ref="redis" height="220px" width="100%" :id="chart.value + 'redis'" :data="dashboradData[chart.value]" :unit="dashboradData[chart.value].unit" v-if="dashboradData[chart.value]"></line-charts>
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
import { getKvsDetail } from 'services/monitor/database'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
const typeData = [
  { name: '客户端数量', value: 'clients' },
  { name: '内存', value: 'memory' },
  { name: '命中率', value: 'hits' },
  { name: '网络流量', value: 'bytes' }
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
        clients: null,
        memory: null,
        hits: null,
        bytes: null
      },
      redis: {
        clients: {},
        memory: {},
        hits: {},
        bytes: {}
      },
      chartType: '',
      userDefindVisible: false,
      userDefindTime: [],
      clientsTime: [],
      memoryTime: [],
      hitsTime: [],
      bytesTime: [],
      clientsInterval: '',
      memoryInterval: '',
      hitsInterval: '',
      bytesInterval: ''
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    getDetail() {
      getKvsDetail(this.resourceId).then((data) => {
        if (data.success) {
          this.detailData = data.data
          this.detailData.category = this.categoryFilter[this.detailData.category]
          this.detailData.expiredTime = this.detailData.expiredTime ? (this.detailData.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detailData.expiredTime) : this.detailData.expiredTime
          this.nodesData = []
          data.data.nodes.forEach((item) => {
            if (item.role != 'sentinel') {
              this.nodesData.push(item)
              if (this.nodesData.length == 1) {
                this.node = this.nodesData[0].id
                this.server = this.nodesData[0].address
                this.port = this.nodesData[0].port
                this.changeInterval('1H', 'clients')
                this.changeInterval('1H', 'memory')
                this.changeInterval('1H', 'hits')
                this.changeInterval('1H', 'bytes')
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
          this.computeInterval('clients', this.redis.clients.step, this.getClients)
          this.computeInterval('memory', this.redis.memory.step, this.getMemory)
          this.computeInterval('hits', this.redis.hits.step, this.getHits)
          this.computeInterval('bytes', this.redis.bytes.step, this.getBytes)
          return
        }
      }
    },
    computeInterval(type, value, callback) {
      this.redis[type].end = Math.round(new Date().getTime() / 1000)
      switch (value) {
        case '1H':
          this.redis[type].start = this.redis[type].end - 3600
          break
        case '6H':
          this.redis[type].start = this.redis[type].end - 6 * 3600
          break
        case '1D':
          this.redis[type].start = this.redis[type].end - 24 * 3600
          break
        case '7D':
          this.redis[type].start = this.redis[type].end - 7 * 24 * 3600
          break
        case '14D':
          this.redis[type].start = this.redis[type].end - 14 * 24 * 3600
          break
        default:
          break
      }
      if (value) {
        const duration = this.redis[type].end - this.redis[type].start
        this.redis[type].stepValue = duration / 180 - ((duration / 180) % 20)
        callback()
      }
    },
    // 改变申请概览周期
    changeInterval(value, type) {
      this.chartType = type
      this.redis[type].step = value
      switch (type) {
        case 'clients':
          this.computeInterval(type, value, this.getClients)
          break
        case 'memory':
          this.computeInterval(type, value, this.getMemory)
          break
        case 'hits':
          this.computeInterval(type, value, this.getHits)
          break
        case 'bytes':
          this.computeInterval(type, value, this.getBytes)
          break
      }
    },
    getClients() {
      const str1 = 'sum by (kvs_id,server,port) (redis_clients{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"})'
      const str2 = 'sum by (kvs_id,server,port) (redis_blocked_clients{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"})'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.redis.clients.stepValue,
        start: this.redis.clients.start,
        end: this.redis.clients.end,
        expr: expr,
        name: '["活跃的客户端数量","阻塞的客户端数量"]',
        unit: '个'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.clients = Object.assign({}, data.data)
          if (this.clientsInterval) {
            clearInterval(this.clientsInterval)
            this.clientsInterval = ''
          }
          if (this.redis.clients.step != 0) {
            this.clientsInterval = setInterval(() => {
              this.computeInterval('clients', this.redis.clients.step, this.getClients)
            }, 60 * 1000)
          }
        }
      })
    },
    getMemory() {
      const str1 = 'round(sum by (kvs_id,server,port) (redis_used_memory{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"}/1024),0.01)'
      const str2 = 'round(sum by (kvs_id,server,port) (redis_used_memory_lua{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"}/1024),0.01)'
      const str3 = 'round(sum by (kvs_id,server,port) (redis_used_memory_peak{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"}/1024),0.01)'
      const str4 = 'round(sum by (kvs_id,server,port) (redis_used_memory_rss{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"}/1024),0.01)'
      const expr = JSON.stringify([str1, str2, str3, str4])
      getCharts({
        step: this.redis.memory.stepValue,
        start: this.redis.memory.start,
        end: this.redis.memory.end,
        expr: expr,
        name: '["内存总量","Lua脚本内存","内存消耗峰值","rss内存"]',
        unit: 'kb'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.memory = Object.assign({}, data.data)
          if (this.memoryInterval) {
            clearInterval(this.memoryInterval)
            this.memoryInterval = ''
          }
          if (this.redis.memory.step != 0) {
            this.memoryInterval = setInterval(() => {
              this.computeInterval('memory', this.redis.memory.step, this.getMemory)
            }, 60 * 1000)
          }
        }
      })
    },
    getHits() {
      const str1 = 'round(sum by (kvs_id,server,port) (redis_keyspace_hitrate{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"}*100),0.01)'
      const expr = JSON.stringify([str1])
      getCharts({
        step: this.redis.hits.stepValue,
        start: this.redis.hits.start,
        end: this.redis.hits.end,
        expr: expr,
        name: '["命中率"]',
        unit: '%'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.hits = Object.assign({}, data.data)
          if (this.hitsInterval) {
            clearInterval(this.hitsInterval)
            this.hitsInterval = ''
          }
          if (this.redis.hits.step != 0) {
            this.hitsInterval = setInterval(() => {
              this.computeInterval('hits', this.redis.hits.step, this.getHits)
            }, 60 * 1000)
          }
        }
      })
    },
    getBytes() {
      const str1 = 'round(sum by (kvs_id,server,port) (redis_total_net_input_bytes{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"}/1024/1024),0.01)'
      const str2 = 'round(sum by (kvs_id,server,port) (redis_total_net_output_bytes{kvs_id="' + this.resourceId + '",server="' + this.server + '",port="' + this.port + '"}/1024/1024),0.01)'
      const expr = JSON.stringify([str1, str2])
      getCharts({
        step: this.redis.bytes.stepValue,
        start: this.redis.bytes.start,
        end: this.redis.bytes.end,
        expr: expr,
        name: '["网络入口流量","网络出口流量"]',
        unit: 'MB'
      }).then((data) => {
        if (data.success) {
          this.dashboradData.bytes = Object.assign({}, data.data)
          if (this.bytesInterval) {
            clearInterval(this.bytesInterval)
            this.bytesInterval = ''
          }
          if (this.redis.bytes.step != 0) {
            this.bytesInterval = setInterval(() => {
              this.computeInterval('bytes', this.redis.bytes.step, this.getBytes)
            }, 60 * 1000)
          }
        }
      })
    },
    getOverviewChart(value) {
      this.userDefindVisible = false
      if (value) {
        this.redis[this.chartType].step = 0
        this.redis[this.chartType].start = Math.round(value[0] / 1000)
        this.redis[this.chartType].end = Math.round(value[1] / 1000)
        const duration = this.redis[this.chartType].end - this.redis[this.chartType].start
        this.redis[this.chartType].stepValue = duration / 180 - ((duration / 180) % 20)
        switch (this.chartType) {
          case 'clients':
            this.clientsTime = value
            this.getClients()
            break
          case 'memory':
            this.memoryTime = value
            this.getMemory()
            break
          case 'hits':
            this.hitsTime = value
            this.getHits()
            break
          case 'bytes':
            this.bytesTime = value
            this.getBytes()
            break
        }
      }
    },
    userDefind(type) {
      this.chartType = type
      switch (type) {
        case 'clients':
          this.userDefindTime = this.clientsTime
          break
        case 'memory':
          this.userDefindTime = this.memoryTime
          break
        case 'hits':
          this.userDefindTime = this.hitsTime
          break
        case 'bytes':
          this.userDefindTime = this.bytesTime
          break
      }
      this.userDefindVisible = true
    },
    clear() {
      clearInterval(this.clientsInterval)
      clearInterval(this.memoryInterval)
      clearInterval(this.hitsInterval)
      clearInterval(this.bytesInterval)
    }
  },
  created() {
    this.getDetail()
  }
}
</script>
<style scopes></style>
