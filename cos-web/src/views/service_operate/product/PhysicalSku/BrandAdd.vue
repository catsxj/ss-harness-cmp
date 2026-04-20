<template>
  <el-dialog :title="addData.data.id ? '编辑品牌' : '新增品牌'" :close-on-click-modal="false" :visible.sync="addData.visible" width="800px">
    <basic-form :model="addData.data" ref="addData">
      <basic-form-item label="品牌名称：" prop="name" validate="required">
        <el-input v-model="addData.data.name"></el-input>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.visible = false">取消</el-button>
      <el-button type="primary" @click.native="handleSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createBrand, modifyBrand } from 'services/services/physicalSpec.js'
export default {
  props: {
    addData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    handleSubmit() {
      this.$refs.addData.validate(async (valid) => {
        if (valid) {
          const http = this.addData.data.id ? modifyBrand : createBrand
          this.loading = true
          const data = await http(this.addData.data).finally(() => (this.loading = false))
          if (!data.success) return
          this.$message.success(data.message)
          this.addData.visible = false
          this.$emit('success')
        }
      })
    }
  }
}
</script>
