<template>
  <div>
    <el-dialog :title="addData.title" append-to-body :visible.sync="addData.dialog" width="60%" v-if="addData.dialog">
      <el-row>
        <el-form ref="bindGroupData" :model="addData.data" :status-icon="true" label-width="140px">
          <!-- <el-col :span="24">
            <basic-form-item label="名称" prop="name" validate="required,noChinese">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col> -->
          <el-col :span="24">
            <basic-form-item label="协议" prop="protocol" validate="required">
              <el-select v-model="addData.data.protocol" :disabled="addData.title == '编辑ACL'">
                <el-option label="ANY" value="ANY"></el-option>
                <el-option label="TCP" value="TCP"></el-option>
                <el-option label="UDP" value="UDP"></el-option>
                <el-option label="ICMP" value="ICMP"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="动作" prop="action" validate="required">
              <el-select v-model="addData.data.action">
                <el-option value="ALLOW" label="允许"></el-option>
                <el-option value="DENY" label="拒绝"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="源IP地址/子网" prop="sourceIp" validate="required,ipORcidr">
              <el-input v-model="addData.data.sourceIp" placeholder="10.20.1.1/1"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="目的IP地址/子网" prop="destIp" validate="required,ipORcidr">
              <el-input v-model="addData.data.destIp" placeholder="10.20.1.1/1"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item v-if="addData.data.protocol != 'ICMP' && addData.data.protocol != 'ANY'" label="源端口/端口范围" prop="sourcePort">
              <el-input v-model="addData.data.sourcePort" placeholder="8080:9090"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item v-if="addData.data.protocol != 'ICMP' && addData.data.protocol != 'ANY'" label="目的端口/端口范围" prop="destPort">
              <el-input v-model="addData.data.destPort" placeholder="8090:9090"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述" prop="remark">
              <el-input type="textarea" v-model="addData.data.remark"></el-input>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createFirewallRule, modifyFirewallRule } from 'services/platform/index'

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
      this.$refs.bindGroupData.validate(valid => {
        if (valid) {
          const getUrl = this.addData.title == '新增ACL' ? createFirewallRule : modifyFirewallRule
          getUrl(this.addData.data).then(data => {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.addData.dialog = false
            this.$emit('back')
          })
        }
      })
    },
    setVersion() {
      this.$set(this.addData, 'sourceIp', '')
      this.$set(this.addData, 'destIp', '')
    }
  },
  created() {}
}
</script>

<style></style>
