<template>
  <el-dialog :title="addData.title" v-if="addData.dialog" :visible.sync="addData.dialog">
    <basic-form :model="addData.data" ref="data" label-width="120px">
      <basic-form-item label="付费模式: " prop="feeType">
        <el-radio-group v-model="addData.data.feeType" @change="changeIPtype" disabled>
          <el-radio-button :label="0">按量付费</el-radio-button>
          <el-radio-button :label="1">包年包月</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="所属地域: " prop="region" validate="required" required-message="请选择地域">
        <el-select v-model="addData.data.region" filterable clearable @change="changeRegion" :disabled="addData.name === 'edit'">
          <el-option v-for="item in regionList" :label="item.name" :value="item.regionId" :key="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="可用区: " prop="availabilityZones[0].master" validate="required" required-message="请选择可用区">
        <el-select v-model="addData.data.availabilityZones[0].master" filterable clearable @change="changeMaster" :disabled="addData.name === 'edit'">
          <el-option v-for="(item, index) in zoneList" :label="item.name" :value="item.zoneId" :key="index"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="可用区类型: ">
        <el-button type="ghost" v-if="currentZone.slaveZones.length === 0">单可用区</el-button>
        <el-button type="ghost" v-else>多可用区</el-button>
      </basic-form-item>
      <basic-form-item label="备可用区: " prop="availabilityZones[0].slave" required-message="请选择备可用区">
        <el-select v-model="addData.data.availabilityZones[0].slave" filterable clearable :disabled="addData.name === 'edit'">
          <el-option v-for="(item, index) in currentZone.slaveZones" :label="item.localName" :value="item.zoneId" :key="index"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="名称: " prop="name" validate="aliName">
        <el-input v-model="addData.data.name"></el-input>
      </basic-form-item>
      <basic-form-item label="规格: " prop="spec" validate="required,aliName">
        <el-select v-model="addData.data.spec" :disabled="addData.name === 'edit'">
          <el-option v-for="(item, index) in specList" :label="item.name" :value="item.value" :key="index"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="类型: " prop="scheme" validate="required">
        <el-radio-group v-model="addData.data.scheme" @change="changeLbtype" :disabled="addData.name === 'edit'">
          <el-radio-button label="internet">公网</el-radio-button>
          <el-radio-button label="intranet" v-if="addData.data.ipAddressType !== 'ipv6'">私网</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <template v-if="addData.data.scheme === 'intranet'">
        <basic-form-item label="网络类型: ">
          <el-radio-group v-model="netType" :disabled="addData.name === 'edit'">
            <el-radio-button :label="1">专有网络</el-radio-button>
            <!-- <el-radio-button :label="2">经典网络</el-radio-button> -->
          </el-radio-group>
        </basic-form-item>
        <el-row>
          <el-col :span="12">
            <template v-if="netType === 1">
              <basic-form-item label="专有网络: " prop="vpcId" validate="required">
                <el-select v-model="addData.data.vpcId" filterable clearable @change="changeVpc" :disabled="addData.name === 'edit'">
                  <el-option v-for="item in vpcList" :label="item.name" :value="item.id" :key="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </template>
          </el-col>
          <el-col :span="12">
            <template v-if="netType === 1">
              <basic-form-item prop="subnetId" validate="required" label-width="8px">
                <el-select v-model="addData.data.subnetId" filterable clearable :disabled="addData.name === 'edit'">
                  <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name + '(' + item.subnetUuid + ')'" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </template>
          </el-col>
        </el-row>
      </template>
      <basic-form-item label="IP版本: " prop="ipAddressType" validate="required">
        <el-radio-group v-model="addData.data.ipAddressType" @change="changeIPtype" :disabled="addData.name === 'edit'">
          <el-radio-button label="ipv4">IPV4</el-radio-button>
          <el-radio-button label="ipv6" v-if="addData.data.scheme === 'internet' && (addData.data.region === 'cn-huhehaote' || addData.data.region === 'cn-hongkong')">IPV6</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="计费方式: " prop="internetChargeType" validate="required">
        <el-radio-group v-model="addData.data.internetChargeType" :disabled="addData.name === 'edit'">
          <el-radio-button label="paybytraffic">按使用流量计费</el-radio-button>
          <el-radio-button label="paybybandwidth" v-if="addData.data.scheme !== 'intranet'">按固定带宽计费</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <template v-if="addData.data.internetChargeType === 'paybybandwidth'">
        <basic-form-item label="带宽值: " prop="broadbandValues" validate="required" @change="changebbv">
          <el-input-number v-model="addData.data.broadbandValues" :min="0" :max="5120" :disabled="addData.name === 'edit'"></el-input-number>
        </basic-form-item>
      </template>
      <basic-form-item label="资源组：" prop="resourceGroupUuid">
        <el-select v-model="addData.data.resourceGroupUuid" filterable clearable :disabled="addData.name === 'edit'">
          <el-option v-for="(item, index) in rgroupList" :label="item.displayName" :value="item.resourceGroupUuid" :key="index"></el-option>
        </el-select>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
      <el-button type="primary" @click.native="ok">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getRegion, getRegionZone, getVpc, getSubnet, createLb, editBalance } from 'services/platform/index'
import { getResource } from 'services/platform/azure.js'
const specList = [
  {
    name: 'slb.s1.small 标准型',
    value: 'slb.s1.small'
  },
  {
    name: 'slb.s2.small 标准型',
    value: 'slb.s2.small'
  },
  {
    name: 'slb.s2.medium 标准型',
    value: 'slb.s2.medium'
  },
  {
    name: 'slb.s3.small 高阶型',
    value: 'slb.s3.small'
  },
  {
    name: 'slb.s3.medium 高阶型',
    value: 'slb.s3.medium'
  },
  {
    name: 'slb.s3.large 超强型',
    value: 'slb.s3.large'
  }
]
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      specList,
      netType: 1,
      regionList: [],
      zoneList: [],
      vpcList: [],
      subnetList: [],
      rgroupList: [],
      currentZone: {
        slaveZones: []
      }
    }
  },
  created() {
    this.getRegion()
    this.getRgroup()
    if (this.addData.name === 'edit') {
      if (this.addData.data.region) {
        this.getVpc()
        if (this.addData.data.vpcId) {
          this.getSubnet()
        }
      }
    }
  },
  mounted() {},
  methods: {
    getRegion() {
      getRegion({ vendorId: this.addData.vendorId }).then(data => {
        if (data.success) {
          this.regionList = data.data
          if (this.addData.name === 'edit') {
            const region = this.regionList.find(item => item.regionId === this.addData.data.region)
            this.getZone(region.id)
          }
        }
      })
    },
    getZone(id) {
      getRegionZone(id, {
        type: 'SLB',
        vendorId: this.addData.vendorId
      }).then(data => {
        if (data.success) {
          this.zoneList = data.data
          if (this.addData.name === 'edit') this.changeMaster()
        }
      })
    },
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.vendorId, regionId: this.addData.data.region }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.vpcList = data.data.rows
        }
      })
    },
    getSubnet() {
      const vpc = this.vpcList.find(item => item.id === this.addData.data.vpcId)
      console.log(vpc)
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([
          {
            param: {
              vendorId: this.addData.vendorId,
              zone: this.addData.data.availabilityZones[0].master,
              //   region: this.addData.data.regionId,
              networkId: vpc.id
            },
            sign: 'EQ'
          }
        ])
      }).then(data => {
        if (data.success) {
          this.subnetList = data.data.rows
        }
      })
    },
    getRgroup() {
      const params = {
        page: 1,
        rows: 99999
      }
      params.params = this.$tools.handleSearchParam({
        vendorId: this.addData.data.vendorId
      })
      getResource(params).then(data => {
        if (data.success) {
          this.rgroupList = data.data.rows
        }
      })
    },
    changeRegion() {
      if (this.addData.data.region) {
        this.addData.data.availabilityZones[0].master = ''
        this.addData.data.vpcId = ''
        this.addData.data.subnetId = ''
        const region = this.regionList.find(item => item.regionId === this.addData.data.region)
        this.getZone(region.id)
        this.getVpc()
      } else {
        this.zoneList = []
        this.vpcList = []
        this.subnetList = []
      }
    },
    changeMaster() {
      this.currentZone = this.zoneList.find(item => item.zoneId === this.addData.data.availabilityZones[0].master)
      this.addData.data.vpcId = ''
      this.addData.data.subnetId = ''
    },
    changeVpc(val) {
      this.addData.data.subnetId = ''
      this.getSubnet()
    },
    changeLbtype() {
      if (this.addData.data.scheme === 'intranet') {
        this.addData.data.ipAddressType = 'ipv4'
      }
    },
    changeIPtype() {},
    changebbv() {
      this.addData.data.broadbandValue = this.addData.data.broadbandValues < 1 ? -1 : this.addData.data.broadbandValues
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (!valid) {
          return false
        }
        let params = { balancer: { ...this.addData.data } }
        let http
        if (this.addData.name === 'add') http = createLb
        if (this.addData.name === 'edit') {
          http = editBalance
          params = {
            action: 'modify',
            balancer: {
              name: this.addData.data.name,
              id: this.addData.data.id
            }
          }
        }
        delete params.broadbandValues
        http(params).then(data => {
          const type = data.success ? 'success' : 'error'
          this.$message[type](data.message)
          if (data.success) {
            this.addData.dialog = false
            this.$refs.data.resetFields()
          }
        })
      })
    }
  }
}
</script>
