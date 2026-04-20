<template>
  <el-row>
    <el-col :span="12">
      <liquid-fill-charts :id="title" :data="item" width="100%" height="260px"></liquid-fill-charts>
    </el-col>
    <el-col :span="12">
      <el-row class="count-container">
        <el-col :span="24" class="liguid-box">
          <span class="liguid-box-name">总量：</span>
          <span class="liguid-box-value">{{ item.total }} {{ item.unit }}</span>
        </el-col>
        <el-col :span="24" class="liguid-box">
          <span class="liguid-box-name">已使用：</span>
          <span class="liguid-box-value">{{ item.used }} {{ item.unit }}</span>
        </el-col>
        <el-col :span="24" class="liguid-box">
          <span class="liguid-box-name">未使用：</span>
          <span class="liguid-box-value">{{ item.free }} {{ item.unit }}</span>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
export default {
  props: {
    title: {
      type: String
    },
    item: {
      type: Object
    }
  }
}
</script>
<style scoped lang="scss">
.count-container {
  margin-top: 70px;
}
.liguid-box {
  margin-top: 15px;
  font-size: 12px;
  color: #656565;
  display: flex;
  .liguid-box-name {
    display: inline-block;
    text-align: left;
    width: 50px;
  }
  .liguid-box-value {
    display: inline-block;
    text-align: right;
    width: calc(100% - 55px);
  }
}
</style>
