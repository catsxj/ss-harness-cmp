* Created by Zhang Haijun on 2017/11/27. */
<template>
  <el-row>
    <el-col :span="24">
      <basic-table ref="serverTable" :data="data" highlight-current-row @current-change="handleCurrentChange">
        <el-table-column label="主机名称" prop="rawName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="IP" prop="host"> </el-table-column>
        <el-table-column label="端口号" prop="port"> </el-table-column>
        <el-table-column label="用户名" prop="user"> </el-table-column>
        <el-table-column label="耗时（s）" prop="cost"> </el-table-column>
        <div slot="pagination"></div>
      </basic-table>
    </el-col>
    <el-col :span="24">
      <OutputResult :code="code" :output="output"></OutputResult>
    </el-col>
  </el-row>
</template>
<script>
import OutputResult from './OutputResult.vue'
export default {
  components: { OutputResult },
  props: {
    data: {
      type: Array
    },
    code: {
      type: String
    }
  },
  data() {
    return {
      output: {}
    }
  },
  created() {},
  mounted() {
    this.$refs.serverTable.setCurrentRow(this.data[0])
  },
  methods: {
    handleCurrentChange(value) {
      if (!value) return
      this.output = value
    }
  }
}
</script>
<style scoped>
pre {
  margin-top: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 13px;
  word-break: break-all;
  word-wrap: break-word;
  background: #1c2026;
  color: #fff;
  padding: 10px 15px;
  height: 340px;
  overflow: auto;
  width: 97%;
}
</style>
