<template>
  <div>
    <el-dialog title="挂载现有网卡" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <el-form ref="data" :model="nicData" :status-icon="true" label-width="80px">
          <el-col :span="24" class="m-t-md">
            <basic-form-item label="网卡：">
              <el-select v-model="nicData.id" clearable filterable>
                <el-option v-for="(item, index) in list" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="submit" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getNics, patchNics } from 'services/platform/azure'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      params: {
        page: 1,
        rows: 999,
        params: JSON.stringify([
          { param: { vendorId: this.addData.data.vendorId, vpcId: this.addData.data.vpcId }, sign: 'EQ' },
          { param: { serverId: 'null' }, sign: 'NUL' }
        ])
      },
      searchData: {
        name: ''
      },
      list: [],
      nicData: {},
      loading: false,
      selectList: []
    }
  },
  methods: {
    getData() {
      getNics(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
        }
      })
    },
    submit() {
      const params = {
        vendorId: this.addData.data.vendorId,
        regionId: this.addData.data.regionId,
        id: this.nicData.id,
        serverId: this.addData.data.serverId
      }
      patchNics('attach', params).then(data => {
        if (data.success) {
          this.$notify({
            message: data.message,
            type: 'success'
          })
          this.addData.dialog = false
        }
      })
    }
  },
  created() {
    this.getData()
  }
}
</script>

<style></style>
