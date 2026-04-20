<template>
  <div>
    <el-tabs ref="tab" tab-position="top" type="border-card" value="1" @tab-click="tabClick()">
      <el-tab-pane label="资源监控" name="1">
        <resource ref="resource"></resource>
      </el-tab-pane>
      <el-tab-pane label="引擎监控" name="2">
        <engine ref="engine"></engine>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import resource from './resource.vue'
import engine from './engine.vue'

export default {
  props: {
    detail: {
      type: Object
    }
  },
  components: {
    resource,
    engine
  },
  data() {
    return {
      tabPosition: 'top'
    }
  },
  methods: {
    tabClick() {
      // switch (this.$refs.tab.currentName) {
      //   case '1':
      //     this.$refs.resource.handleSearch()
      //     break
      //   case '2':
      //     this.$refs.engine.handleSearch()
      //     break
      // }
    }
  },
  created() {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
