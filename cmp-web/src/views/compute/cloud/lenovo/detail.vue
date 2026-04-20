<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源概览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :instance-id="instanceId"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :instance-id="instanceId"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :instance-id="instanceId"></mem>
      </el-tab-pane>
      <el-tab-pane name="disk" label="磁盘">
        <disk ref="disk" v-if="activeName == 'disk'" :detail-id="detailId" :instance-id="instanceId"></disk>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId" :instance-id="instanceId"></net>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import overview from './overview.vue'
import cpu from './cpu.vue'
import mem from './mem.vue'
import disk from './disk.vue'
import net from './net.vue'

export default {
  components: {
    overview,
    cpu,
    mem,
    disk,
    net
  },
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
      activeName: 'overview'
    }
  }
}
</script>
<style scoped></style>
