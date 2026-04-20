<template>
  <div>
    <el-dialog title="绑定IP" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="bandIpData" :model="addData.data" :status-icon="true" label-width="80px">
          <el-row>
            <el-col :span="24">
              <basic-form-item label="浮动IP" prop="id" :rules="[required]" required-message="该字段为必填字段">
                <el-select v-model="addData.data.id">
                  <el-option v-for="item in floatIpList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
              <basic-form-item label="云主机IP" prop="portId" :rules="[required]" required-message="该字段为必填字段">
                <el-select v-model="addData.data.portId">
                  <el-option v-for="(item, index) in BloudList" :key="index" :label="item.ipAddress" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
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
import { getFloatIp, floatIpPorts, getVmPorts } from 'services/platform/index'
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
      floatIpList: [],
      BloudList: []
    }
  },
  methods: {
    ok() {
      this.$refs.bandIpData.validate(valid => {
        if (valid) {
          floatIpPorts(this.addData.data).then(data => {
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
    getVmPorts(this.addData.data.vmId, {
      action: 'listByVmId',
      params: JSON.stringify({
        id: this.addData.data.vmId,
        vendorId: this.addData.data.vendorId
      })
    }).then(data => {
      if (data.success) {
        this.BloudList = data.data
      }
    })
    const param = {
      page: 1,
      rows: 10,
      simple: true,
      params: JSON.stringify([
        {
          param: { routerId: '', portId: '' },
          sign: 'NUL'
        },
        { param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }
      ])
    }
    getFloatIp(param).then(data => {
      if (data.success) {
        this.floatIpList = data.data.rows
      }
    })
  }
}
</script>

<style></style>
