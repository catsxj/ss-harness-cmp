<template>
  <div>
    <el-dialog title="设置权限" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="账号类型：" prop="accountType">
              <el-radio-group v-model="addData.data.accountType">
                <el-radio :label="item.value" v-for="(item, index) in typeList" :key="index">{{ item.name }}</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      typeList: [
        { name: '只读', value: '1' },
        { name: '读写', value: '2' },
        { name: '复制', value: '3' }
      ]
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.$http({
            url: '/',
            method: 'POST',
            data: this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.getList()
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style>
.text_mine {
  font-size: 10px;
  color: #999;
}
</style>
