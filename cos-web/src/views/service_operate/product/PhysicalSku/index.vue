<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane name="server" label="服务器规格">
        <Server v-if="activeName === 'server'" />
      </el-tab-pane>
      <el-tab-pane name="cpu" label="CPU规格">
        <Cpu v-if="activeName === 'cpu'" />
      </el-tab-pane>
      <el-tab-pane name="memory" label="内存规格">
        <Memory v-if="activeName === 'memory'" />
      </el-tab-pane>
      <el-tab-pane name="disk" label="硬盘规格">
        <Disk v-if="activeName === 'disk'" />
      </el-tab-pane>
      <el-tab-pane name="parts" label="配件规格">
        <Parts v-if="activeName === 'parts'" />
      </el-tab-pane>
      <el-tab-pane name="brand" label="品牌">
        <Brand v-if="activeName === 'brand'" />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import Server from './Server.vue'
import Cpu from './Cpu.vue'
import Memory from './Memory.vue'
import Disk from './Disk.vue'
import Parts from './Parts.vue'
import Brand from './Brand.vue'
export default {
  components: { Server, Cpu, Memory, Disk, Parts, Brand },
  data() {
    return {
      activeName: 'server'
    }
  },
  methods: {}
}
</script>
