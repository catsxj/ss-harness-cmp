<template>
  <el-tabs ref="thresholdTab" v-model="activeName" type="border-card">
    <el-tab-pane name="Resource" label="云主机资源回收">
      <Resource ref="Resource" v-if="activeName == 'Resource'"></Resource>
    </el-tab-pane>
    <el-tab-pane name="Host" label="云主机整机回收">
      <Host ref="Host" v-if="activeName == 'Host'"></Host>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Resource from './recycleResource.vue'
import Host from './recycleHost.vue'

export default {
  components: {
    Resource,
    Host
  },
  data() {
    return {
      activeName: 'Resource'
    }
  },
  created() {},
  methods: {
    handleClick() {}
  }
}
</script>
