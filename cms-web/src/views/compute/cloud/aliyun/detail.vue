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
          value: 'cpu',
          expr: JSON.stringify(['round(aliyun_CPUUtilization{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify(['round(aliyun_memory_usedutilization{instance_id="' + this.instanceId + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '公网流入带宽',
          value: 'InternetInRate',
          expr: JSON.stringify(['aliyun_VPC_PublicIP_InternetInRate{instance_id="' + this.instanceId + '"}']),
          name: "['公网流入带宽']",
          unit: 'bit/s'
        },
        {
          title: '公网流出带宽',
          value: 'InternetOutRate',
          expr: JSON.stringify(['aliyun_VPC_PublicIP_InternetOutRate{instance_id="' + this.instanceId + '"}']),
          name: "['公网流出带宽']",
          unit: 'bit/s'
        },
        {
          title: '内网流入带宽',
          value: 'IntranetInRate',
          expr: JSON.stringify(['aliyun_IntranetInRate{instance_id="' + this.instanceId + '"}']),
          name: "['内网流入带宽']",
          unit: 'bit/s'
        },
        {
          title: '内网流出带宽',
          value: 'IntranetOutRate',
          expr: JSON.stringify(['aliyun_IntranetOutRate{instance_id="' + this.instanceId + '"}']),
          name: "['内网流出带宽']",
          unit: 'bit/s'
        },
        {
          title: '文件系统利用率',
          value: 'disk_usedPercent',
          expr: JSON.stringify(['round(aliyun_diskusage_utilization{instance_id="' + this.instanceId + '",diskname!=""},0.01)']),
          name: "['$diskname']",
          unit: '%'
        },
        {
          title: '文件系统使用量',
          value: 'DiskUesd',
          expr: JSON.stringify([`round((aliyun_diskusage_used{diskname!="",instance_id='${this.instanceId}'})/1024)`]),
          name: "['$diskname']",
          unit: 'KB'
        },
        {
          title: '磁盘读IOPS',
          value: 'disk_readiops',
          expr: JSON.stringify(['aliyun_disk_readiops{instance_id="' + this.instanceId + '"}']),
          name: "['磁盘读IOPS']",
          unit: 'Count/s'
        },
        {
          title: '磁盘写IOPS',
          value: 'disk_writeiops',
          expr: JSON.stringify(['aliyun_disk_writeiops{instance_id="' + this.instanceId + '"}']),
          name: "['磁盘写IOPS']",
          unit: 'Count/s'
        },
        {
          title: '系统盘总读BPS',
          value: 'DiskReadBPS',
          expr: JSON.stringify(['aliyun_DiskReadBPS{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘总读BPS']",
          unit: 'Byte/s'
        },
        {
          title: '系统盘总写BPS',
          value: 'DiskWriteBPS',
          expr: JSON.stringify(['aliyun_DiskWriteBPS{instance_id="' + this.instanceId + '"}']),
          name: "['系统盘总写BPS']",
          unit: 'Byte/s'
        }
      ],
      detailData: {},
      detailMapList: [
        { name: 'IP', value: 'privateIps', unit: '', type: 'aliyun', value2: 'publicIps' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      dashboradData: {
        cpu: {},
        memory: {},
        InternetInRate: {},
        InternetOutRate: {},
        IntranetInRate: {},
        IntranetOutRate: {},
        disk_usedPercent: {},
        DiskUesd: {},
        disk_readiops: {},
        disk_writeiops: {},
        DiskReadBPS: {},
        DiskWriteBPS: {}
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
