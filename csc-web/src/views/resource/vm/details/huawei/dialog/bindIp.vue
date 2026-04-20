<template>
  <div>
    <el-dialog title="绑定IP" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <basic-form ref="bandIpData" :model="addData.data" :status-icon="true" label-width="80px">
          <el-row>
            <el-col :span="24">
              <basic-form-item label="浮动IP" prop="id" validate="required" required-message="该字段为必填字段">
                <el-select v-model="addData.data.id">
                  <el-option v-for="item in floatIpList" :key="item.id" :label="item.publicIp" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
        </basic-form>
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
import { getElasticips, associateElasticipsIp, getVmPorts } from 'services/platform/index'
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
      floatIpList: []
    }
  },
  methods: {
    ok() {
      this.$refs.bandIpData.validate(valid => {
        if (valid) {
          associateElasticipsIp(this.addData.data.id, {
            action: 'association',
            instanceId: '',
            serverId: this.addData.data.serverId
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
  created() {
    const param = {
      page: 1,
      rows: 10,
      params: JSON.stringify([
        {
          param: { instanceId: '' },
          sign: 'NUL'
        },
        { param: { vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }, sign: 'EQ' }
      ])
    }
    getElasticips(param).then(data => {
      if (data.success) {
        this.floatIpList = data.data.rows
      }
    })
  }
}
</script>

<style></style>
