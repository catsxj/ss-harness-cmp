<template>
  <div>
    <el-row type="flex">
      <el-col :span="24" class="row_margin box" v-for="(item, index) in list" :key="index">
        <el-col :span="20" class="box_left">
          <div style="margin-top: 15px">{{ item.name }}</div>
          <div class="m-b-md" style="font-size: 15px; margin-top: 10px">{{ detail[item.value] }}{{ item.unit }}</div>
        </el-col>
        <div style="clear: both"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/* global $ */
export default {
  props: {
    detail: {
      type: Object,
      default: function () {
        return {}
      }
    },
    list: {
      type: Array
    }
  },
  data() {
    return {}
  },
  methods: {},
  created() {}
}
</script>

<style scoped lang="scss">
.box {
  position: relative;
  background: #5a94ff;
}
.box_left {
  color: #fff;
  font-size: 16px;
  padding-left: 10px;
  font-weight: bold;
}
.box_unit {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}
.row_margin {
  margin-left: 10px;
  margin-right: 10px;
  text-align: center;
}
</style>
