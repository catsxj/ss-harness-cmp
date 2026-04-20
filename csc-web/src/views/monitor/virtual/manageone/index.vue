<template>
  <div>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview">
        <span slot="label">资源总览</span>
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :detail-data="detailData" :is-show="isShow"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu">
        <span slot="label">CPU</span>
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem">
        <span slot="label">内存</span>
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId"></mem>
      </el-tab-pane>
      <el-tab-pane name="net">
        <span slot="label">网络</span>
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId"></net>
      </el-tab-pane>
      <el-tab-pane name="clouddisk">
        <span slot="label">云硬盘</span>
        <cloud-disk ref="clouddisk" v-if="activeName == 'clouddisk'" :detail-id="detailId"></cloud-disk>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import overview from './vm_overview.vue'
import cpu from './vm_cpu.vue'
import mem from './vm_memory.vue'
import cloudDisk from './vm_cloud_disk.vue'
import net from './vm_net.vue'
export default {
  components: {
    overview,
    cpu,
    mem,
    cloudDisk,
    net
  },
  props: {
    detailData: {
      type: Object
    },
    detailId: {
      type: String
    },
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activeName: 'overview'
    }
  },
  methods: {
    goBack() {
      this.$emit('goBack')
    }
  },
  created() {}
}
</script>

<style></style>
