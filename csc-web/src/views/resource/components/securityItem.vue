<template>
  <basic-form ref="addData" :model="addData" :status-icon="true" label-width="80px">
    <vendor :add-data="addData" vendorType="FUSIONSPHERE"></vendor>
    <basic-form-item label="名称" prop="name" validate="required" required-message="请输入名称">
      <el-input v-model="addData.name"></el-input>
    </basic-form-item>
    <basic-form-item label="描述" prop="remark">
      <el-input type="textarea" v-model="addData.remark"></el-input>
    </basic-form-item>
  </basic-form>
</template>

<script>
import vendor from '@/components/privatePool/index.vue'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  components: { vendor },
  data() {
    return {}
  },
  methods: {
    getPostData() {
      let addData = ''
      this.$refs.addData.validate(valid => {
        if (valid) {
          addData = this.addData
        }
      })
      return addData
    }
  }
}
</script>

<style></style>
