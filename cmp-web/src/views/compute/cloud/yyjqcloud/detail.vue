<template>
  <div>
    <detail-map :detail="detailData" :list="detailMapList" v-if="isShow"></detail-map>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
import { getOpenstackVm } from 'services/monitor'
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { detailMap, chartBox },
  props: {
    detailId: {
      type: Number
    },
    instanceId: {
      type: String
    },
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      typeData: [
        {
          title: 'CPU利用率',
          value: 'yyjqcloud_cvm_cpu',
          expr: JSON.stringify(['round(yyjqcloud_cvm_cpu{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'yyjqcloud_cvm_memory',
          expr: JSON.stringify(['round(yyjqcloud_cvm_memory{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '网卡流入带宽',
          value: 'yyjqcloud_cvm_network_in',
          expr: JSON.stringify(['yyjqcloud_cvm_network_in{instance_id="' + this.instanceId + '"}']),
          name: "['网卡流入带宽']",
          unit: 'Byte/s'
        },
        {
          title: '网卡流出带宽',
          value: 'yyjqcloud_cvm_network_out',
          expr: JSON.stringify(['yyjqcloud_cvm_network_out{instance_id="' + this.instanceId + '"}']),
          name: "['网卡流出带宽']",
          unit: 'Byte/s'
        },
        {
          title: '系统盘吞吐量（读）',
          value: 'yyjqcloud_cvm_disk_os_read',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_os_read{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘吞吐量（读）']",
          unit: 'Byte/s'
        },
        {
          title: '系统盘吞吐量（写）',
          value: 'yyjqcloud_cvm_disk_os_write',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_os_write{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘吞吐量（写）']",
          unit: 'Byte/s'
        },
        {
          title: '系统盘IOPS（读）',
          value: 'yyjqcloud_cvm_disk_iops_os_read',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_iops_os_read{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘IOPS（读）']",
          unit: 'IOPS'
        },
        {
          title: '系统盘IOPS（写）',
          value: 'DiskWriteBPS',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_iops_os_write{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘IOPS（写）']",
          unit: 'IOPS'
        },
        {
          title: '系统盘空间使用率',
          value: 'yyjqcloud_cvm_disk_us_os_percent',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_us_os_percent{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘空间使用率']",
          unit: '%'
        },
        {
          title: '系统盘空间使用量',
          value: 'yyjqcloud_cvm_disk_us_os_used',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_us_os_used{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘空间使用量']",
          unit: 'MB'
        },
        {
          title: '系统盘空间未使用量',
          value: 'yyjqcloud_cvm_disk_us_os_unused',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_us_os_unused{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘空间未使用量']",
          unit: 'MB'
        },
        {
          title: '数据盘吞吐量（读）',
          value: 'yyjqcloud_cvm_disk_read',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_read{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘吞吐量（读）']",
          unit: 'Byte/s'
        },
        {
          title: '数据盘吞吐量（写）',
          value: 'yyjqcloud_cvm_disk_write',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_write{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘吞吐量（写）']",
          unit: 'Byte/s'
        },
        {
          title: '数据盘读IOPS',
          value: 'yyjqcloud_cvm_disk_iops_read',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_iops_read{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘读IOPS']",
          unit: 'IOPS'
        },
        {
          title: '数据盘写IOPS',
          value: 'yyjqcloud_cvm_disk_iops_write',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_iops_write{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘写IOPS']",
          unit: 'IOPS'
        },
        {
          title: '数据盘空间使用率',
          value: 'yyjqcloud_cvm_disk_us_percent',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_us_percent{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘空间使用率']",
          unit: '%'
        },
        {
          title: '数据盘空间使用量',
          value: 'yyjqcloud_cvm_disk_us_used',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_us_used{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘空间使用量']",
          unit: 'MB'
        },
        {
          title: '数据盘空间未使用量',
          value: 'yyjqcloud_cvm_disk_us_unused',
          expr: JSON.stringify(['yyjqcloud_cvm_disk_us_unused{instance_id="' + this.instanceId + '"}']),
          name: "['数据盘空间未使用量']",
          unit: 'MB'
        }
      ],
      detailData: {},
      detailMapList: [
        { name: 'IP', value: 'privateIps', unit: '', type: 'qcloud', value2: 'publicIps' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      dashboradData: {
        yyjqcloud_cvm_cpu: {},
        yyjqcloud_cvm_memory: {},
        yyjqcloud_cvm_disk_os_read: {},
        yyjqcloud_cvm_disk_os_write: {},
        yyjqcloud_cvm_disk_iops_os_read: {},
        yyjqcloud_cvm_disk_iops_os_write: {},
        yyjqcloud_cvm_disk_us_os_percent: {},
        yyjqcloud_cvm_disk_us_os_used: {},
        yyjqcloud_cvm_disk_us_os_unused: {},
        yyjqcloud_cvm_disk_read: {},
        yyjqcloud_cvm_disk_write: {},
        yyjqcloud_cvm_disk_iops_read: {},
        yyjqcloud_cvm_disk_iops_write: {},
        yyjqcloud_cvm_disk_us_percent: {},
        yyjqcloud_cvm_disk_us_used: {},
        yyjqcloud_cvm_disk_us_unused: {},
        yyjqcloud_cvm_network_in: {},
        yyjqcloud_cvm_network_out: {}
      }
    }
  },
  methods: {
    getOverview() {
      getOpenstackVm(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          if (this.detailData.privateIps) this.detailData.privateIps = JSON.parse(this.detailData.privateIps)
          if (this.detailData.publicIps) this.detailData.publicIps = JSON.parse(this.detailData.publicIps)
          this.detailData.spec = (this.detailData.cpu ? this.detailData.cpu : 0) + 'C/' + (this.detailData.memory ? this.detailData.memory : 0) + 'GB/' + (this.detailData.disk == null ? 0 : this.detailData.disk) + 'GB'
        }
      })
    }
  },
  created() {
    this.getOverview()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  },
  beforeDestroy() {}
}
</script>
<style></style>
