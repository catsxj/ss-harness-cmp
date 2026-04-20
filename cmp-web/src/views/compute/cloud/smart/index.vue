<template>
  <el-card class="wrapper">
    <div slot="header" class="clearfix">
      <div class="detail-header">
        <span class="detail-back" @click="goBack"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ $route.query.vendorName }}</span>
      </div>
    </div>
    <el-tabs ref="resourceMonitorTab" type="card" @tab-click="handleClick" v-model="activeName">
      <el-tab-pane name="host" label="宿主机">
        <host v-if="activeName == 'host'" ref="monitorHost"></host>
      </el-tab-pane>
      <el-tab-pane name="vm" label="云主机">
        <vm v-if="activeName == 'vm'" ref="monitorVm"></vm>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import host from './host.vue'
import vm from './vm.vue'
export default {
  components: {
    host,
    vm
  },
  data() {
    return {
      activeName: 'host'
    }
  },
  methods: {
    handleClick() {},
    goBack() {
      history.go(-1)
    }
  },
  created() {},
  mounted() {}
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
</style>
