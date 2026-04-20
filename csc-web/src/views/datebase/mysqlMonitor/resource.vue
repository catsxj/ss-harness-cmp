<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker class="w-full" v-model="dateValue" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间"> </el-date-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      dateValue: '',
      timeList: []
    }
  },
  created() {
    // this.getList()
  },
  methods: {}
}
</script>
<style scoped>
.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
