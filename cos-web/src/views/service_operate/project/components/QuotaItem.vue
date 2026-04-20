/** * Created by HaijunZhang on 2019/8/30. */
<template>
  <basic-form :model="formData" ref="quotaData" label-width="0px" class="m-b">
    <basic-table ref="table" :data="formData.quotaData">
      <el-table-column show-overflow-tooltip label="配额属性" prop="name"> </el-table-column>
      <el-table-column label="配额值">
        <template v-slot="scope">
          <basic-form-item :prop="`quotaData.${scope.$index}.quota`" validate="required" class="m-b-none">
            <el-input-number v-model="scope.row.quota" :min="scope.row.minQuota" :max="scope.row.maxQuota"></el-input-number>
          </basic-form-item>
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
  </basic-form>
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
  computed: {
    formData() {
      return {
        quotaData: this.quotaData
      }
    }
  },
  created() {},
  methods: {
    getPostData() {
      let data = false
      this.$refs.quotaData.validate((valid) => {
        if (valid) {
          // 生成参数
          data = this.formData.quotaData
        }
      })
      return data
    }
  }
}
</script>

<style scoped></style>
