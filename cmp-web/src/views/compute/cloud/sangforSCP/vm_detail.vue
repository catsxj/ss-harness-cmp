<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源概览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :is-show="isShow" :detailUuid="detailUuid"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :detailUuid="detailUuid"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :detailUuid="detailUuid"></mem>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId" :detailUuid="detailUuid"></net>
      </el-tab-pane>
      <el-tab-pane name="disk" label="磁盘">
        <disk ref="disk" v-if="activeName == 'disk'" :detail-id="detailId" :detailUuid="detailUuid"></disk>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import overview from './vmDetail/overview.vue'
import cpu from './vmDetail/cpu.vue'
import mem from './vmDetail/mem.vue'
import disk from './vmDetail/disk.vue'
import net from './vmDetail/net.vue'
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
    isShow: {
      type: Boolean,
      default: true
    },
    detailUuid: {
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
