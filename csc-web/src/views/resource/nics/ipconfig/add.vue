<template>
  <div>
    <el-dialog append-to-body title="新增IP配置" :visible.sync="addData.dialog" v-if="addData.dialog">
      <cmp-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
        <cmp-form-item label="名称：" prop="name" validate="required">
          <el-input v-model="addData.data.name"></el-input>
        </cmp-form-item>
        <cmp-form-item label="公共IP：" prop="publicIpAddressId">
          <el-select v-model="addData.data.publicIpAddressId">
            <el-option v-for="(item, index) in list" :key="index" :label="item.name + '(' + (item.ipAddress || '') + ')'" :value="item.id"></el-option>
          </el-select>
        </cmp-form-item>
      </cmp-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createNicsIp, getPublicIpsUnused } from 'services/platform/azure'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            name: '',
            networkId: '',
            virtualMachineIds: []
          },
          dialog: false
        }
      }
    }
  },
  components: {},
  data() {
    return {
      list: [],
      link: 0,
      networkId: '',
      params: {
        page: 1,
        rows: 10
      },
      tableData: [],
      loading: false
    }
  },
  methods: {
    getPublicIps() {
      getPublicIpsUnused({ vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId, resourceGroupId: this.addData.data.resourceGroupId }).then(data => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createNicsIp({
            nicIpConfiguration: this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              this.$parent.handleSearch()
            }
            this.loading = true
          })
        }
      })
    }
  },
  created() {
    this.getPublicIps()
  }
}
</script>

<style></style>
