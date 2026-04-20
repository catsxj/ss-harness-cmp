<template>
  <div>
    <el-dialog :title="addData.title" :visible.sync="addData.dialog" width="40%" v-if="addData.dialog">
      <el-row>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="80px">
          <el-col :span="24">
            <basic-form-item label="子网名称" prop="name" validate="required,noChinese">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
            <basic-form-item label="IP版本" prop="ipVersion" validate="required">
              <el-select v-model="addData.data.ipVersion" @change="clearData" :disabled="addData.title === '编辑子网'">
                <el-option label="IPV4" value="V4"></el-option>
                <el-option label="IPV6" value="V6"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-if="addData.data.ipVersion === 'V4'" :key="1">
            <basic-form-item label="网络地址" prop="cidr" validate="required,cidr">
              <el-input v-model="addData.data.cidr" :disabled="addData.title === '编辑子网'"></el-input>
            </basic-form-item>
            <basic-form-item label="DHCP" prop="dhcpEnabled" validate="required">
              <el-select v-model="addData.data.dhcpEnabled">
                <el-option label="启用" :value="true"></el-option>
                <el-option label="禁用" :value="false"></el-option>
              </el-select>
            </basic-form-item>
            <basic-form-item label="网关IP" placeholder="192.168.1.11" prop="gateway">
              <el-input v-model="addData.data.gateway"></el-input>
            </basic-form-item>
            <basic-form-item label="分配池" prop="ipPool" validate="ipPool">
              <el-input type="textarea" v-model="addData.data.ipPool" placeholder="IP地址分配池，每行一条(例: 192.168.1.2-192.168.1.200)"></el-input>
            </basic-form-item>
            <basic-form-item label="DNS" prop="dnsName" validate="muchDns">
              <el-input type="textarea" v-model="addData.data.dnsName" placeholder="每行一条(例如: 114.114.114.114)"></el-input>
            </basic-form-item>
            <basic-form-item label="主机路由" prop="hostRoute" validate="routerFilter">
              <el-input type="textarea" v-model="addData.data.hostRoute" placeholder="每行一条(例如: 192.168.200.0/24,10.56.1.254)"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24" v-else :key="2">
            <basic-form-item label="网络地址" prop="cidr" validate="required,ipV6Cidr">
              <el-input v-model="addData.data.cidr" :disabled="addData.title === '编辑子网'" placeholder="请输入2222::/24类型格式"></el-input>
            </basic-form-item>
            <basic-form-item label="DHCP" prop="dhcpEnabled" validate="required">
              <el-select v-model="addData.data.dhcpEnabled">
                <el-option label="启用" :value="true"></el-option>
                <el-option label="禁用" :value="false"></el-option>
              </el-select>
            </basic-form-item>
            <basic-form-item label="网关IP" placeholder="192.168.1.11" prop="gateway" validate="ipV6">
              <el-input v-model="addData.data.gateway" placeholder="请输入2222::类型格式"></el-input>
            </basic-form-item>
            <basic-form-item label="分配池" prop="ipPool" validate="v6IpPool">
              <el-input type="textarea" v-model="addData.data.ipPool" placeholder="IP地址分配池，每行一条(例: 2000::2000-2000::2200)"></el-input>
            </basic-form-item>
            <basic-form-item label="DNS" prop="dnsName" validate="v6MuchDns">
              <el-input type="textarea" v-model="addData.data.dnsName" placeholder="每行一条(例如: 2000::2)"></el-input>
            </basic-form-item>
            <basic-form-item label="主机路由" prop="hostRoute" validate="v6RouterFilter">
              <el-input type="textarea" v-model="addData.data.hostRoute" placeholder="每行一条(例如: 2000::/24,2000::3)"></el-input>
            </basic-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createSubnet, modifySubnet } from 'services/platform/index'
function ipPoolsFilter(mobiles) {
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
// 主机路由过滤
function routeFilter(mobiles) {
  if (!mobiles) return true
  let i,
    result = '',
    c
  for (i = 0; i < mobiles.length; i++) {
    c = mobiles.substr(i, 1)
    if (c == '\n') {
      result = result + '|'
    } else if (c != '\r') {
      result = result + c
    }
  }
  result = result.split('|')
  return result
}
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
      isPhyNetwork: false,
      isSementationId: false,
      vlanList: []
    }
  },
  methods: {
    clearData() {
      this.$set(this.addData.data, 'cidr', '')
      this.$set(this.addData.data, 'gateway', '')
      this.$set(this.addData.data, 'ipPool', '')
      this.$set(this.addData.data, 'dnsName', '')
      this.$set(this.addData.data, 'hostRoute', '')
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.data.ipPool) {
            this.addData.data.ipPools = ipPoolsFilter(this.addData.data.ipPool)
          }
          if (this.addData.data.dnsName) {
            this.addData.data.dnsNames = DnsFilter(this.addData.data.dnsName)
          }
          if (this.addData.data.hostRoute) {
            this.addData.data.hostRoutes = routeFilter(this.addData.data.hostRoute)
          }
          if (this.addData.data.id) {
            modifySubnet(this.addData.data).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('back')
              }
            })
          } else {
            createSubnet(this.addData.data).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style></style>
