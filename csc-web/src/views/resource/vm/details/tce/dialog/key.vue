<template>
  <div>
    <el-dialog append-to-body :title="addData.flag ? '绑定密钥' : '解绑密钥'" width="50%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" status-icon ref="data" label-width="120px" class="demo-ruleForm">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="密钥" prop="keypairId" validate="required">
              <el-select v-model="addData.data.keypairId">
                <el-option v-for="(item, index) in keyData" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getVmKey, patchVmKey } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false,
          flag: true
        }
      }
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      keyData: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.flag) {
            patchVmKey('bind', this.addData.data).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
              }
            })
          } else {
            patchVmKey('unbind', this.addData.data).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
              }
            })
          }
        }
      })
    }
  },
  created() {
    if (this.addData.flag) {
      getVmKey({ action: 'unbind', id: this.addData.data.id }).then(data => {
        if (data.success) {
          this.keyData = data.data
        }
      })
    } else {
      getVmKey({ action: 'bind', id: this.addData.data.id }).then(data => {
        if (data.success) {
          this.keyData = data.data
        }
      })
    }
  }
}
</script>

<style></style>
