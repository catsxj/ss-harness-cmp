/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="network" :add-data="addData" ref="common" @vendorId="changeRegion" @backZone="changeMaster" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled">
    <basic-form :model="addData.configs" ref="addForm" label-position="left">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="24">
            <basic-form-item label="可用区类型: ">
              <el-button type="ghost" v-if="currentZone.slaveZones.length === 0">单可用区</el-button>
              <el-button type="ghost" v-else>多可用区</el-button>
            </basic-form-item>
            <basic-form-item label="备可用区: " prop="availabilityZones[0].slave" required-message="请选择备可用区">
              <el-select v-model="addData.configs.availabilityZones[0].slave" filterable clearable class="basic-cmp">
                <el-option v-for="(item, index) in currentZone.slaveZones" :label="item.localName" :value="item.zoneId" :key="index"></el-option>
              </el-select>
            </basic-form-item>
            <basic-form-item label="规格: " prop="spec" validate="required,aliName">
              <el-select v-model="addData.configs.spec" class="basic-cmp">
                <el-option v-for="(item, index) in specList" :label="item.name" :value="item.value" :key="index"></el-option>
              </el-select>
            </basic-form-item>
            <basic-form-item label="类型: " prop="scheme" validate="required">
              <el-radio-group v-model="addData.configs.scheme">
                <el-radio-button label="internet">公网</el-radio-button>
                <el-radio-button label="intranet">私网</el-radio-button>
              </el-radio-group>
            </basic-form-item>
            <template v-if="addData.configs.scheme === 'intranet'">
              <basic-form-item label="网络类型: ">
                <el-radio-group v-model="netType">
                  <el-radio-button :label="1">专有网络</el-radio-button>
                </el-radio-group>
              </basic-form-item>
              <el-row>
                <el-col :span="12">
                  <template v-if="netType === 1">
                    <basic-form-item label="专有网络: " prop="vpcId" validate="required">
                      <el-select v-model="addData.configs.vpcId" filterable clearable @change="changeVpc">
                        <el-option v-for="item in vpcList" :label="item.name" :value="item.id" :key="item.id"></el-option>
                      </el-select>
                    </basic-form-item>
                  </template>
                </el-col>
                <el-col :span="12">
                  <template v-if="netType === 1">
                    <basic-form-item prop="subnetId" validate="required" label-width="8px">
                      <el-select v-model="addData.configs.subnetId" filterable clearable>
                        <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name + '(' + item.subnetUuid + ')'" :value="item.id"></el-option>
                      </el-select>
                    </basic-form-item>
                  </template>
                </el-col>
              </el-row>
            </template>
            <basic-form-item label="IP版本: " prop="ipAddressType" validate="required">
              <el-radio-group v-model="addData.configs.ipAddressType">
                <el-radio-button label="ipv4">IPV4</el-radio-button>
              </el-radio-group>
            </basic-form-item>
            <basic-form-item label="计费方式: " prop="internetChargeType" validate="required">
              <el-radio-group v-model="addData.configs.internetChargeType">
                <el-radio-button label="paybytraffic">按使用流量计费</el-radio-button>
                <el-radio-button label="paybybandwidth" v-if="addData.configs.scheme !== 'intranet'">按固定带宽计费</el-radio-button>
              </el-radio-group>
            </basic-form-item>
            <template v-if="addData.configs.internetChargeType === 'paybybandwidth'">
              <basic-form-item label="带宽值: " prop="broadbandValues" validate="required" @change="changebbv">
                <el-input-number v-model="addData.configs.broadbandValues" :min="0" :max="5120"></el-input-number>
              </basic-form-item>
            </template>
          </el-col>
        </el-row>
      </div>
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>云配置信息</h5>
        <el-row :gutter="20">
          <el-col :span="10">
            <basic-form-item label="名称：" validate="required" prop="name">
              <el-input v-model="addData.configs.name" placeholder="请输入名称" class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </div>
    </basic-form>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import { add, element } from './../data/publicInit'
import { cloneDeep } from 'lodash-es'
import { getRegionZone, getVpc, getSubnet } from 'services/platform/index'
import { getResource } from 'services/platform/azure.js'
import { getShoppingCartDetail } from 'services/system/shop_cart'

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
  components: { CommonWrapper },
  props: {
    type: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      specList,
      elements: [
        {
          ...element,
          name: '负载均衡',
          serviceCode: 'network.aliyun.slb',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'network.aliyun.slb',
        configs: {
          resourceLabel: [],
          feeType: 0,
          availabilityZones: [
            {
              master: '',
              slave: ''
            }
          ],
          internetChargeType: 'paybytraffic',
          ipAddressType: 'ipv4',
          scheme: 'internet',
          vpcId: '',
          subnetId: ''
        }
      },
      currentZone: {
        slaveZones: []
      },
      netType: 1,
      zoneList: [],
      subnetList: [],
      vpcList: [],
      rgroupList: [],
      retention: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      const { elements } = this.retention
      const [first, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        }
      ]
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then(data => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          const { elements } = this.retention
          const [first, ...others] = elements
          this.elements = [
            {
              ...element,
              ...first
            }
          ]
        }
      })
    } else {
      this.addData = {
        ...add,
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'network.aliyun.slb',
        configs: {
          feeType: 0,
          availabilityZones: [
            {
              master: '',
              slave: ''
            }
          ],
          internetChargeType: 'paybytraffic',
          ipAddressType: 'ipv4',
          scheme: 'internet',
          vpcId: '',
          subnetId: ''
        }
      }
    }
  },
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.location.vendorType)
    }
  },
  methods: {
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.addData.configs.availabilityZones[0].master = this.addData.location.az
          data = true
        }
      })
      return data
    },
    getZone() {
      if (!this.addData.location.regionId) return
      getRegionZone(this.addData.location.regionId, {
        type: 'SLB',
        vendorId: this.addData.location.vendorId
      }).then(data => {
        if (data.success) {
          this.zoneList = data.data
          this.changeMaster()
        }
      })
    },
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.vpcList = data.data.rows
          if (this.addData.configs.vpcId) this.getSubnet()
        }
      })
    },
    getSubnet() {
      const vpc = this.vpcList.find(item => item.id === this.addData.configs.vpcId)
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([
          {
            param: {
              vendorId: this.addData.location.vendorId,
              zone: this.addData.location.az,
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
        vendorId: this.addData.configs.vendorId
      })
      getResource(params).then(data => {
        if (data.success) {
          this.rgroupList = data.data.rows
        }
      })
    },
    changeRegion() {
      if (this.retention && this.retention.location.region != this.addData.location.region) {
        this.addData.configs.vpcId = ''
        this.addData.configs.subnetId = ''
      }
      this.getZone()
      this.getVpc()
      this.getRgroup()
    },
    changeMaster() {
      this.addData.configs.availabilityZones[0].slave = ''
      if (this.zoneList.length == 0) return
      this.currentZone = this.zoneList.find(item => item.zoneId === this.addData.location.az) || { slaveZones: [] }
    },
    changeVpc(val) {
      this.addData.configs.subnetId = ''
      this.getSubnet()
    },
    changebbv() {
      this.addData.configs.broadbandValue = this.addData.configs.broadbandValues < 1 ? -1 : this.addData.configs.broadbandValues
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
