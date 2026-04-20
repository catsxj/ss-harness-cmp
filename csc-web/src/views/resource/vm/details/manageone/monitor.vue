<template>
  <el-tabs v-model="detailActiveName" class="m-t-n-md">
    <el-tab-pane name="overview">
      <span slot="label">资源总览</span>
      <overview ref="overview" v-if="detailActiveName == 'overview'" :detail-id="detail.id" :detail-data="detail" :is-show="false"></overview>
    </el-tab-pane>
    <el-tab-pane name="cpu">
      <span slot="label">CPU</span>
      <cpu ref="cpu" v-if="detailActiveName == 'cpu'" :detail-id="detail.id"></cpu>
    </el-tab-pane>
    <el-tab-pane name="mem">
      <span slot="label">内存</span>
      <mem ref="mem" v-if="detailActiveName == 'mem'" :detail-id="detail.id"></mem>
    </el-tab-pane>
    <el-tab-pane name="net">
      <span slot="label">网络</span>
      <net ref="net" v-if="detailActiveName == 'net'" :detail-id="detail.id"></net>
    </el-tab-pane>
    <el-tab-pane name="clouddisk">
      <span slot="label">云硬盘</span>
      <cloud-disk ref="clouddisk" v-if="detailActiveName == 'clouddisk'" :detail-id="detail.id"></cloud-disk>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import overview from '@/views/monitor/compute/cloud/FusionCloud/vm_overview.vue'
import cpu from '@/views/monitor/compute/cloud/FusionCloud/vm_cpu.vue'
import mem from '@/views/monitor/compute/cloud/FusionCloud/vm_memory.vue'
import cloudDisk from '@/views/monitor/compute/cloud/FusionCloud/vm_cloud_disk.vue'
import net from '@/views/monitor/compute/cloud/FusionCloud/vm_net.vue'
export default {
  props: {
    detailFlag: {
      type: Boolean
    },
    detail: {
      type: Object
    }
  },
  components: {
    overview,
    cpu,
    mem,
    cloudDisk,
    net
  },
  data() {
    return {
      detailActiveName: 'overview'
    }
  },
  methods: {},
  created() {}
}
</script>
