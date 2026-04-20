<template>
  <div>
    <el-dialog append-to-body title="新增" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <div>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="VPC" prop="routerIds" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.data.routerIds" multiple>
              <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { firewallRouter, getRouter } from 'services/platform/index'
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
      list: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          firewallRouter({
            id: this.addData.data.firewallId,
            vendorId: this.addData.data.vendorId,
            routerIds: this.addData.data.routerIds,
            operation: 'add'
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.handleSearch()
            }
          })
        }
      })
    }
  },
  created() {
    getRouter({
      condition: JSON.stringify({
        condition: 'firewall',
        vendorId: this.addData.data.vendorId,
        firewallId: this.addData.data.firewallId
      })
    }).then(data => {
      if (data.success) {
        this.list = data.data
      }
    })
  }
}
</script>

<style></style>
