<template>
  <el-card>
    <common-detail :setting="{ type: 'Memcache' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detailData.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="detailData.status | vmStatusColor">{{ detailData.status | database }} </status-icon>
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
      <el-row :gutter="20">
        <el-col :span="12" v-for="chart in typeData" :key="chart.value">
          <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
        </el-col>
      </el-row>
    </common-detail>
  </el-card>
</template>
<script>
import { getCharts } from 'services/monitor'
import { getKvsDetail } from 'services/monitor/database'
import chartBox from 'views/monitor/components/chartBox.vue'
const intervalData = [
  { name: '1H', value: '1H' },
  { name: '6H', value: '6H' },
  { name: '1D', value: '1D' },
  { name: '7D', value: '7D' },
  { name: '14D', value: '14D' }
]
export default {
  components: {
    chartBox
  },
  beforeDestroy() {},
  data() {
    return {
      categoryFilter: {
        standalone: '单机',
        cluster: '集群'
      },
      intervalData,
      typeData: [],
      resourceId: Number(this.$route.query.id),
      detailData: {},
      node: '',
      nodesData: [],
      server: '',
      port: '',
      // 图表
      dashboradData: {
        hits: {},
        misses: {},
        cmd: {},
        storage: {},
        link: {},
        threads: {},
        bytes: {},
        mem: {}
      }
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    getDetail() {
      getKvsDetail(this.resourceId).then(data => {
        if (data.success) {
          this.detailData = data.data
          this.detailData.category = this.categoryFilter[this.detailData.category]
          this.detailData.expiredTime = this.detailData.expiredTime ? (this.detailData.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detailData.expiredTime) : this.detailData.expiredTime
          this.nodesData = data.data.nodes
          if (this.nodesData.length) {
            this.node = this.nodesData[0].id
            this.server = this.nodesData[0].address
            this.port = this.nodesData[0].port
            this.getData()
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
          this.getData()
          return
        }
      }
    },
    getData() {
      this.typeData = [
        {
          title: '命中命令数',
          value: 'hits',
          expr: JSON.stringify([
            'sum(memcached_get_hits{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_incr_hits{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_decr_hits{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_delete_hits{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_cas_hits{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_touch_hits{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
          ]),
          name: "['get', 'incr', 'decr', 'delete', 'cas', 'touch']",
          unit: '次'
        },
        {
          title: '未命中命令数',
          value: 'misses',
          expr: JSON.stringify([
            'sum(memcached_get_misses{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_incr_misses{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_decr_misses{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_delete_misses{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_cas_misses{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_touch_misses{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
          ]),
          name: "['get', 'incr', 'decr', 'delete', 'cas', 'touch']",
          unit: '次'
        },
        {
          title: '命令总次数',
          value: 'cmd',
          expr: JSON.stringify([
            'sum(memcached_cmd_get{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_cmd_set{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_cmd_flush{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(memcached_cmd_touch{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
          ]),
          name: "['get', 'set', 'flush_all', 'touch']",
          unit: '次'
        },
        {
          title: '存储数据总数',
          value: 'storage',
          expr: JSON.stringify(['sum(memcached_curr_items{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)', 'sum(memcached_total_items{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['当前存储数量', '自服务器启动存储总数量']",
          unit: '条'
        },
        { title: '连接数', value: 'link', expr: JSON.stringify(['sum(memcached_curr_connections{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']), name: "['当前连接数']", unit: '个' },
        { title: '线程数', value: 'threads', expr: JSON.stringify(['sum(memcached_threads{kvs_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']), name: "['当前线程数']", unit: '个' },
        {
          title: '数据量',
          value: 'bytes',
          expr: JSON.stringify(['round(memcached_bytes_read{kvs_id="' + this.resourceId + '"}/1024/1024,0.01)', 'round(memcached_bytes_written{kvs_id="' + this.resourceId + '"}/1024/1024,0.01)']),
          name: "['读取', '发送']",
          unit: 'MB'
        },
        { title: '内存', value: 'mem', expr: JSON.stringify(['round(memcached_limit_maxbytes{kvs_id="' + this.resourceId + '"}/1024/1024,0.01)']), name: "['分配内存大小']", unit: 'MB' }
      ]
      for (const key in this.dashboradData) {
        const element = this.dashboradData[key]
        this.$set(element, 'step', null)
        this.$set(element, 'stepValue', 20)
        this.$set(element, 'defindTime', [])
      }
    }
  },
  created() {
    this.getDetail()
  }
}
</script>
<style scopes></style>
