<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>基本信息</span>
      </div>
      <div class="basic-info">
        <el-row>
          <el-col :span="8" class="attr">
            <span class="attr-name">名称：</span>
            <span class="attr-value">{{ detailData.name }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">IP：</span>
            <span class="attr-value">{{ detailData.managerIp }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">当前状态：</span>
            <span class="attr-value">{{ vmStatusFilter(detailData.status) }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">宿主机：</span>
            <span class="attr-value">{{ detailData.hostName }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">规格：</span>
            <span class="attr-value">{{ detailData.flavorName }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">创建时间：</span>
            <span class="attr-value">{{ detailData.gmtVmCreate }}</span>
          </el-col>
          <el-col :span="8" class="attr">
            <span class="attr-name">操作系统：</span>
            <span class="attr-value">{{ detailData.osCategory }}</span>
          </el-col>
        </el-row>
      </div>
    </el-card>
    <el-row :gutter="5" class="m-t-xs">
      <el-col :span="12" v-for="chart in typeData" :key="chart.value">
        <chart-box :params-data="chart" :item-data="dashboradData[chart.value]"></chart-box>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { vmStatusFilter } from '@/filters/index'
import chartBox from 'views/components/chartBox.vue'
import { getCharts, getOpenstackVm } from 'services/monitor'
const typeData = [
  {
    title: 'CPU利用率',
    value: 'cpuUtil',
    expr: JSON.stringify(['round(bocloud_openstack_cpu_util{id="' + this.instanceId + '"}, 0.01)']),
    name: '["cpu利用率"]',
    unit: '%'
  },
  {
    title: '内存利用率',
    value: 'memoryUsage',
    expr: JSON.stringify(['round(bocloud_openstack_memory_usage{id="' + this.instanceId + '"}/bocloud_openstack_memory{id="' + this.instanceId + '"} * 100,0.01)']),
    name: '["内存利用率"]',
    unit: '%'
  },
  {
    title: '磁盘读写总量',
    value: 'diskBytes',
    expr: JSON.stringify(['round(bocloud_openstack_disk_read_bytes{id="' + this.instanceId + '"}/ 1024,0.01)', 'round(bocloud_openstack_disk_write_bytes{id="' + this.instanceId + '"}/ 1024,0.01)']),
    name: '["读取", "写入"]',
    unit: 'KB'
  },
  {
    title: '磁盘读写速率',
    value: 'diskBytesRate',
    expr: JSON.stringify(['round(bocloud_openstack_disk_read_bytes_rate{id="' + this.instanceId + '"} / 1024,0.01)', 'round(bocloud_openstack_disk_write_bytes_rate{id="' + this.instanceId + '"}/ 1024,0.01)']),
    name: '["读取", "写入"]',
    unit: 'KB/s'
  },
  {
    title: '网络传输总量',
    value: 'networkBytes',
    expr: JSON.stringify(['round(bocloud_openstack_network_incoming_bytes{instance_id="' + this.instanceId + '"} / 1024,0.01)', 'round(bocloud_openstack_network_outgoing_bytes{instance_id="' + this.instanceId + '"}/ 1024,0.01)']),
    name: '["{name}_传入", "{name}_传出"]',
    unit: 'KB'
  },
  {
    title: '网络传输速率',
    value: 'networkBytesRate',
    expr: JSON.stringify(['round(bocloud_openstack_network_incoming_bytes_rate{instance_id="' + this.instanceId + '"} / 1024,0.01)', 'round(bocloud_openstack_network_outgoing_bytes_rate{instance_id="' + this.instanceId + '"}/ 1024,0.01)']),
    name: '["{name}_传入", "{name}_传出"]',
    unit: 'KB/s'
  }
]
export default {
  components: { chartBox },
  props: {
    detailId: {
      type: Number
    },
    instanceId: {
      type: String
    }
  },
  data() {
    return {
      vmStatusFilter,
      typeData,
      detailData: {},
      dashboradData: {
        cpuUtil: {},
        diskBytes: {},
        diskBytesRate: {},
        networkBytes: {},
        networkBytesRate: {},
        memoryUsage: {}
      }
    }
  },
  methods: {
    goBack() {
      history.go(-1)
    },
    getOverview() {
      getOpenstackVm(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
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
