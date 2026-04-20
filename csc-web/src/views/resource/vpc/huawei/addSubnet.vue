<template>
  <div>
    <el-dialog title="新增子网" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <basic-form label-width="120px" :model="addData.data" ref="data">
          <basic-form-item label="VPC网段：">
            {{ addData.cidr }}
          </basic-form-item>
          <basic-form-item label="可用区" prop="zone" validate="required">
            <el-select v-model="addData.data.zone">
              <el-option :label="item.name" :value="item.zoneId" v-for="(item, index) in zoneData" :key="index"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="子网名称" prop="name" validate="required,noChinese">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
          <basic-form-item label="子网Ipv4网段" prop="cidr" validate="required,cidr">
            <el-input v-model="addData.data.cidr" :disabled="addData.data.modifyFlag"></el-input>
          </basic-form-item>
          <basic-form-item label="网关IP" placeholder="192.168.1.11" prop="gateway">
            <el-input v-model="addData.data.gateway"></el-input>
          </basic-form-item>
          <basic-form-item label="DNS" prop="dnsName" validate="muchDns">
            <el-input type="textarea" v-model="addData.data.dnsName" placeholder="每行一条(例如: 114.114.114.114)"></el-input>
          </basic-form-item>
        </basic-form>
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
      categoryData: [
        {
          value: 'VLAN',
          name: 'VLAN'
        },
        {
          value: 'VXLAN',
          name: 'VXLAN'
        }
      ],
      zoneData: [],
      loading: false
    }
  },
  methods: {
    ok() {
      // dns过滤
      function DnsFilter(mobiles) {
        if (!mobiles) return true
        let i,
          result = '',
          c
        for (i = 0; i < mobiles.length; i++) {
          c = mobiles.substr(i, 1)
          if (c == '\n') {
            result = result + '/'
          } else if (c != '\r') {
            result = result + c
          }
        }
        result = result.split('/')
        return result
      }
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.dnsName) {
            this.addData.dnsNames = DnsFilter(this.addData.dnsName)
          }
          this.loading = true
          createSubnet(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.$parent.getData()
            }
            this.loading = false
          })
        }
      })
    },
    // 请求区域
    getZone() {
      getZone({ vendorId: this.addData.data.vendorId, regionId: this.addData.data.regionId }).then(data => {
        if (data.success) {
          this.zoneData = data.data
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
