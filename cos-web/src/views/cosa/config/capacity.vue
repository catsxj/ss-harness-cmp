<template>
  <el-tabs ref="thresholdTab" v-model="activeName" type="border-card">
    <el-tab-pane name="Vm" label="云主机扩容">
      <Vm ref="Vm" v-if="activeName == 'Vm'"></Vm>
    </el-tab-pane>
    <el-tab-pane name="Host" label="宿主机扩容">
      <Host ref="Host" v-if="activeName == 'Host'"></Host>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Vm from './capacityVm.vue'
import Host from './capacityHost.vue'

export default {
  components: {
    Vm,
    Host
  },
  data() {
    return {
      activeName: 'Vm'
    }
  },
  created() {},
  methods: {
    handleClick() {}
  }
}
</script>
