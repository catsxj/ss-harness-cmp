<template>
  <basic-form ref="form" :model="itemData" :disabled="isPreview">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item label="备份路径:" validate="required" required-message="请填写备份路径" prop="source" :disabledValidate="isTemplate">
          <el-input v-model="itemData.source"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          source: ''
        }
      }
    }
  },
  data() {
    return {
      hideServer: false
    }
  }
}
</script>
<style></style>
