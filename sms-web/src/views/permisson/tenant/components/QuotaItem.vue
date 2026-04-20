/** * Created by HaijunZhang on 2019/8/30. */
<template>
  <div class="m-b">
    <basic-table ref="table" :data="quotaData">
      <el-table-column show-overflow-tooltip label="配额属性" prop="name"> </el-table-column>
      <el-table-column label="配额值">
        <template v-slot="scope">
          <el-input-number v-model="scope.row.quota" :min="scope.row.minQuota" :max="scope.row.maxQuota"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="配额范围">
        <template v-slot="scope">
          <span>{{ scope.row.minQuota }} - {{ scope.row.maxQuota }}</span>
        </template>
      </el-table-column>
      <el-table-column show-overflow-tooltip label="单位" prop="unit"> </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
  </div>
</template>

<script>
export default {
  props: {
    quotaData: {
      type: Array
    }
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    getPostData() {
      return this.quotaData
    }
  }
}
</script>

<style scoped></style>
