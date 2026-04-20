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
import detailMap from 'views/components/detailMap.vue'
export default {
  components: { chartBox, detailMap },
  props: {
    detailId: {
      type: String
    },
    detailData: {
      type: Object
    },
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      detailMapList: [
        { name: '名称', value: 'name' },
        { name: 'IP', value: 'ip', unit: '' }
      ],
      typeData: [
        {
          title: 'CPU利用率',
          value: 'cpu',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_cpuUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["CPU利用率"]',
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_memoryUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["内存利用率"]',
          unit: '%'
        },
        {
          title: '网络速率',
          value: 'net',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_nicByteIn{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_vm_nicByteOut{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["网络流入速率", "网络流出速率"]',
          unit: 'KB/s'
        },
        {
          title: '磁盘操作速率',
          value: 'disk',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_disk_read_requests_rate{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_vm_disk_write_requests_rate{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["磁盘读操作速率", "磁盘写操作速率"]',
          unit: 'IO/s'
        },
        {
          title: '云硬盘利用率',
          value: 'diskUsage',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_diskUsage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["云硬盘利用率"]',
          unit: '%'
        },
        {
          title: 'CPU额度',
          value: 'cpuload',
          expr: JSON.stringify(['bocloud_inspurcloud_vm_cpu_credit_usage{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}', 'bocloud_inspurcloud_vm_cpu_credit_balance{id="' + this.detailId + '",vendorId="' + this.$route.query.vendorId + '"}']),
          name: '["CPU额度使用", "CPU额度余额"]',
          unit: ''
        }
      ],
      dashboradData: {
        cpu: {},
        memory: {},
        net: {},
        diskUsage: {},
        disk: {},
        cpuload: {}
      }
    }
  },
  beforeDestroy() {},
  methods: {
    getDetail() {
      let ip = ''
      const array = this.detailData.privateIps || []
      array.forEach((item) => {
        item.addresses.forEach((item1) => {
          ip = ip + item1.address + ','
        })
      })
      ip = ip.substring(0, ip.length - 1)
      this.detailData.ip = ip
    }
  },
  created() {
    this.getDetail()
    for (const key in this.dashboradData) {
      const element = this.dashboradData[key]
      this.$set(element, 'step', null)
      this.$set(element, 'stepValue', 20)
      this.$set(element, 'defindTime', [])
    }
  }
}
</script>
<style scoped>
.box-card .basic-info .attr-name {
  display: inline-block;
  white-space: nowrap;
  color: #999;
  width: 98px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.box-card .basic-info .attr {
  font-size: 12px;
  margin-bottom: 12px;
}
</style>
