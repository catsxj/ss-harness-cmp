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
      <el-tab-pane name="dashboard" label="概览">
        <dashboard ref="Dashboard" v-if="activeName == 'dashboard'"></dashboard>
      </el-tab-pane>
      <el-tab-pane name="host" label="宿主机">
        <host ref="monitorHost" v-if="activeName == 'host'"></host>
      </el-tab-pane>
      <el-tab-pane name="vm" label="云主机">
        <vm ref="monitorVm" v-if="activeName == 'vm'"></vm>
      </el-tab-pane>
      <el-tab-pane name="disk" label="云硬盘监控">
        <disk ref="disk" v-if="activeName === 'disk'"></disk>
      </el-tab-pane>
      <el-tab-pane name="elasticIp" label="弹性IP">
        <el-row :gutter="5">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>IP</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>出/入网带宽</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>出/入网流量</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane name="mysqlMonitor" label="数据库Mysql监控">
        <el-row :gutter="5">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>名称</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>IP</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>网络输入吞吐量</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="5">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>网络输出吞吐量</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>数据库总连接数</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>当前活跃连接数</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane name="redisMonitor" label="中间件Redis监控">
        <el-row :gutter="5">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>名称</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>IP</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>活跃的客户端数量</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="5">
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>客户端最长输出列表</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>缓存命中率</span>
              </div>
              <div>
                <bar-reverse-charts height="300px" width="100%" id="resVm" :data="null" unit="%" :setting="{ color: 'rgba(24, 144, 255, 0.8)' }"> </bar-reverse-charts>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import vm from './components/vm/index.vue'
import disk from './components/disk/index.vue'
import host from './components/host/index.vue'
import dashboard from 'views/components/dashboard.vue'
export default {
  components: {
    dashboard,
    vm,
    host,
    disk
  },
  data() {
    return {
      activeName: 'dashboard'
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
