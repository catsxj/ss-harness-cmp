<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源概览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :detailUuid="detailUuid" :detailVendorId="detailVendorId" :is-show="isShow"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :detailUuid="detailUuid" :detailVendorId="detailVendorId"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :detailUuid="detailUuid" :detailVendorId="detailVendorId"></mem>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId" :detailUuid="detailUuid" :detailVendorId="detailVendorId"></net>
      </el-tab-pane>
      <el-tab-pane name="disk" label="磁盘">
        <disk ref="disk" v-if="activeName == 'disk'" :detail-id="detailId" :detailUuid="detailUuid" :detailVendorId="detailVendorId"></disk>
      </el-tab-pane>
      <el-tab-pane name="fileSys" label="文件系统">
        <fileSys ref="fileSys" v-if="activeName == 'fileSys'" :detail-id="detailId" :detailUuid="detailUuid" :detailVendorId="detailVendorId"></fileSys>
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
import fileSys from './vmDetail/fileSys.vue'
export default {
  components: {
    overview,
    cpu,
    disk,
    mem,
    net,
    fileSys
  },
  props: {
    detailId: {
      type: Number
    },
    detailUuid: {
      type: String
    },
    detailVendorId: {
      type: Number
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
  methods: {},
  created() {},
  mounted() {}
}
</script>
<style scoped></style>
