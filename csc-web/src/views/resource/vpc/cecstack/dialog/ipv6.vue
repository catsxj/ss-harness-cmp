<template>
  <div>
    <el-dialog title="添加子网" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <basic-form label-width="120px" :model="addData.data" ref="data">
          <basic-form-item label="IPV6 CIDR：" prop="ipv6Cidr" validate="required" required-message="ipv6 cidr不能为空">
            <span>{{ ipv6s.pre }}</span>
            <el-input-number v-model="addData.data.ipv6Cidr" :min="0" :max="255"></el-input-number>
            <span>{{ ipv6s.back }}</span>
          </basic-form-item>
        </basic-form>
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
import { operationSubIpvs } from 'services/platform/index'
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
      ipv6s: {
        pre: '',
        back: ''
      }
    }
  },
  methods: {
    changeSwitch(val) {
      if (val) {
        const arr = this.addData.ipv6Cidr.split('::')
        console.log(arr)
        this.ipv6s = {
          pre: arr[0].slice(0, -2),
          back: '::/64'
        }
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          operationSubIpvs(this.addData.id, {
            action: 'associateIpv6',
            ...this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$refs.data.resetFields()
              this.$emit('goBack')
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
