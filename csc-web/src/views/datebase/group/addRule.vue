<template>
  <div>
    <el-dialog title="新增" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-form label-width="120px" :model="addData.data" ref="data">
        <basic-form-item label="协议类型" prop="protocol" validate="required">
          <el-select v-model="addData.data.protocol">
            <el-option :label="item" :value="item" :key="item" v-for="item in protocolType"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="规则方向" prop="direction" validate="required">
          <el-select v-model="addData.data.direction">
            <el-option label="入口" value="ingress"></el-option>
            <el-option label="出口" value="egress"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="起始端口" prop="portMin" v-if="addData.data.protocol != 'ICMP'" validate="required">
          <el-input v-model.number="addData.data.portMin"></el-input>
        </basic-form-item>
        <basic-form-item label="结束端口" prop="portMax" v-if="addData.data.protocol != 'ICMP'" validate="required">
          <el-input v-model.number="addData.data.portMax"></el-input>
        </basic-form-item>
        <basic-form-item label="CIDR" prop="remoteIpPrefix" validate="required">
          <el-input v-model="addData.data.remoteIpPrefix"></el-input>
        </basic-form-item>
      </el-form>
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
      protocolType: ['TCP', 'UDP', 'ICMP']
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.$http({
            url: '/security/group/rule/create',
            method: 'POST',
            data: this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
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
