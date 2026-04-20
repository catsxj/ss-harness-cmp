<template>
  <div class="wrapper">
    <el-form inline>
      <el-form-item label="时间：">
        <TimeSelect :get-data="getAllData" :costom="false"></TimeSelect>
      </el-form-item>
      <el-form-item label="粒度：">
        <el-radio-group v-model="particleSize" @change="getAllData({ time: params.time })">
          <el-radio-button v-for="(item, index) in particleSizeList" :key="index" :label="item.value">{{ item.name }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="parimary" @click="openDialog">查看更多监控图表</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10">
      <el-col :span="12" v-for="(item, index) in definitions" :key="index">
        <rich-charts :title="item.value" defaultChart="line-charts" :data="item.monitors" v-if="item.monitors.keys" class="m-t"> </rich-charts>
      </el-col>
    </el-row>
    <other :add-data="otherData" v-if="otherData.dialog"></other>
  </div>
</template>
<script>
import { getMonitor, getMonitorName, getMonitorDefinitions } from 'services/platform/azure'
import other from './otherMonitor.vue'
export default {
  components: { other },
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      params: {
        time: 'Months'
      },
      PercentageCPU: {},
      networkTotal: {},
      diskReadBytes: {},
      diskRead: {},
      particleSize: 'PT1H',
      particleSizeList: [
        { name: '1分钟', value: 'PT1M' },
        { name: '5分钟', value: 'PT5M' },
        { name: '30分钟', value: 'PT30M' },
        { name: '1小时', value: 'PT1H' },
        { name: '6小时', value: 'PT6H' },
        { name: '12小时', value: 'PT12H' }
      ],
      otherData: {
        dialog: false,
        data: {}
      },
      metricNamespace: '',
      definitions: []
    }
  },
  created() {
    this.getMonitorName()
  },
  methods: {
    getMonitorName() {
      getMonitorName({
        vendorId: this.detail.vendorId,
        resourceUri: this.detail.databaseServerUuid
      }).then(data => {
        if (data.success) {
          const value = data.data ? JSON.parse(data.data).value : {}
          this.metricNamespace = value[0].properties.metricNamespaceName
          this.getMonitorDefinitionsList()
        }
      })
    },
    openDialog() {
      this.otherData = {
        dialog: true,
        data: {
          vendorId: this.detail.vendorId,
          resourceUri: this.detail.databaseServerUuid,
          metricNamespace: this.metricNamespace
        }
      }
    },
    getMonitorDefinitionsList() {
      getMonitorDefinitions({
        resourceUri: this.detail.databaseServerUuid,
        metricNamespace: this.metricNamespace,
        vendorId: this.detail.vendorId
      }).then(data => {
        if (data.success) {
          const value = data.data ? JSON.parse(data.data).value : []
          const definitions = value.map(item => {
            return {
              ...item,
              value: item.name.value,
              monitors: {}
            }
          })
          this.definitions = definitions.slice(0, 4)
          console.log(data)
          this.getAllData(this.params)
        }
      })
    },
    getAllData(data) {
      this.params = data
      this.definitions.forEach(item => {
        this.getMonitor(item)
      })
    },
    getMonitor(row) {
      getMonitor({
        vendorId: this.detail.vendorId,
        resourceUri: this.detail.databaseServerUuid,
        metricNamespace: this.metricNamespace,
        time: this.params.time,
        interval: this.particleSize,
        metricnames: row.value,
        aggregation: 'average'
      }).then(data => {
        if (data.success) {
          this.$set(row, 'monitors', data.data)
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.right-border {
  border-right: 1px solid #000;
  min-height: 270px;
  text-align: left;
  // padding-top: 30px;
  padding-left: 20px;
  // line-height: 260px;
}
.right-border div {
  font-size: 20px;
  line-height: 2;
}
.title-header {
  text-align: right;
  font-size: 14px;
  color: #888e99;
}
.title-body {
  text-align: right;
  font-size: 26px;
  font-weight: bold;
  margin-top: 10px;
  color: #343437;
}
.titles {
  display: inline-block;
}
.image {
  display: inline-block;
}
.image img {
  margin-right: 10px;
}
</style>
