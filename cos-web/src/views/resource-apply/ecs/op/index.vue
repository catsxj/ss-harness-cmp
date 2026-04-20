/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="getList" ref="common" :elements="elements" :get-params="getParams" :loading="loading" vendorType="OPENSTACK" :item-data="retention" v-bind="$attrs">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <el-form-item label="可用区域：" required>
        <el-radio-group v-model="vmData.region">
          <el-radio-button :label="item.regionId" :key="index" v-for="(item, index) in regionData" border> {{ item.regionId }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <basic-form-item label="OP项目：" prop="configs.tenantUuid" validate="required" v-if="!noTask" key="tenantUuid">
        <el-select v-model="addData.configs.tenantUuid" placeholder="请选择OpenStack项目" clearable filterable>
          <el-option v-for="(item, index) in projectList" :key="index" :value="item.tenantUuid" :label="item.name"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="机型：">
        <el-radio-group v-model="currentElement.categoryId" @change="getSku(currentElement)">
          <el-radio-button :label="item.id" v-for="(item, index) in currentElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="配置：" validate="required">
        <sku-table :skus="currentElement.skuList" style="max-width: 800px" :mode="addData.emption.duration.mode" :show-price="true">
          <el-table-column show-overflow-tooltip label="规格名称" prop="name">
            <template v-slot="scope">
              <el-radio v-model="currentElement.skuId" :label="scope.row.id">{{ scope.row.code }}</el-radio>
            </template>
          </el-table-column>
        </sku-table>
      </basic-form-item>
      <basic-form-item label="系统盘类型：">
        <el-radio-group v-model="systemElement.categoryId" @change="getSku(systemElement)">
          <el-radio-button :label="item.id" v-for="(item, index) in systemElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
        </el-radio-group>
        <el-select v-model="systemElement.skuId" class="w m-l-md" @change="changeSize">
          <el-option :label="generateSpec(item.spec)" v-for="item in systemElement.skuList" :key="item.id" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <ImageItem :add-data="addData" v-if="addData.location.vendorId"></ImageItem>
    </div>
    <template v-if="noTask">
      <!-- <el-divider></el-divider> -->
      <div class="item-block">
        <h5>网络信息</h5>
        <basic-form-item label="网络：" validate="required">
          <network :network-list="list" ref="network" :item-data="retention" v-if="addData.location.vendorId" :location="addData.location"></network>
        </basic-form-item>
      </div>
    </template>
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>云主机信息</h5>
      <basic-form :model="vmData" ref="addForm" label-position="left">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="登陆方式：">
              <el-radio-group v-model="vmData.login" @change="chooseLoginWay">
                <el-radio :label="item.name" :key="index" v-for="(item, index) in loginWays" border> {{ item.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="vmData.login == '密钥'">
          <el-col :span="10">
            <basic-form-item label="密钥：" validate="required" prop="keypairName">
              <el-select v-model="vmData.keypairName" class="basic-cmp">
                <el-option v-for="item in keypairList" :key="item.id" :label="item.name" :value="item.name"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="vmData.login == '密码'">
          <el-col :span="12">
            <basic-form-item label="密码设置：" validate="required" prop="password">
              <el-input v-model="vmData.password" placeholder="请输入密码" show-password class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="确认密码：" validate="required" prop="confirm_password">
              <el-input v-model="vmData.confirm_password" placeholder="请确认密码" show-password class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="noTask">
          <el-col :span="10">
            <basic-form-item label="安全组：" validate="required" prop="groups">
              <el-select v-model="vmData.groups" multiple placeholder="请选择" class="basic-cmp">
                <el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.groupUuid"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <rule :add-data="vmData"></rule>
        </el-row>
      </basic-form>
    </div>
    <div slot="preview-card">
      <basic-form-item label="规格：">{{ specArray.map((item) => `${item.specValue}${item.unit}`).join('/') }}</basic-form-item>
      <basic-form-item label="系统盘容量：">{{ this.size }}</basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/CommonWrapper.vue'
import ImageItem from '../ImageItem.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import network from '../components/setnetwork/index.vue'
import { conditionNetwork, getKey, getGroup, getRegionCondition } from 'services/platform/index'
import crypto from 'utils/crypto'
import { cloneDeep } from 'lodash-es'
import { generateSpec, getSpecValue } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import { getOsTenant } from 'services/system/tenant'
import rule from '../namerule.vue'

export default {
  components: { CommonWrapper, ImageItem, network, rule },
  mixins: [sku],
  props: {
    type: {
      type: String
    },
    itemData: {
      type: [Object, Boolean]
    },
    noTask: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      elements: [
        {
          ...element,
          name: '云主机',
          serviceCode: 'openstack.standard.server',
          main: true
        },
        {
          ...element,
          name: '云硬盘',
          serviceCode: 'openstack.standard.volume'
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'openstack.standard.server',
        configs: {
          resourceLabel: [],
          diskCategoryId: '',
          osCategory: '',
          osVersion: ''
        }
      },
      vmData: {
        name: '',
        confirm_password: '',
        password: '',
        keypairName: '',
        login: '密钥',
        groups: []
      },
      list: [],
      loginWays: [{ name: '密钥' }, { name: '密码' }],
      keypairList: [],
      groupList: [],
      regionData: [],
      retention: false,
      projectList: [],
      size: '10GB'
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    },
    systemElement() {
      return this.elements[1]
    },
    specArray() {
      const { skuList, skuId } = this.currentElement
      const item = skuList.find((item) => item.id === skuId)
      if (!item) return []
      const result = item.spec
      return result
    }
  },
  async created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.handleShowData()
    } else if (this.$route.query.id) {
      const res = await getShoppingCartDetail(this.$route.query.id)
      if (res.success) {
        this.retention = JSON.parse(res.data.inventory)
        this.handleShowData()
      }
    }
  },
  watch: {
    // 后端特殊要求
    'elements.1.categoryId'() {
      this.addData.configs.diskCategoryId = this.elements[1].categoryId
    }
  },
  methods: {
    changeSize(val) {
      this.size = this.systemElement.skuList.find((item) => item.id == val)?.code?.split('-')[2] + 'GB' || '10GB'
    },
    generateSpec,
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    handleShowData() {
      this.addData = cloneDeep(this.retention)
      const { name, password, keypairName, groups, login, region, nameruleId } = this.addData.configs
      this.vmData = {
        region,
        name: name,
        keypairName: keypairName,
        groups: groups,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password),
        login: login,
        nameruleId
      }
      const { configs, elements } = this.retention
      const [first, two] = elements
      this.elements = [
        {
          ...element,
          ...first
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'openstack.storage.volume',
          ...two
        }
      ]
      setTimeout(() => {
        this.initLoad()
      })
    },
    getParams() {
      let data = false
      if (!this.ok()) return
      const { password, confirm_password, ...other } = this.ok()
      if (this.vmData.login == '密码' && password !== confirm_password) {
        data = false
        this.$message.error('两次密码输入不一致')
        return
      }
      const result = {
        ...other,
        password: crypto.encrypt(password),
        categoryId: this.currentElement.categoryId
      }
      data = result
      return data
    },
    ok() {
      let obj = false
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          if (!this.addData.configs.imageId) {
            obj = false
            this.$message.error('未找到合适的镜像，请重新选择')
            return
          }
          const { skuList, skuId } = this.currentElement
          const item = skuList.find((item) => item.id === skuId)
          obj = Object.assign({ networks: [], skutId: item.id, cpu: item.spec[0].specValue, memory: item.spec[1].specValue, ...getSpecValue(this.systemElement) }, this.vmData)
          if (!this.noTask) return
          let countFlag = false
          const networkList = this.$refs.network.ok()
          const idList = []
          obj.networkList = networkList
          networkList.forEach((item) => {
            if (!item.detail.dhcpEnabled) this.dhcpList.push(item.detail.name)
            if (idList.indexOf(item.id) == -1) {
              const obj1 = {
                networkId: item.id,
                networkName: item.networkName,
                addresses: []
              }
              const listObj = {
                networkId: item.id,
                subnetId: item.subnetId,
                subnetName: item.subnetName
              }
              if (item.ip) listObj.address = item.ip
              obj1.addresses.push(listObj)
              if (item.switch) countFlag = true
              idList.push(item.id)
              obj.networks.push(obj1)
            } else {
              if (item.switch) countFlag = true
              obj.networks.forEach((item1) => {
                if (item1.networkId == item.id) {
                  const obj1 = {
                    networkId: item.id,
                    subnetId: item.subnetId,
                    subnetName: item.subnetName
                  }
                  if (item.ip) obj1.address = item.ip
                  item1.addresses.push(obj1)
                }
              })
            }
          })
          if (obj.networks.length == 0) {
            obj = false
            this.$message.error('请选择网络')
            return
          }
          if (parseInt(this.addData.emption.count) > 1 && countFlag) {
            obj = false
            this.$notify({
              title: '提示',
              message: '已指定云主机ip的情况下，只能订购1台主机',
              type: 'error'
            })
            return
          }
          this.dhcpList = []
          if (this.dhcpList.length == 0) {
            obj.DhcpFlag = true
          } else {
            // 提示
            let str = ''
            this.dhcpList.forEach(function (t) {
              str += t + ','
            })
            obj.str = str.substring(0, str.length - 1)
          }
        }
      })
      return obj
    },
    chooseLoginWay(item) {
      if (this.vmData.login == '密钥') {
        delete this.vmData.password
        delete this.vmData.endPassword
      } else if (this.vmData.login == '密码') {
        this.vmData.keypairName = ''
      }
    },
    getNetwork() {
      conditionNetwork({
        condition: 'networkAndSubnets',
        vendorId: this.addData.location.vendorId,
        tenantId: this.addData.location.tenantId
      }).then((data) => {
        if (data.success) {
          this.list = data.data
        }
      })
    },
    getKey() {
      getKey({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.keypairList = data.data.rows
        }
      })
    },
    // 获取安全组
    getGroupData() {
      getGroup({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, tenantId: this.addData.location.tenantId }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.groupList = data.data.rows
        }
      })
    },
    getRegion() {
      getRegionCondition({ poolGroupId: this.addData.location.poolGroupId, condition: 'listregionbygroup' }).then((data) => {
        if (data.success) {
          this.regionData = data.data
          this.$set(this.vmData, 'region', this.regionData.find((item) => item.regionId == this.vmData.region) ? this.vmData.region : data.data[0].regionId)
        }
      })
    },
    getList() {
      this.getKey()
      this.getRegion()
      if (!this.noTask) {
        getOsTenant({
          page: 1,
          rows: 999,
          params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
        }).then((data) => {
          if (data.success) {
            this.projectList = data.data.rows
          }
        })
      } else {
        this.getNetwork()
        this.getGroupData()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../index.scss';
</style>
