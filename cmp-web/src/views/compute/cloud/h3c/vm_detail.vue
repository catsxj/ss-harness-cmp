<template>
  <el-card>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview" label="资源概览">
        <overview ref="overview" v-if="activeName == 'overview'" :detail-id="detailId" :identifier="identifier" :instanceId="instanceId"></overview>
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU">
        <cpu ref="cpu" v-if="activeName == 'cpu'" :detail-id="detailId" :identifier="identifier" :instanceId="instanceId"></cpu>
      </el-tab-pane>
      <el-tab-pane name="mem" label="内存">
        <mem ref="mem" v-if="activeName == 'mem'" :detail-id="detailId" :identifier="identifier" :instanceId="instanceId"></mem>
      </el-tab-pane>
      <el-tab-pane name="disk" label="磁盘">
        <disk ref="disk" v-if="activeName == 'disk'" :detail-id="detailId" :identifier="identifier" :instanceId="instanceId"></disk>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import overview from './vmDetail/overview.vue'
import cpu from './vmDetail/cpu.vue'
import disk from './vmDetail/disk.vue'
import mem from './vmDetail/mem.vue'
export default {
  components: {
    overview,
    cpu,
    disk,
    mem
  },
  props: {
    detailId: {
      type: [Number, String]
    },
    instanceId: {
      type: [Number, String]
    },
    identifier: {
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
