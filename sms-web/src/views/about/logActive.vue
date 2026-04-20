<template>
  <el-dialog title="证书激活" :visible.sync="activeObject.visible" width="40%" v-if="activeObject.visible">
    <basic-form ref="addData" :model="addData">
      <basic-form-item label="激活码：" prop="licenseMask" validate="required" maxlength="2048">
        <el-input type="textarea" v-model="addData.licenseMask" :rows="15"></el-input>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="activeObject.visible = false">取 消</el-button>
      <el-button type="primary" @click="ok()">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { installCaptcha } from 'services/system/license'
// 单个传 sinple   多个 multiple
export default {
  props: {
    activeObject: {
      type: Object,
      default: function () {
        return {
          type: 'sinple',
          visible: false
        }
      }
    }
  },
  data() {
    return {
      addData: {},
      addFlag: false
    }
  },
  methods: {
    ok() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          if (!this.addData.licenseMask) {
            this.$message.error('请输入激活码')
            return false
          }
          installCaptcha(this.addData).then((data) => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.$emit('getData')
              this.activeObject.visible = false
              if (this.$route.path === '/license') {
                this.$router.replace('/login')
              }
            }
          })
        } else {
          return false
        }
      })
    },
    success(response, file, fileList) {
      const type = response.success ? 'success' : 'error'
      this.$message({
        type: type,
        message: response.message
      })
      this.$emit('getData')
      this.activeObject.visible = false
    },
    error(response, file, fileList) {
      this.$message({
        type: 'error',
        message: response.message
      })
    },
    before(file) {
      const arr = file.name.split('.')
      if (['lic'].indexOf(arr[arr.length - 1]) == -1) {
        this.$notify({
          title: '提示',
          message: '请上传此类型的文件，【.lic】',
          type: 'error'
        })
        return false
      }
    }
  },
  created() {
    this.addData = {
      licenseMask: ''
    }
  }
}
</script>

<style></style>
