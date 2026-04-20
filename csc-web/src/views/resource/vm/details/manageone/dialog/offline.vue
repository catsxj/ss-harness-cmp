<template>
  <div>
    <el-dialog title="离线迁移" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="onLineData" :model="addData.data" :status-icon="true" label-width="100px">
          <basic-form-item label="新主机" prop="hostId" :rules="[required]" required-message="该字段为必填字段">
            <el-select v-model="addData.data.hostId">
              <el-option v-for="item in offLineHostData" :label="item.name" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <el-form-item label="允许磁盘产量">
            <el-switch v-model="addData.data.diskOverCommit"></el-switch>
          </el-form-item>
          <el-form-item label="块迁移">
            <el-switch v-model="addData.data.blockMigration"></el-switch>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { patchVmId, getHost } from 'services/platform/index'
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
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      offLineHostData: []
    }
  },
  methods: {
    ok() {
      this.$refs.onLineData.validate(valid => {
        if (valid) {
          delete this.addData.data.oldHostId
          patchVmId('OSMigrate', this.addData.data).then(data => {
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
  created() {
    this.offLineHostData = []
    const params = {
      page: 1,
      rows: 9999,
      type: 'Host'
    }
    const searchParam = [{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }]
    params.params = JSON.stringify(searchParam)
    getHost(params).then(data => {
      if (data.success) {
        const dataList = data.data.rows
        dataList.forEach((data, index) => {
          if (data.id != this.addData.data.oldHostId) this.offLineHostData.push(data)
        })
      }
    })
  }
}
</script>

<style></style>
