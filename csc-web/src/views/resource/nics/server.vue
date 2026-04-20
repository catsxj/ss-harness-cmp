<template>
  <div>
    <el-dialog :title="addData.title" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <el-col :span="24">
            <el-alert title="仅可绑定已停止云主机" :closable="false" type="warning"> </el-alert>
          </el-col>
          <el-col :span="24" class="m-t-md">
            <cmp-form-item label="云主机：" prop="serverId">
              <el-select v-model="addData.data.serverId" clearable>
                <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </cmp-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { modifySubnet, getVm } from 'services/platform/index'
import { patchNics } from 'services/platform/azure'
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
      list: [],
      loading: false
    }
  },
  created() {
    this.getVms()
  },
  methods: {
    getVms() {
      getVm({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId, status: 'DEALLOCATE' }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          patchNics(this.addData.action, this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>

<style></style>
