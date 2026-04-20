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
      <el-tab-pane name="equipment" label="存储设备">
        <equipment v-if="activeName == 'equipment'" :project-name="projectName"></equipment>
      </el-tab-pane>
      <el-tab-pane name="disk" label="硬盘">
        <disk v-if="activeName == 'disk'" :project-name="projectName"></disk>
      </el-tab-pane>
      <el-tab-pane name="volume" label="存储卷">
        <volume v-if="activeName == 'volume'" :project-name="projectName"></volume>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import equipment from './equipment.vue'
import disk from './disk.vue'
import volume from './volume.vue'
export default {
  components: {
    equipment,
    disk,
    volume
  },
  data() {
    return {
      activeName: 'equipment',
      projectName: this.$route.query.projectName
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
