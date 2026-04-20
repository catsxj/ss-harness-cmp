<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源概览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :instanceId="instanceId" :identifier="identifier" :host-name="hostName" :is-show="isShow"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :instanceId="instanceId" :identifier="identifier" :host-name="hostName"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :instanceId="instanceId" :identifier="identifier" :host-name="hostName"></mem>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId" :instanceId="instanceId" :identifier="identifier" :host-name="hostName"></net>
      </el-tab-pane>
      <el-tab-pane name="disk" label="磁盘">
        <disk ref="disk" v-if="activeName == 'disk'" :detail-id="detailId" :instanceId="instanceId" :identifier="identifier" :host-name="hostName"></disk>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import overview from './vmDetail/overview.vue'
import cpu from './vmDetail/cpu.vue'
import disk from './vmDetail/disk.vue'
import mem from './vmDetail/mem.vue'
import net from './vmDetail/net.vue'
export default {
  components: {
    overview,
    cpu,
    disk,
    mem,
    net
  },
  props: {
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
    instanceId: {
      type: String
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
