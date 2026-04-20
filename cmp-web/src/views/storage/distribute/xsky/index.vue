<template>
  <el-card class="wrapper">
    <div slot="header" class="clearfix">
      <div class="detail-header">
        <span class="detail-back" @click="goBack"><i class="iconfont icon-left-arrow"></i> 返回</span>
        <span class="line"></span>
        <span class="title">{{ $route.query.vendorName }}</span>
      </div>
    </div>
    <el-tabs ref="resourceMonitorTab" @tab-click="handleClick" v-model="activeName" type="border-card">
      <el-tab-pane name="host" label="服务器">
        <host v-if="activeName === 'host'"></host>
      </el-tab-pane>
      <el-tab-pane name="pool" label="存储池">
        <pool-item v-if="activeName === 'pool'"></pool-item>
      </el-tab-pane>
      <el-tab-pane name="objectUser" label="对象用户">
        <object-user v-if="activeName === 'objectUser'"></object-user>
      </el-tab-pane>
      <el-tab-pane name="ObjectRouter" label="对象路由">
        <object-router v-if="activeName === 'ObjectRouter'"></object-router>
      </el-tab-pane>
      <el-tab-pane name="bucket" label="存储桶">
        <bucket-item v-if="activeName === 'bucket'"> </bucket-item>
      </el-tab-pane>
      <el-tab-pane name="osd" label="硬盘">
        <osd-item v-if="activeName === 'osd'"></osd-item>
      </el-tab-pane>
      <el-tab-pane name="disk" label="缓存">
        <disk-item v-if="activeName === 'disk'"></disk-item>
      </el-tab-pane>
      <el-tab-pane name="volume" label="块存储卷">
        <volume-item v-if="activeName == 'volume'"></volume-item>
      </el-tab-pane>
      <el-tab-pane name="filesys" label="文件系统">
        <file-sys v-if="activeName == 'filesys'"></file-sys>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import host from './host.vue'
import PoolItem from './pool.vue'
import ObjectUser from './objectUser.vue'
import ObjectRouter from './components/objectRouter.vue'
import BucketItem from './components/bucket.vue'
import OsdItem from './components/osd.vue'
import DiskItem from './components/disk.vue'
import VolumeItem from './components/volume.vue'
import fileSys from './components/file.vue'
export default {
  components: {
    host,
    PoolItem,
    ObjectUser,
    ObjectRouter,
    BucketItem,
    OsdItem,
    DiskItem,
    VolumeItem,
    fileSys
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
