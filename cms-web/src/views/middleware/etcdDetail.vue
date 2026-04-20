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
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </el-card>
</template>
<script>
import { getCharts } from 'services/monitor'
import chartBox from 'views/components/chartBox.vue'
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
        leader: {},
        db: {},
        proposals: {},
        snap: {},
        fd: {},
        net: {}
      }
    }
  },
  methods: {
    getNodesData() {
      this.nodesData = []
      this.detail.nodes.forEach((item) => {
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
          title: 'Leader',
          value: 'leader',
          expr: JSON.stringify(['sum(etcd_server_leader_changes_seen_total{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['Leader变换次数']",
          unit: '次'
        },
        {
          title: '数据库大小',
          value: 'db',
          expr: JSON.stringify(['round(sum(etcd_debugging_mvcc_db_total_size_in_bytes{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"}/1024)by(hostname),0.01)']),
          name: "['数据库大小']",
          unit: 'KB'
        },
        {
          title: '提案数量',
          value: 'proposals',
          expr: JSON.stringify([
            'sum(etcd_server_proposals_pending{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(etcd_server_proposals_failed_total{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(etcd_server_proposals_committed_total{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)',
            'sum(etcd_server_proposals_applied_total{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)'
          ]),
          name: "['处理中', '失败', '已落实', '已应用']",
          unit: '个'
        },
        {
          title: '快照',
          value: 'snap',
          expr: JSON.stringify(['sum(etcd_debugging_snap_save_total_duration_seconds_sum{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['快照保存用时']",
          unit: 's'
        },
        {
          title: '文件描述符',
          value: 'fd',
          expr: JSON.stringify(['sum(process_open_fds{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)', 'sum(process_max_fds{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['打开数量', '打开最大数量']",
          unit: '个'
        },
        {
          title: '网络',
          value: 'net',
          expr: JSON.stringify([
            'round(sum(etcd_network_client_grpc_received_bytes_total{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"}/1024)by(hostname),0.01)',
            'round(sum(etcd_network_client_grpc_sent_bytes_total{ccs_id="' + this.detailId + '",hostname="' + this.server + ':' + this.port + '"}/1024)by(hostname),0.01)'
          ]),
          name: "['接收到grpc客户端的字节总数', '发送给grpc客户端的字节总数']",
          unit: 'KB'
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
