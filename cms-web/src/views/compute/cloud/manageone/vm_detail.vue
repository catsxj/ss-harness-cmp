<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tabs ref="resourceMonitorTab" @tab-click="handleClick" v-model="activeName" type="card">
        <el-tab-pane name="overview">
          <span slot="label">资源总览</span>
          <overview ref="overview" v-if="activeName == 'overview'" :instanceId="instanceId" :detail-id="detailId" :detail-data="detailData" :vendorId="detailData.vendorId"></overview>
        </el-tab-pane>
        <el-tab-pane name="cpu">
          <span slot="label">CPU</span>
          <cpu ref="cpu" v-if="activeName == 'cpu'" :instanceId="instanceId" :detail-id="detailId" :vendorId="detailData.vendorId"></cpu>
        </el-tab-pane>
        <el-tab-pane name="mem">
          <span slot="label">内存</span>
          <mem ref="mem" v-if="activeName == 'mem'" :instanceId="instanceId" :detail-id="detailId" :vendorId="detailData.vendorId"></mem>
        </el-tab-pane>
        <el-tab-pane name="net">
          <span slot="label">网络</span>
          <net ref="net" v-if="activeName == 'net'" :instanceId="instanceId" :detail-id="detailId" :vendorId="detailData.vendorId"></net>
        </el-tab-pane>
        <el-tab-pane name="clouddisk">
          <span slot="label">云硬盘</span>
          <cloud-disk ref="clouddisk" v-if="activeName == 'clouddisk'" :instanceId="instanceId" :detail-id="detailId" :vendorId="detailData.vendorId"></cloud-disk>
        </el-tab-pane>
      </el-tabs>
    </el-tabs>
  </el-card>
</template>

<script>
import overview from './vm_overview.vue'
import cpu from './vm_cpu.vue'
import mem from './vm_memory.vue'
import cloudDisk from './vm_cloud_disk.vue'
import net from './vm_net.vue'
// import fileSys from './vmDetail/fileSys.vue'
export default {
  components: {
    overview,
    cpu,
    mem,
    cloudDisk,
    net
  },
  props: {
    detail: {
      type: Object
    },
    detailId: {
      type: Number
    },
    identifier: {
      type: String
    },
    detailName: {
      type: String
    },
    hostName: {
      type: String
    },
    biosUuid: {
      type: String
    },
    isShow: {
      type: Boolean,
      default: true
    },
    detailData: {
      type: Object
    },
    instanceId: {
      type: Number
    }
  },
  data() {
    return {
      activeName: 'overview'
    }
  },
  methods: {},
  created() {},
  mounted() {}
}
</script>
<style scoped></style>
