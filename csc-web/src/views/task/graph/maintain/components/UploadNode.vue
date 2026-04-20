<template>
  <basic-form ref="form" :model="itemData" :disabled="isPreview">
    <el-row :gutter="10">
      <el-col :span="24">
        <basic-form-item label="目标路径：" validate="required" required-message="请输入目标路径" prop="target" :disabledValidate="isTemplate">
          <el-input v-model="itemData.target"></el-input>
        </basic-form-item>
      </el-col>
    </el-row>
    <select-file-item :itemData="itemData"></select-file-item>
  </basic-form>
</template>
<script>
import node from '../../mixins/index'
import show from '../../mixins/show'
import SelectFileItem from '../SelectFile.vue'

export default {
  mixins: [node, show],
  props: {
    itemData: {
      type: Object,
      default: function () {
        return {
          target: '',
          source: ''
        }
      }
    }
  },
  components: {
    SelectFileItem
  },
  data() {
    return {
      hideServer: false
    }
  },
  methods: {
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.itemData.source) return this.$message.error('请选择分发文件')
          data = this.itemData
        }
      })
      return data
    }
  }
}
</script>
<style></style>
