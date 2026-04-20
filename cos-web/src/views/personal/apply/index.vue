<template>
  <el-card>
    <el-tabs ref="tab" value="unapplyRef" @tab-click="tabClick">
      <el-tab-pane name="unapplyRef">
        <span slot="label" class="tab-label-padding">待审批</span>
        <unapply ref="unapplyRef"></unapply>
      </el-tab-pane>
      <el-tab-pane name="mineRef" lazy>
        <span slot="label" class="tab-label-padding">已发起</span>
        <mine ref="mineRef"></mine>
      </el-tab-pane>
      <el-tab-pane name="appliedRef" lazy>
        <span slot="label" class="tab-label-padding">已审批</span>
        <applied ref="appliedRef"></applied>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import mine from './mine/list.vue'
import unapply from './unapply/list.vue'
import applied from './applied/list.vue'

export default {
  components: {
    mine,
    unapply,
    applied
  },
  setup(props, context) {
    function tabClick(tab) {
      const node = context.refs[tab.name]
      node && node.getList()
    }
    return {
      tabClick
    }
  }
}
</script>

<style></style>
