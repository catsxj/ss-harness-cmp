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
      <el-col :span="12">
        <rich-charts title="CPU(平均使用率)" defaultChart="line-charts" :data="PercentageCPU" v-if="PercentageCPU.keys" class="m-t"> </rich-charts>
      </el-col>
      <el-col :span="12">
        <rich-charts title="网络(总计)" defaultChart="line-charts" :data="networkTotal" v-if="networkTotal.keys" class="m-t"> </rich-charts>
      </el-col>
      <el-col :span="12">
        <rich-charts title="磁盘字节数(总数)" defaultChart="line-charts" :data="diskReadBytes" v-if="diskReadBytes.keys" class="m-t"> </rich-charts>
      </el-col>
      <el-col :span="12">
        <rich-charts title="磁盘操作/秒(平均)" defaultChart="line-charts" :data="diskRead" v-if="diskRead.keys" class="m-t"> </rich-charts>
      </el-col>
    </el-row>
    <other :add-data="otherData" v-if="otherData.dialog"></other>
  </div>
</template>
<script>
import { getMonitor } from 'services/platform/azure'
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
      }
    }
  },
  created() {
    this.getAllData(this.params)
  },
  methods: {
    openDialog() {
      this.otherData = {
        dialog: true,
        data: {
          vendorId: this.detail.vendorId,
          resourceUri: this.detail.instanceId
        }
      }
    },
    getAllData(data) {
      this.params = data
      this.getPercentageCPU()
      this.getNetworkTotal()
      this.getDiskReadBytes()
      this.getDiskRead()
    },
    getPercentageCPU() {
      getMonitor({
        vendorId: this.detail.vendorId,
        resourceUri: this.detail.instanceId,
        metricNamespace: 'Microsoft.Compute/virtualMachines',
        time: this.params.time,
        interval: this.particleSize,
        metricnames: 'Percentage CPU',
        aggregation: 'average'
      }).then(data => {
        if (data.success) {
          this.PercentageCPU = data.data
        }
      })
    },
    getNetworkTotal() {
      getMonitor({
        vendorId: this.detail.vendorId,
        resourceUri: this.detail.instanceId,
        metricNamespace: 'Microsoft.Compute/virtualMachines',
        time: this.params.time,
        interval: this.particleSize,
        metricnames: 'Network In Total',
        aggregation: 'average'
      }).then(data => {
        if (data.success) {
          this.networkTotal = data.data
        }
      })
    },
    getDiskReadBytes() {
      getMonitor({
        vendorId: this.detail.vendorId,
        resourceUri: this.detail.instanceId,
        metricNamespace: 'Microsoft.Compute/virtualMachines',
        time: this.params.time,
        interval: this.particleSize,
        metricnames: 'Disk Read Bytes',
        aggregation: 'average'
      }).then(data => {
        if (data.success) {
          this.diskReadBytes = data.data
        }
      })
    },
    getDiskRead() {
      getMonitor({
        vendorId: this.detail.vendorId,
        resourceUri: this.detail.instanceId,
        metricNamespace: 'Microsoft.Compute/virtualMachines',
        time: this.params.time,
        interval: this.particleSize,
        metricnames: 'Disk Read Operations/Sec',
        aggregation: 'average'
      }).then(data => {
        if (data.success) {
          this.diskRead = data.data
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
