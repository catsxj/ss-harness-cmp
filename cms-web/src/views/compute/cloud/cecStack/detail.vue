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
          expr: JSON.stringify(['round(bocloud_cecstack_vm_cpu_usage{id="' + this.instanceId + '"}, 0.01)']),
          name: "['CPU利用率']",
          unit: '%'
        },
        {
          title: '内存利用率',
          value: 'memory',
          expr: JSON.stringify(['round(bocloud_cecstack_vm_memory_usage{id="' + this.instanceId + '"}, 0.01)']),
          name: "['内存利用率']",
          unit: '%'
        },
        {
          title: '磁盘读IOPS',
          value: 'disk_readiops',
          expr: JSON.stringify(['bocloud_cecstack_vm_disk_read_iops{id="' + this.instanceId + '"}']),
          name: "['磁盘读IOPS']",
          unit: 'IOPS'
        },
        {
          title: '磁盘写IOPS',
          value: 'disk_writeiops',
          expr: JSON.stringify(['bocloud_cecstack_vm_disk_write_iops{id="' + this.instanceId + '"}']),
          name: "['磁盘写IOPS']",
          unit: 'IOPS'
        },

        {
          title: '虚拟机IO吞吐量读',
          value: 'DiskReadBPS',
          expr: JSON.stringify(['bocloud_cecstack_vm_disk_read_rate{id="' + this.instanceId + '"}']),
          name: "['虚拟机IO吞吐量读']",
          unit: 'KBps'
        },
        {
          title: '虚拟机IO吞吐量写',
          value: 'DiskWriteBPS',
          expr: JSON.stringify(['bocloud_cecstack_vm_disk_write_rate{id="' + this.instanceId + '"}']),
          name: "['虚拟机IO吞吐量写']",
          unit: 'KBps'
        },

        // '网络接收吞吐量', 'bocloud_cecstack_vm_net_receive_rate',  'MB/s',
        // '网络发送吞吐量', 'bocloud_cecstack_vm_net_transmit_rate', 'MB/s',
        {
          title: '网络接收吞吐量',
          value: 'InternetInRate',
          expr: JSON.stringify(['bocloud_cecstack_vm_net_receive_rate{id="' + this.instanceId + '"}']),
          name: "['网络接收吞吐量']",
          unit: 'MB/s'
        },
        {
          title: '网络发送吞吐量',
          value: 'InternetOutRate',
          expr: JSON.stringify(['bocloud_cecstack_vm_net_transmit_rate{id="' + this.instanceId + '"}']),
          name: "['网络发送吞吐量']",
          unit: 'MB/s'
        }
      ],
      detailData: {},
      detailMapList: [
        { name: 'IP', value: 'privateIps', unit: '', type: 'cecstack', value2: 'publicIps' },
        { name: '规格', value: 'spec' },
        { name: '创建时间', value: 'gmtCreate', unit: '' },
        { name: '操作系统', value: 'osCategory' }
      ],
      dashboradData: {
        cpu: {},
        memory: {},
        InternetInRate: {},
        InternetOutRate: {},
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
