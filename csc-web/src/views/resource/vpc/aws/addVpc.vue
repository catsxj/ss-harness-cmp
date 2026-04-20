<template>
  <div>
    <el-dialog title="添加VPC" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="地域：" prop="regionId" validate="required" required-message="请输入地域">
              <el-select v-model="addData.data.regionId">
                <el-option v-for="(item, index) in regionList" :key="index" :label="item.name" :value="item.code"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="CIDR：" prop="cidr" validate="required,cidr">
              <el-input v-model="addData.data.cidr"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="IPV6 CIDR：" prop="providedIpv6Cidr" validate="required">
              <el-radio-group v-model="addData.data.providedIpv6Cidr">
                <el-radio label="0">无IPV6 CIDR</el-radio>
                <el-radio label="1">Amazon</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
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
import { createVpc, getRegion } from 'services/platform/aws'
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
      regionList: [],
      one: '10',
      two: '0',
      end: '16',
      twoMin: 0,
      twoMax: 255
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.addData.data.providedIpv6Cidr = !!+this.addData.data.providedIpv6Cidr
          createVpc(this.addData.data).then(data => {
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
    },
    getRegion() {
      getRegion({ vendorId: this.addData.data.vendorId }).then(data => {
        if (data.success) {
          this.regionList = data.data
        }
      })
    }
  },
  created() {
    this.getRegion()
  }
}
</script>

<style></style>
