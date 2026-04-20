<template>
  <div>
    <el-dialog title="添加子网" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="VPC网段：">
                {{ addData.cidr }}
              </basic-form-item>
              <basic-form-item label="子网名称：" prop="name" validate="required" required-message="请输入子网名称">
                <el-input v-model="addData.data.name"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="CIDR：" prop="cidr" validate="required">
                <el-input v-model="addData.data.cidr"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="可用区：" prop="zone" validate="required" required-message="请选择地区">
                <el-select v-model="addData.data.zone">
                  <el-option v-for="item in zoneList" :label="item.name" :value="item.zoneId" :key="item.zoneId"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getZone, createSubnet } from 'services/platform/index'
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
      zoneList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          createSubnet(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.$parent.getData()
            }
          })
        }
      })
    },
    getZone() {
      getZone({ vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }).then(data => {
        if (data.success) {
          this.zoneList = data.data
        }
      })
    }
  },
  created() {
    this.getZone()
  }
}
</script>

<style></style>
