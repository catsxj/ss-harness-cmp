<template>
  <el-row class="count-card">
    <el-col :span="6">
      <div class="card-label">云主机(台)</div>
      <div class="card-count">{{item.serverNum}}</div>
    </el-col>
    <el-col :span="6">
      <div class="card-label">CPU(核)</div>
      <div class="card-count">{{item.cpu}}</div>
    </el-col>
    <el-col :span="6" class="text-center">
      <div class="text-left inline-block">
        <div class="card-label">内存(GB)</div>
        <div class="card-count">{{item.mem}}</div>
      </div>
    </el-col>
    <el-col :span="6" class="text-right">
      <div class="text-left inline-block">
        <div class="card-label">磁盘(TB)</div>
        <div class="card-count">{{item.disk}}</div>
      </div>
    </el-col>
  </el-row>
</template>
<script>
export default {
  props: {
    item: {},
    used: {
      type: Number,
      default: 50
    },
    total: {
      type: Number,
      default: 100
    },
    unit: {
      type: String
    }
  },
  setup(props) {
  }
}
</script>
<style lang="scss" scoped>
.count-card {
  // background: rgba(0, 11, 94, 0);
  // box-shadow: 0px 0px 3px 0px rgba(0, 137, 255, 0.6);
  // opacity: 0.68;
  padding: 20px;
  margin-bottom: 10px;
  .text-center {
    text-align: center;
  }
  .text-right {
    text-align: right;
  }
  .text-left {
    text-align: left;
  }
  .inline-block {
    display: inline-block;
  }
  .card-label {
    font-size: 16px;
    color: #fff;
    font-weight: 400;
  }
  .card-count {
    color: #fff;
    margin-top: 20px;
    font-size: 24px;
    font-weight: 400;
  }
}
</style>
