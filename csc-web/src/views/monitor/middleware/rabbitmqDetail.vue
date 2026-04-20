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
        message: {},
        rate: {},
        proc: {},
        disk: {},
        mem: {},
        fd: {},
        socket: {}
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
          title: '统计信息',
          value: 'overview',
          expr: JSON.stringify([
            'sum(rabbitmq_overview_connections{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)',
            'sum(rabbitmq_overview_channels{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)',
            'sum(rabbitmq_overview_exchanges{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)',
            'sum(rabbitmq_overview_queues{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)',
            'sum(rabbitmq_overview_consumers{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)'
          ]),
          name: "['connection数', 'channel数', 'exchange数', 'queue数', 'consumer数']",
          unit: '个'
        },
        {
          title: '队列中消息数量',
          value: 'message',
          expr: JSON.stringify([
            'sum(rabbitmq_overview_messages{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)',
            'sum(rabbitmq_overview_messages_ready{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)',
            'sum(rabbitmq_overview_messages_unacked{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)'
          ]),
          name: "['Total', 'Ready', 'Unacked']",
          unit: '条'
        },
        {
          title: '消息处理速率',
          value: 'rate',
          expr: JSON.stringify([
            'sum(rabbitmq_exchange_messages_publish_in_rate{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)',
            'sum(rabbitmq_exchange_messages_publish_out_rate{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)'
          ]),
          name: "['写入', '消费']",
          unit: '条/秒'
        },
        {
          title: 'Erlang进程数量',
          value: 'proc',
          expr: JSON.stringify(['sum(rabbitmq_node_proc_total{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)', 'sum(rabbitmq_node_proc_used{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)']),
          name: "['最大可用', '已用']",
          unit: '个'
        },
        {
          title: '磁盘',
          value: 'disk',
          expr: JSON.stringify([
            'round(sum(rabbitmq_node_disk_free{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"}/1024/1024/1024)by(server),0.01)',
            'round(sum(rabbitmq_node_disk_free_limit{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"}/1024/1024/1024)by(server),0.01)'
          ]),
          name: "['空闲量', '剩余阈值量']",
          unit: 'GB'
        },
        {
          title: '内存',
          value: 'mem',
          expr: JSON.stringify([
            'round(sum(rabbitmq_node_mem_used{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"}/1024/1024)by(server),0.01)',
            'round(sum(rabbitmq_node_mem_used{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"}/1024/1024)by(server),0.01)'
          ]),
          name: "['总量', '使用阈值量']",
          unit: 'MB'
        },
        {
          title: '文件描述符数量',
          value: 'fd',
          expr: JSON.stringify(['sum(rabbitmq_node_fd_total{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)', 'sum(rabbitmq_node_fd_used{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)']),
          name: "['最大可用', '已用']",
          unit: '个'
        },
        {
          title: 'Socket数量',
          value: 'socket',
          expr: JSON.stringify(['sum(rabbitmq_node_sockets_total{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)', 'sum(rabbitmq_node_sockets_used{cms_id="' + this.detailId + '",server="' + this.server + ':' + this.port + '"})by(server)']),
          name: "['最大可用', '已用']",
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
