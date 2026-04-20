<template>
  <el-card>
    <common-detail :setting="{ type: 'PostgreSQL' }" :title="detailData.name" @goBack="goBack">
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
import { getRdsDetail } from 'services/monitor/database'
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
      resourceId: Number(this.$route.query.id),
      categoryFilter: {
        standalone: '单机',
        cluster: '集群'
      },
      intervalData,
      typeData: [],
      detailData: {},
      node: '',
      nodesData: [],
      server: '',
      port: '',
      // 图表
      dashboradData: {
        qps: {},
        tps: {},
        link: {},
        check: {}
      }
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    getDetail() {
      getRdsDetail(this.resourceId).then(data => {
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
          title: 'QPS',
          value: 'qps',
          expr: JSON.stringify([
            'round(sum(irate(postgresql_tup_inserted{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)',
            'round(sum(irate(postgresql_tup_updated{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)',
            'round(sum(irate(postgresql_tup_deleted{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)',
            'round(sum(irate(postgresql_tup_fetched{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)',
            'round(sum(irate(postgresql_tup_returned{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
          ]),
          name: "['每秒insert次数', '每秒update次数', '每秒delete次数', '每秒fetch次数', '每秒return次数']",
          unit: '次'
        },
        {
          title: 'TPS',
          value: 'tps',
          expr: JSON.stringify([
            'round(sum(irate(postgresql_xact_commit{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)',
            'round(sum(irate(postgresql_xact_rollback{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)',
            'round(sum(irate(postgresql_deadlocks{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"}[5m]))by(hostname),0.01)'
          ]),
          name: "['每秒事务数', '每秒回滚事务数', '每秒死锁数']",
          unit: '次'
        },
        { title: '连接数', value: 'link', expr: JSON.stringify(['sum(postgresql_numbackends{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']), name: "['数据库连接数']", unit: '个' },
        {
          title: '检查点数',
          value: 'check',
          expr: JSON.stringify(['sum(postgresql_checkpoints_req{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)', 'sum(postgresql_checkpoints_timed{rds_id="' + this.resourceId + '",hostname="' + this.server + ':' + this.port + '"})by(hostname)']),
          name: "['需求检查点数', '定期检查点数']",
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
    this.getDetail()
  }
}
</script>
<style scopes></style>
