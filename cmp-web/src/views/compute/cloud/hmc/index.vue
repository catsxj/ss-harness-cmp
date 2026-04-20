<template>
  <el-card class="wrapper">
    <div slot="header" class="clearfix">
      <div class="detail-header">
        <span class="detail-back" @click="goBack"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ $route.query.vendorName }}</span>
      </div>
    </div>
    <el-tabs ref="MonitorTab" @tab-click="handleClick" v-model="activeName" type="border-card">
      <el-tab-pane name="node" label="主机">
        <node v-if="activeName == 'node'"></node>
      </el-tab-pane>
      <el-tab-pane name="vios" label="VIOS">
        <vios v-if="activeName == 'vios'"></vios>
      </el-tab-pane>
      <el-tab-pane name="aixlinux" label="逻辑分区">
        <aix-linux v-if="activeName == 'aixlinux'"></aix-linux>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import node from './host.vue'
import vios from './vios.vue'
import aixLinux from './aix_linux.vue'
export default {
  components: {
    node,
    vios,
    aixLinux
  },
  data() {
    return {
      activeName: 'node'
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
