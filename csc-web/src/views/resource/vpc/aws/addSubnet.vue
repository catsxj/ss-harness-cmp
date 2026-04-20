<template>
  <div>
    <el-dialog title="添加子网" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="VPC网段：">
                {{ addData.ipAry.join(',') }}
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="子网名称：" prop="name" validate="required" required-message="请输入子网名称">
                <el-input v-model="addData.data.name"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="CIDR：" prop="cidr" validate="required,cidr">
                <el-input v-model="addData.data.cidr"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <basic-form-item label="可用区：" prop="zoneId" validate="required" required-message="请选择地区">
                <el-select v-model="addData.data.zoneId">
                  <el-option v-for="item in zoneList" :label="item.zoneId" :value="item.zoneRealId" :key="item.zoneId"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10" v-if="addData.ipv6Cidr != null">
            <el-col :span="24">
              <basic-form-item label="IPV6 CIDR：">
                <el-select v-model="ipv6" @change="changeIpv6">
                  <el-option label="请勿分配IPV6" :value="null"></el-option>
                  <el-option label="自定义IPV6" value="customize"></el-option>
                </el-select>
              </basic-form-item>
              <el-row v-if="ipv6 === 'customize'">
                <el-col :span="11" style="text-align: right; line-height: 32px">{{ ipv6cidr[0] }}</el-col>
                <el-col :span="3">
                  <basic-form-item label-width="4px" prop="ipv6Cidrs" maxlength="2" validate="required,ipV6CidrCustomize">
                    <el-input v-model="addData.data.ipv6Cidrs"></el-input>
                  </basic-form-item>
                </el-col>
                <el-col :span="9" style="line-height: 32px">::/64</el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getZone, createSubnet } from 'services/platform/aws'
import { getPoolCondition } from 'services/platform/pool'

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
      ipv6: null,
      ipv6cidr: [],
      zoneList: [],
      loading: false
    }
  },
  methods: {
    changeIpv6(value) {
      this.addData.data.ipv6Cidr = ''
      if (value === 'customize') {
        const arr = this.addData.ipv6Cidr.split('::')
        const a = arr[0].slice(0, -2)
        this.ipv6cidr[0] = a
        this.ipv6cidr[1] = arr[1]
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.data.ipv6Cidrs) {
            this.addData.data.ipv6Cidr = this.ipv6cidr[0] + this.addData.data.ipv6Cidrs + '::/64'
            delete this.addData.data.ipv6Cidrs
          }
          this.loading = true
          createSubnet(this.addData.data).then(data => {
            this.loading = false
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.addData.data.ipv6Cidr = ''
              this.$emit('goBack')
            }
          })
        }
      })
    },
    getZone() {
      getPoolCondition({
        condition: 'listZonesByRegion',
        regionId: this.addData.data.region,
        poolGroupId: this.addData.data.poolGroupId,
        vendorId: this.addData.data.vendorId
      }).then(data => {
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
