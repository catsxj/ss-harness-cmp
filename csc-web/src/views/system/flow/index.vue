<template>
  <div>
    <el-tabs ref="tab" tab-position="top" type="border-card" value="1" @tab-click="tabClick()">
      <el-tab-pane label="流程定义" name="1">
        <list ref="list"></list>
      </el-tab-pane>
      <el-tab-pane label="流程绑定" name="2">
        <bind ref="bind"></bind>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import list from './list'
import bind from './bindFlow'

export default {
  components: {
    list,
    bind
  },
  props: {
    platformObject: {
      type: Object,
      default: function () {
        return {
          openstackId: -1,
          operate: -1
        }
      }
    }
  },
  data() {
    return {
      tabPosition: 'top'
    }
  },
  methods: {
    tabClick() {
      switch (this.$refs.tab.currentName) {
        case '1':
          this.$refs.list.handleSearch()
          break
        case '2':
          this.$refs.bind.getList()
          break
      }
    }
  },
  mounted() {
    this.tabClick()
  },
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
