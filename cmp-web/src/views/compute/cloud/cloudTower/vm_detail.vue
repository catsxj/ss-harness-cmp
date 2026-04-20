<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源概览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :is-show="isShow" :instanceId="instanceId"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :instanceId="instanceId"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :instanceId="instanceId"></mem>
      </el-tab-pane>
      <el-tab-pane name="storage" label="磁盘">
        <storage ref="storage" v-if="activeName == 'storage'" :detail-id="detailId" :detail-name="detailName" :instanceId="instanceId"></storage>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId" :detail-name="detailName" :instanceId="instanceId"></net>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import overview from './vmDetail/overview.vue'
import cpu from './vmDetail/cpu.vue'
import mem from './vmDetail/mem.vue'
import storage from './vmDetail/storage.vue'
import net from './vmDetail/net.vue'
export default {
  components: {
    overview,
    cpu,
    mem,
    storage,
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
