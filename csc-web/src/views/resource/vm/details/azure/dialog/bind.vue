<template>
  <div>
    <el-dialog title="绑定弹性IP" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog" append-to-body>
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="网卡：" prop="nicId" :rules="[required]">
            <el-select v-model="addData.data.nicId">
              <el-option v-for="(item, index) in nicList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="弹性IP：" prop="publicIpAddressId" :rules="[required]">
            <el-select v-model="addData.data.publicIpAddressId">
              <el-option v-for="(item, index) in list" :key="index" :label="item.name + '(' + (item.ipAddress || '') + ')'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
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
import { getPublicIpsUnused, patchNics } from 'services/platform/azure'

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
    },
    nicList: {
      type: Array
    }
  },
  data() {
    return {
      loading: false,
      list: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          patchNics('attachPublicIp', {
            id: this.addData.data.nicId,
            publicIpAddressId: this.addData.data.publicIpAddressId
          }).then(data => {
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
    },
    getList() {
      getPublicIpsUnused({ vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId, resourceGroupId: this.addData.data.resourceGroupId }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    }
  }
}
</script>

<style></style>
