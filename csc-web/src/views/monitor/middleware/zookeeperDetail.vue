<template>
  <el-card>
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
  </el-card>
</template>
<script>
import { getCharts } from 'services/monitor'
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
  props: {
    detailId: {
      type: Number
    },
    detail: {
      type: Object
    }
  },
  beforeDestroy() {},
  data() {
    return {
      intervalData,
      typeData: [],
      node: '',
      nodesData: [],
      server: '',
      port: '',
      // 图表
      dashboradData: {
        overview: {},
        aliveLinks: {},
        nodes: {},
        packets: {},
        latency: {},
        fd: {},
        outRes: {},
        znode: {}
      }
    }
  },
  methods: {
    getNodesData() {
      this.nodesData = []
      this.detail.nodes.forEach(item => {
        this.nodesData.push(item)
        if (this.nodesData.length == 1) {
          this.node = this.nodesData[0].id
          this.server = this.nodesData[0].address
          this.port = this.nodesData[0].port
          this.getData()
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
          title: '数据总量',
          value: 'overview',
          expr: JSON.stringify(['round(sum(zookeeper_approximate_data_size{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"}/1024)by(hostname),0.01)']),
          name: "['数据总量']",
          unit: 'MB'
        },
        {
          title: '活跃连接数',
          value: 'aliveLinks',
          expr: JSON.stringify(['sum(zookeeper_num_alive_connections{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['活跃连接数']",
          unit: '个'
        },
        {
          title: '临时节点数',
          value: 'nodes',
          expr: JSON.stringify(['sum(zookeepe_ephemerals_count{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['临时节点数']",
          unit: '个'
        },
        {
          title: '收发包数',
          value: 'packets',
          expr: JSON.stringify(['sum(zookeeper_packets_received{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)', 'sum(zookeeper_packets_sent{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['收包数', '发包数']",
          unit: '个'
        },
        {
          title: '响应延迟',
          value: 'latency',
          expr: JSON.stringify([
            'sum(zookeeper_max_latency{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(zookeeper_min_latency{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(zookeeper_avg_latency{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
          ]),
          name: "['最大响应延迟', '最小响应延迟', '平均响应延迟']",
          unit: 'ms'
        },
        {
          title: '文件描述符数',
          value: 'fd',
          expr: JSON.stringify([
            'sum(zookeeper_max_file_descriptor_count{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(zookeeper_open_file_descriptor_count{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
          ]),
          name: "['最大文件描述符数', '打开文件描述符数']",
          unit: '个'
        },
        {
          title: '堆积请求数',
          value: 'outRes',
          expr: JSON.stringify(['sum(zookeeper_outstanding_requests{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['堆积请求数']",
          unit: '次'
        },
        {
          title: 'znode数',
          value: 'znode',
          expr: JSON.stringify(['sum(zookeeper_znode_count{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)', 'sum(zookeeper_watch_count{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['znode数', 'watch数']",
          unit: '个'
        }
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
    this.getNodesData()
  }
}
</script>
<style scopes></style>
