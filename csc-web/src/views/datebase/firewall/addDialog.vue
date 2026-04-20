<template>
  <el-dialog :title="dialog.id ? '编辑防火墙' : '新增'" :close-on-click-modal="false" :visible.sync="dialog.visible" width="800px" append-to-body="">
    <basic-form :model="addData" ref="addForm" label-width="150px">
      <el-row :gutter="20">
        <el-col :span="24">
          <basic-form-item label="名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="24">
          <basic-form-item label="描述：" prop="remark">
            <el-input type="textarea" v-model="addData.remark" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getFirewall, createFirewall, modifyFirewall, getFirewallDetail } from 'services/platform/nsx/firewall'

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      addData: {},
      firewallList: []
    }
  },
  created() {
    this.getFirewall()
    if (this.dialog.id) {
      this.getDetail()
    }
  },
  methods: {
    getFirewall() {
      getFirewall({
        page: 1,
        rows: 10000
      }).then(data => {
        if (data.success) {
          this.firewallList = data.data.rows
        }
      })
    },
    addItem(data) {
      data.push({})
    },
    removeItem(key, data) {
      data.splice(key, 1)
    },
    getDetail() {
      getFirewallDetail(this.dialog.id).then(data => {
        if (data.success) {
          const { id, name, remark } = data.data
          this.addData = {
            id,
            name,
            remark
          }
        }
      })
    },
    addSubmit() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.loading = true
          const http = this.addData.id ? modifyFirewall : createFirewall
          const { category, target } = this.dialog
          const addData = {
            ...this.addData,
            category,
            target
          }
          http(addData).then(data => {
            this.loading = false
            if (data.success) {
              this.$message.success(data.message)
              this.dialog.visible = false
              this.$emit('getData')
            }
          })
        }
      })
    }
  }
}
</script>
