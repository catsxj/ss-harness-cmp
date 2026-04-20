<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源概览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :is-show="isShow" :instance-id="instanceId"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :instance-id="instanceId"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :instance-id="instanceId"></mem>
      </el-tab-pane>
      <el-tab-pane name="net" label="网络">
        <net ref="net" v-if="activeName == 'net'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :instance-id="instanceId"></net>
      </el-tab-pane>
      <el-tab-pane name="disk" label="磁盘">
        <disk ref="disk" v-if="activeName == 'disk'" :detail-id="detailId" :identifier="identifier" :host-name="hostName" :instance-id="instanceId"></disk>
      </el-tab-pane>
      <!-- <el-tab-pane name="fileSys" label="文件系统">
        <fileSys ref="fileSys" v-if="activeName=='fileSys'" :detail-id="detailId" :uuid="biosUuid"></fileSys>
      </el-tab-pane> -->
    </el-tabs>
  </el-card>
</template>

<script>
import overview from '../zstack/vmDetail/overview.vue'
import cpu from '../zstack/vmDetail/cpu.vue'
import disk from '../zstack/vmDetail/disk.vue'
import mem from '../zstack/vmDetail/mem.vue'
import net from '../zstack/vmDetail/net.vue'
// import fileSys from '../vmDetail/fileSys.vue'
export default {
  components: {
    overview,
    cpu,
    disk,
    mem,
    net
    // ,fileSys
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
