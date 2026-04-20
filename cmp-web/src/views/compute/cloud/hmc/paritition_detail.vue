<template>
  <el-card>
    <el-tabs v-model="detailActiveName" class="m-t-n-md">
      <el-tab-pane name="overview" label="概览">
        <overview ref="overview" v-if="detailActiveName == 'overview'" :detail-uuid="detailUuid"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="处理器">
        <cpu ref="cpu" v-if="detailActiveName == 'cpu'" :detail-uuid="detailUuid"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="detailActiveName == 'mem'" :detail-uuid="detailUuid"></mem>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="detailActiveName == 'net'" :detail-uuid="detailUuid"></net>
      </el-tab-pane>
      <el-tab-pane name="storage" label="存储">
        <storage ref="storage" v-if="detailActiveName == 'storage'" :detail-uuid="detailUuid"></storage>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script>
import overview from './vios_overview.vue'
import cpu from './vios_cpu.vue'
import mem from './vios_mem.vue'
import storage from './vios_storage.vue'
import net from './vios_net.vue'
export default {
  components: {
    overview,
    cpu,
    mem,
    storage,
    net
  },
  props: {
    detailUuid: {
      type: String
    }
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
<style scoped></style>
