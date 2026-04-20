<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源总览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :detail-name="detailName" :uuid="uuid"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :detail-name="detailName" :uuid="uuid"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :detail-name="detailName" :uuid="uuid"></mem>
      </el-tab-pane>
      <el-tab-pane name="storage" label="磁盘">
        <storage ref="storage" v-if="activeName == 'storage'" :detail-id="detailId" :detail-name="detailName" :uuid="uuid"></storage>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId" :detail-name="detailName" :uuid="uuid"></net>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import overview from './hostDetail/overview.vue'
import cpu from './hostDetail/cpu.vue'
import mem from './hostDetail/mem.vue'
import storage from './hostDetail/storage.vue'
import net from './hostDetail/net.vue'
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
    detailName: {
      type: String
    },
    uuid: {
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
