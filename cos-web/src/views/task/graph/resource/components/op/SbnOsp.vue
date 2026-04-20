<template>
  <basic-form :model="itemData" ref="form" :disabled="isPreview">
    <el-alert class="m-b" title="提示" type="warning" :closable="false" description="该节点依赖于前置节点，若前置节点为新增，则该节点只能新增"> </el-alert>
    <el-form-item label="数据来源：">
      <el-radio-group class="simple" v-model="itemData.origin" @change="getData">
        <el-radio-button label="create" border>新增</el-radio-button>
        <el-radio-button label="reuse" border :disabled="lastNode.origin === 'create'">已有</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <div v-if="!isTemplate">
      <div v-if="itemData.origin === 'create'">
        <basic-form-item label="子网名称：" prop="name" validate="required,noChinese">
          <el-input v-model="itemData.name"></el-input>
        </basic-form-item>
        <basic-form-item label="IP版本：" prop="ipVersion" validate="required">
          <el-select v-model="itemData.ipVersion" @change="clearData">
            <el-option label="IPV4" value="V4"></el-option>
            <el-option label="IPV6" value="V6"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="网络地址" prop="cidr" validate="required,cidr" :key="1" v-if="itemData.ipVersion === 'V4'">
          <el-input v-model="itemData.cidr"></el-input>
        </basic-form-item>
        <basic-form-item label="DHCP" prop="dhcpEnabled" validate="required" :key="2" v-if="itemData.ipVersion === 'V4'">
          <el-select v-model="itemData.dhcpEnabled">
            <el-option label="启用" :value="true"></el-option>
            <el-option label="禁用" :value="false"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="网关IP" placeholder="192.168.1.11" prop="gateway" :key="3" v-if="itemData.ipVersion === 'V4'">
          <el-input v-model="itemData.gateway"></el-input>
        </basic-form-item>
        <basic-form-item label="分配池" prop="ipPool" validate="ipPool" :key="4" v-if="itemData.ipVersion === 'V4'">
          <el-input type="textarea" v-model="itemData.ipPool" placeholder="IP地址分配池，每行一条(例: 192.168.1.2-192.168.1.200)"></el-input>
        </basic-form-item>
        <basic-form-item label="DNS" prop="dnsName" validate="muchDns" :key="5" v-if="itemData.ipVersion === 'V4'">
          <el-input type="textarea" v-model="itemData.dnsName" placeholder="每行一条(例如: 114.114.114.114)"></el-input>
        </basic-form-item>
        <basic-form-item label="主机路由" prop="hostRoute" validate="routerFilter" :key="6" v-if="itemData.ipVersion === 'V4'">
          <el-input type="textarea" v-model="itemData.hostRoute" placeholder="每行一条(例如: 192.168.200.0/24,10.56.1.254)"></el-input>
        </basic-form-item>
        <basic-form-item label="网络地址" prop="cidr" validate="required,ipV6Cidr" v-if="itemData.ipVersion === 'V6'" :key="21">
          <el-input v-model="itemData.cidr" placeholder="请输入2222::/24类型格式"></el-input>
        </basic-form-item>
        <basic-form-item label="DHCP" prop="dhcpEnabled" validate="required" v-if="itemData.ipVersion === 'V6'" :key="22">
          <el-select v-model="itemData.dhcpEnabled">
            <el-option label="启用" :value="true"></el-option>
            <el-option label="禁用" :value="false"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="网关IP" placeholder="192.168.1.11" prop="gateway" validate="ipV6" v-if="itemData.ipVersion === 'V6'" :key="23">
          <el-input v-model="itemData.gateway" placeholder="请输入2222::类型格式"></el-input>
        </basic-form-item>
        <basic-form-item label="分配池" prop="ipPool" validate="v6IpPool" v-if="itemData.ipVersion === 'V6'" :key="24">
          <el-input type="textarea" v-model="itemData.ipPool" placeholder="IP地址分配池，每行一条(例: 2000::2000-2000::2200)"></el-input>
        </basic-form-item>
        <basic-form-item label="DNS" prop="dnsName" validate="v6MuchDns" v-if="itemData.ipVersion === 'V6'" :key="25">
          <el-input type="textarea" v-model="itemData.dnsName" placeholder="每行一条(例如: 2000::2)"></el-input>
        </basic-form-item>
        <basic-form-item label="主机路由" prop="hostRoute" validate="v6RouterFilter" v-if="itemData.ipVersion === 'V6'" :key="26">
          <el-input type="textarea" v-model="itemData.hostRoute" placeholder="每行一条(例如: 2000::/24,2000::3)"></el-input>
        </basic-form-item>
      </div>
      <el-form-item v-else label="子网列表：" prop="id" :rules="{ required: true, message: '请选择列表' }">
        <el-select v-model="itemData.id" placeholder="请选择" filterable>
          <el-option v-for="item in listData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </el-form-item>
    </div>
  </basic-form>
</template>
<script>
import node from '../../../mixins/index'
import show from '../../../mixins/show'
import { getSubnet } from 'services/platform/index'
export default {
  mixins: [node, show],
  props: {
    nodeId: {},
    itemData: {
      type: Object,
      default: function () {
        return {
          origin: 'create',
          vendorId: ''
        }
      }
    }
  },
  data() {
    return {
      listData: [],
      typeList: []
    }
  },
  computed: {
    lastNode: function () {
      const lastObj = this.getPreNodeData(this.nodeId, 'task.resource.vpc.osp')
      if (lastObj.origin) return lastObj
      return { origin: 'create' }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    clearData() {
      this.$set(this.itemData, 'cidr', '')
      this.$set(this.itemData, 'gateway', '')
      this.$set(this.itemData, 'ipPool', '')
      this.$set(this.itemData, 'dnsName', '')
      this.$set(this.itemData, 'hostRoute', '')
    },
    getPostData() {
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
      let data = false
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.itemData.ipPool) {
            this.itemData.ipPools = ipPoolsFilter(this.itemData.ipPool)
          }
          if (this.itemData.dnsName) {
            this.itemData.dnsNames = DnsFilter(this.itemData.dnsName)
          }
          if (this.itemData.hostRoute) {
            this.itemData.hostRoutes = routeFilter(this.itemData.hostRoute)
          }
          data = this.itemData
        }
      })
      return data
    },
    getData() {
      if (!this.lastNode.id) return
      getSubnet({
        simple: true,
        params: JSON.stringify([{ param: { networkId: this.lastNode.id }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.listData = data.data.rows
        }
      })
    }
  }
}
</script>
<style></style>
