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
      <el-tab-pane name="dashboard" label="概览" v-if="false">
        <dashboard ref="easystackDashboard" v-if="activeName == 'dashboard'"></dashboard>
      </el-tab-pane>
      <el-tab-pane name="host" label="宿主机" v-if="false">
        <host ref="monitorHost" v-if="activeName == 'host'"></host>
      </el-tab-pane>
      <el-tab-pane name="vm" label="云主机">
        <vm ref="monitorVm" v-if="activeName == 'vm'"></vm>
      </el-tab-pane>
      <el-tab-pane name="service" label="服务" v-if="false">
        <service ref="service" v-if="activeName == 'service'"></service>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import host from './host.vue'
import dashboard from 'views/components/dashboard.vue'
import vm from './vm.vue'
import service from './service'
export default {
  components: {
    host,
    dashboard,
    vm,
    service
  },
  data() {
    return {
      activeName: 'vm'
    }
  },
  methods: {
    handleClick() {},
    goBack() {
      history.go(-1)
    }
  },
  created() {
    const monitorVm = sessionStorage.getItem('monitorVm')
    if (monitorVm === '1') {
      this.activeName = 'vm'
      sessionStorage.removeItem('monitorVm')
    }
  },
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
