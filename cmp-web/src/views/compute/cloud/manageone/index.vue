<template>
  <el-card class="wrapper">
    <div slot="header" class="clearfix">
      <div class="detail-header">
        <span class="detail-back" @click="goBack"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ $route.query.vendorName }}</span>
      </div>
    </div>
    <el-tabs ref="resourceMonitorTab" @tab-click="handleClick" v-model="activeName" type="card">
      <!-- <el-tab-pane name="dashboard" label="概览">
        <dashboard ref="Dashboard" v-if="activeName == 'dashboard'"></dashboard>
      </el-tab-pane> -->
      <el-tab-pane name="host" label="宿主机">
        <host ref="monitorHost" v-if="activeName == 'host'"></host>
      </el-tab-pane>
      <el-tab-pane name="vm" label="云主机">
        <vm ref="monitorVm" v-if="activeName == 'vm'"></vm>
      </el-tab-pane>
      <el-tab-pane name="pool" label="资源池" v-if="false">
        <resource-pool ref="monitorPool" v-if="activeName == 'pool'"></resource-pool>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import vm from './vm.vue'
import host from './host'
import resourcePool from './resource_pool'
// import dashboard from 'views/components/dashboard.vue'
export default {
  components: {
    // dashboard,
    vm,
    host,
    resourcePool
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
