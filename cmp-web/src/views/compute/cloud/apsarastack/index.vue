<template>
  <el-card class="wrapper">
    <div slot="header" class="clearfix">
      <div class="detail-header">
        <span class="detail-back" @click="$router.back()"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ $route.query.vendorName }}</span>
      </div>
    </div>
    <el-tabs type="card" value="vm">
      <el-tab-pane name="vm" label="云主机">
        <Vm />
      </el-tab-pane>
      <el-tab-pane name="host" label="宿主机">
        <Host />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<script>
import Vm from './vm.vue'
import Host from './host.vue'

export default {
  components: {
    Vm,
    Host
  },
  data() {
    return {}
  }
}
</script>
<style scoped>
.detail-header .detail-back {
  color: #46abf1;
  cursor: pointer;
}
.detail-header .line {
  position: relative;
  top: 4px;
  margin: 0 6px;
  height: 14px;
  width: 1px;
  display: inline-block;
  background-color: #b5b5b5;
}

.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
::v-deep .el-tabs {
  background: #fff;
}
</style>
