<template>
  <div>
    <el-row :gutter="5">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import chartBox from 'views/components/chartBox.vue'
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    },
    identifier: {
      type: String
    },
    hostName: {
      type: String
    },
    uuid: {
      type: String
    },
    instanceId: {
      type: String
    }
  },
  data() {
    return {
      detailData: {},
      typeData: [
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
      dashboradData: {
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
        yyjqcloud_cvm_disk_us_unused: {}
      }
    }
  },
  methods: {},
  created() {
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
