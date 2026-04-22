<template>
  <basic-form ref="form" :model="itemData">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item label="恢复路径:" validate="required" required-message="请填写恢复路径"
                       prop="target">
          <el-input v-model="itemData.target" :disabled="isPreview"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
  </basic-form>
</template>
<script>
import node from '../../mixins/index';
import show from '../../mixins/show';

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          target: ''
        }
      }
    }
  }
}
</script>
<style>
</style>
