<template>
  <div>
    <el-tabs type="border-card" v-model="activeName" v-if="radio == 'old'">
      <el-tab-pane label="主机" lazy name="server">
        <Host v-if="activeName === 'server'" />
      </el-tab-pane>
      <el-tab-pane label="服务" lazy name="service">
        <Service v-if="activeName === 'service'" />
      </el-tab-pane>
      <!-- <el-tab-pane label="插件" lazy name="plugin">
        <Plug v-if="activeName === 'plugin'"></Plug>
      </el-tab-pane>
      <el-tab-pane label="组件" name="component" lazy>
        <Components v-if="activeName === 'component'" />
      </el-tab-pane> -->
      <el-tab-pane label="拓扑" name="topology" lazy>
        <Next v-if="activeName === 'topology'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Host from './components/Host.vue'
import Service from './components/Service.vue'
// import Plug from './components/Plug.vue'
// import Components from './components/Component.vue'
import Next from './components/next.vue'

const activeName = ref('server')
const radio = ref('old')
</script>

<style scoped></style>
