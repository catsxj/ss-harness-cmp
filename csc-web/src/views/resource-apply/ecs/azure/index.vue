/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="getList" ref="common" :elements="elements" :showCount="vmData.volumeIds.length == 0" :get-params="getParams" :price="price" vendorType="AZURE">
    <div class="item-block">
      <h5></h5>
      <basic-form :model="vmData" ref="addForm" label-position="left" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="资源组：" prop="resourceGroupId" validate="required" required-message="该字段为必填字段">
              <el-select v-model="vmData.resourceGroupId" @change="changeResource" class="basic-cmp">
                <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
              <br />
              <el-button type="text" @click="goResourceGroupCreate" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)">新增</el-button>
              <el-button type="text" @click="getResource" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)">刷新</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <ImageItem :add-data="vmData" v-if="addData.location.vendorId" :vendor-id="addData.location.vendorId" :regionId="addData.location.region" @backSize="setSize"></ImageItem>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="所属网络：" prop="vpcId" validate="required">
              <el-select v-model="vmData.vpcId" @change="getSubnet" class="basic-cmp">
                <el-option v-for="item in networkList" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
              <br />
              <el-button type="text" @click="goVpcCreate" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)">新增</el-button>
              <el-button type="text" @click="getVpc" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)">刷新</el-button>
            </basic-form-item>
          </el-col>
          <!-- :disabled="item.name.indexOf('GatewaySubnet') > -1 || item.name.indexOf('BastionSubnet') > -1 || item.name.indexOf('FirewallSubne') > -1" -->
          <el-col :span="12">
            <basic-form-item label="所属子网：" prop="subnetId" validate="required">
              <el-select v-model="vmData.subnetId" class="basic-cmp">
                <el-option
                  v-for="item in subnetList"
                  :label="item.name + '(' + item.cidr + ')'"
                  :value="item.id"
                  :key="item.id"
                  :disabled="item.name.indexOf('GatewaySubnet') > -1 || item.name.indexOf('BastionSubnet') > -1 || item.name.indexOf('FirewallSubnet') > -1 || item.name.indexOf('FirewallManagementSubnet') > -1"
                ></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <basic-form-item label="实例类型：" prop="flavorFamily" validate="required" required-message="该字段为必填字段">
              <el-select v-model="vmData.flavorFamily" filterable @change="getFlavorData" class="basic-cmp">
                <el-option v-for="(item, index) in flavorData" :label="item.name" :value="item.value" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="20" v-if="vmData.flavorFamily">
            <basic-form-item label="实例规格：" prop="flavorId">
              <smart-table :data="flavorList" :rows="10">
                <el-table-column label="名称" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-radio @change="setElement" v-model="vmData.flavorId" :label="scope.row.id">{{ scope.row.name + '(' + scope.row.cpu + 'C/' + scope.row.memory + 'GB' + ')' }}</el-radio>
                  </template>
                </el-table-column>
              </smart-table>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="缓冲设置：" prop="systemDiskCaching" validate="required" required-message="该字段为必填字段">
              <el-radio-group v-model="vmData.systemDiskCaching">
                <el-radio-button :label="item.value" v-for="(item, index) in cachingData" :key="index">{{ item.name }}</el-radio-button>
              </el-radio-group>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="系统盘名：" prop="systemDiskName" validate="required">
              <el-input v-model="vmData.systemDiskName" class="basic-cmp"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="6">
            <basic-form-item label="磁盘类别：" prop="systemDiskCategory" validate="required">
              <el-select v-model="vmData.systemDiskCategory" @change="getDiskPrice">
                <el-option v-for="item in categoryData" :label="item.name" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="6">
            <basic-form-item label="容量(GB)：">
              <el-select v-model="currentElement.insAmount" @change="diskPrice = setPrice(sizeList.find(item => item.size == currentElement.insAmount))">
                <el-option :disabled="item.size < minSize" v-for="(item, index) in sizeList" :label="item.size < minSize ? item.skuName + `(${item.size}GB)(该大小不支持所选镜像所需最小值)` : item.skuName + `(${item.size}GB)`" :value="item.size" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <basic-form-item label="数据盘：" prop="volumeIds">
              <el-select v-model="vmData.volumeIds" multiple class="basic-cmp">
                <el-option v-for="item in volumeList" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
              <br />
              <el-button type="text" @click="goVolumeCreate" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)">新增</el-button>
              <el-button type="text" @click="getVolume" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)">刷新</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="弹性IP：" prop="isUsePublicIp">
              <el-checkbox v-model="vmData.isUsePublicIp"></el-checkbox>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="可用性选项：">
              <el-select v-model="availabilitySetValue" class="basic-cmp">
                <el-option label="无需基础结构冗余" value="none"></el-option>
                <el-option label="可用性区域（在区域中以物理方式分割你的资源）" value="zone"></el-option>
                <el-option label="可用性集（自动跨多个容错域分发VM）" value="id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="availabilitySetValue == 'zone'" key="zone">
            <basic-form-item label="可用性区域：" prop="availabilityZoneIds" validate="required">
              <el-select v-model="vmData.availabilityZoneIds" clearable class="basic-cmp">
                <el-option v-for="(item, index) in availabilityZoneIds" :label="item" :value="item" :key="index"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="availabilitySetValue == 'id'" key="availabilitySetId">
            <basic-form-item label="可用性集：" prop="availabilitySetId" validate="required">
              <el-select v-model="vmData.availabilitySetId" class="basic-cmp">
                <el-option v-for="item in availabilitySetList" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
              <br />
              <el-button type="text" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)" @click="openResourceDialog('set')">新增</el-button>
              <el-button type="text" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)" @click="getSet">刷新</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="安全组：">
              <el-radio-group v-model="IsSecurityGroup" @change="handleSecurityGroup">
                <el-radio :label="false">无</el-radio>
                <el-radio :label="true">高级</el-radio>
              </el-radio-group>
            </basic-form-item>
          </el-col>
          <el-col>
            <basic-form-item prop="securityGroupId" v-if="IsSecurityGroup">
              <el-select v-model="vmData.securityGroupId" clearable>
                <el-option v-for="item in groupList" :label="item.name" :value="item.id" :key="item.value"></el-option>
              </el-select>
              <el-button type="text" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)" @click="openResourceDialog('group')">新增</el-button>
              <el-button type="text" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)" @click="getGroup">刷新</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <!-- <el-row :gutter="20">
        <el-col :span="12">
          <basic-form-item label="负载均衡器：" prop="slbId">
            <el-select v-model="vmData.slbId">
              <el-option v-for="item in slbList" :label="item.name" :value="item.id"
                          :key="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-row> -->
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="云主机名称：" validate="required,hicNoChinese" prop="name">
              <el-input v-model="vmData.name" placeholder="请输入云主机名" class="basic-cmp"></el-input>
              <div class="tip">设置云主机名称前缀</div>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <account :add-data="vmData"></account>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="登录方式：">
              <el-radio-group v-model="login">
                <el-radio :label="item.name" :key="index" v-for="(item, index) in loginWays" border> {{ item.name }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="login == '密钥'" key="key">
          <el-col :span="12">
            <basic-form-item label="密钥：" validate="required" prop="keypairId">
              <el-select v-model="vmData.keypairId" class="basic-cmp">
                <el-option v-for="item in keypairList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-button type="text" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)" @click="openResourceDialog('key')">新增</el-button>
              <el-button type="text" :disabled="!(addData.location.vendorId && addData.location.region && vmData.resourceGroupId)" @click="getKey">刷新</el-button>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="login == '密码'" key="password">
          <vm-pas :add-data="vmData"></vm-pas>
        </el-row>
        <el-row>
          <el-col :span="24" v-if="vmData.PopularWindowsImage">
            <basic-form-item>
              <el-checkbox v-model="licenseType">是否使用 Windows Server 许可证?</el-checkbox>
            </basic-form-item>
          </el-col>
        </el-row>
        <!-- </div> -->
      </basic-form>
    </div>
    <div slot="preview-card">
      <basic-form-item label="规格：" v-if="vmData.flavorId">{{ currentElement.cpu + 'C/' + currentElement.memory + 'GB/' + currentElement.insAmount + 'GB' }}</basic-form-item>
      <basic-form-item label="密钥：" v-if="vmData.keypairName">{{ vmData.keypairName }}</basic-form-item>
      <basic-form-item label="规格价格：" v-if="price">{{ (price * this.addData.emption.count).toFixed(2) }}元/月</basic-form-item>
      <basic-form-item label="磁盘价格：" v-if="diskPrice && vmData.systemDiskCategory"
        >{{ (diskPrice * this.addData.emption.count).toFixed(2) }}元/月
        <el-tooltip class="item" effect="dark" placement="top-start">
          <div slot="content">高级SSD：生产和性能敏感型工作负荷方案,最大吞吐量 900MB/秒,最大IOPS 20000<br /></div>
          <div slot="content">标准SSD：Web服务器、不常使用的企业应用程序和开发/测试方案,最大吞吐量 750MB/秒,最大IOPS 6000<br /></div>
          <div slot="content">标准HDD：备份、非关键、不常访问方案,最大吞吐量 500 MB/秒,最大IOPS 2000<br /></div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </basic-form-item>
      <basic-form-item label="弹性IP价格：" v-if="vmData.isUsePublicIp"
        >{{ (eipPrice * this.addData.emption.count * 730).toFixed(2) }}元/月
        <el-tooltip class="item" effect="dark" placement="top-start">
          <div slot="content">使用的时长不足1小时，按1小时收费，月结按730小时计算<br />最终费用以实际使用量为准</div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </basic-form-item>
      <basic-form-item label="预估总价：" v-if="price && diskPrice">{{ ((price + diskPrice + (vmData.isUsePublicIp ? eipPrice : 0)) * this.addData.emption.count).toFixed(2) }}元/月</basic-form-item>
    </div>
    <resource :add-data="resourceDialog" v-if="resourceDialog.dialog" @backGroup="getGroup" @backKey="getKey" @backSet="getSet"></resource>
    <vpc :dialog="vpcDialog" v-if="vpcDialog.dialog" @back="getVpc"></vpc>
    <volume :dialog="volumeDialog" v-if="volumeDialog.dialog" @back="getVolume"></volume>
    <group :add-data="ResourceGroupData" v-if="ResourceGroupData.dialog" @back="getResource"></group>
  </common-wrapper>
</template>

<script>
import CommonWrapper from 'views/resource-apply/components/PublicCommonWrapper.vue'
import ImageItem from './image.vue'
import { add, element } from '../../data/publicInit'
import { getGroup, getFlavor, getVpc, getSubnet, getKey, getDict, getVolume, getDictChildren } from 'services/platform/index'
import { getResource, getSet, getLb, getPublicIpsUnused, getAzurePrice, getPirce, getEipPirce, getVolumePirce } from 'services/platform/azure'
import crypto from 'utils/crypto'
import vmPas from './vmPasPopover.vue'
import account from './accountValidate.vue'
import resource from './resource.vue'
import vpc from './vpc.vue'
import volume from './volume.vue'
import group from './group.vue'
import { cloneDeep } from 'lodash-es'
import { getTenantServicesItems } from 'services/services/catelog'
export default {
  components: { CommonWrapper, ImageItem, vmPas, account, resource, vpc, volume, group },
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
      elements: [
        {
          ...element,
          name: '云主机',
          serviceCode: 'azure.standard.server',
          main: true,
          insAmount: '',
          cpu: 0,
          memory: 0
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'azure.standard.server',
        configs: {
          systemDiskSize: 50,
          osCategory: '',
          osVersion: ''
        }
      },
      categoryData: [
        { name: '标准 HDD', value: 'Standard_LRS' },
        { name: '标准 SSD', value: 'StandardSSD_LRS' },
        { name: '高级 SSD', value: 'Premium_LRS' }
        // { name: '超级 SSD', value: 'UltraSSD_LRS' }
      ],
      cachingData: [
        { name: '无', value: 'NONE' },
        { name: '只读', value: 'READ_ONLY' },
        { name: '只写', value: 'READ_WRITE' }
      ],
      vmData: {
        vpcId: '',
        subnetId: '',
        name: '',
        confirm_password: '',
        password: '',
        flavorId: '',
        availabilitySetId: '',
        systemDiskCaching: 'NONE',
        isUsePublicIp: false,
        systemDiskCategory: 'StandardSSD_LRS',
        volumeIds: []
      },
      networkList: [],
      subnetList: [],
      minSize: 0,
      resourceData: [],
      flavorData: [],
      flavorList: [],
      imageType: '公共镜像',
      imageTypeList: [
        { name: '公共镜像', value: '1' },
        { name: '通用镜像', value: '2' }
      ],
      availabilitySetList: [],
      groupList: [],
      slbList: [],
      login: '密钥',
      loginWays: [{ name: '密钥' }, { name: '密码' }],
      keypairList: [],
      publicIpAddressList: [],
      resourceDialog: {
        dialog: false,
        data: {}
      },
      price: 0,
      diskPrice: 0,
      eipPrice: 0,
      discount: 0,
      licenseType: false,
      dictDisCount: {
        name: 1
      },
      sizeList: [],
      vpcDialog: {
        dialog: false,
        data: {}
      },
      volumeDialog: {
        dialog: false,
        data: {}
      },
      availabilitySetValue: 'none',
      availabilityZoneIds: [],
      volumeList: [],
      IsSecurityGroup: false,
      ResourceGroupData: {
        dialog: false,
        data: {}
      }
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    },
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    getTenantServicesItems(this.userData.tenantId || this.userData.id).then(data => {
      if (data.success) {
        const obj = data.data.find(item1 => item1.serviceCode == 'azure.standard.server')
        this.discount = obj.discount
      }
    })
    this.getDisCount()
  },
  methods: {
    goResourceGroupCreate() {
      this.ResourceGroupData = {
        dialog: true,
        data: {}
      }
    },
    goVpcCreate() {
      const obj = this.resourceData.find(item => this.vmData.resourceGroupId == item.id)
      this.vpcDialog = {
        dialog: true,
        data: {
          ...this.addData,
          resourceGroupId: obj.id
        }
      }
    },
    goVolumeCreate() {
      const obj = this.resourceData.find(item => this.vmData.resourceGroupId == item.id)
      this.volumeDialog = {
        dialog: true,
        data: {
          ...this.addData,
          azureResourceGroupName: obj.name
        }
      }
    },
    openResourceDialog(type) {
      const obj = this.resourceData.find(item => this.vmData.resourceGroupId == item.id)
      this.resourceDialog = {
        dialog: true,
        type: type,
        data: {
          vendorId: this.addData.location.vendorId,
          regionId: this.addData.location.region,
          resourceGroupId: obj.id
        }
      }
    },
    getVolume() {
      getVolume({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region, status: 'AVAILABLE' }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.volumeList = data.data.rows
          if (this.vmData.volumeIds) this.vmData.volumeIds = []
        }
      })
    },
    getKey() {
      getKey({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.keypairList = data.data.rows
          if (this.vmData.keypairId) this.vmData.keypairId = ''
        }
      })
    },
    getPublicIps() {
      getPublicIpsUnused({ vendorId: this.addData.location.vendorId, regionId: this.addData.location.region, resourceGroupId: this.vmData.resourceGroupId }).then(data => {
        if (data.success) {
          this.publicIpAddressList = data.datas
        }
      })
    },
    getResource() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          this.resourceData = data.data.rows
          if (this.resourceData.length) {
            this.$set(this.vmData, 'resourceGroupId', this.resourceData[0].id)
            this.changeResource()
          }
        }
      })
    },
    getSet() {
      if (this.vmData.availabilitySetId) this.vmData.availabilitySetId = ''
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }
      getSet(params).then(data => {
        if (data.success) {
          this.availabilitySetList = data.data.rows
          if (this.availabilitySetList.length) {
            this.$set(this.vmData, 'availabilitySetId', this.availabilitySetList[0].id)
          }
        }
      })
    },
    getLb() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, resourceGroupId: this.vmData.resourceGroupId }, sign: 'EQ' }])
      }
      getLb(params).then(data => {
        if (data.success) {
          this.slbList = data.data.rows
          if (this.vmData.slbId) this.vmData.slbId = ''
        }
      })
    },
    getGroup() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }
      getGroup(params).then(data => {
        if (data.success) {
          this.groupList = data.data.rows
          if (this.vmData.securityGroupId) this.vmData.securityGroupId = ''
        }
      })
    },
    handleSecurityGroup() {
      if (this.vmData.securityGroupId) this.vmData.securityGroupId = ''
    },
    setElement() {
      this.flavorList.forEach(item => {
        if (item.id == this.vmData.flavorId) {
          this.$set(this.currentElement, 'cpu', item.cpu)
          this.$set(this.currentElement, 'memory', item.memory)
          this.availabilityZoneIds = JSON.parse(item.availabilityZoneIds)
        }
      })
      getAzurePrice({ flavorId: this.vmData.flavorId, osCategory: this.vmData.popularLinuxImage ? 'LINUX' : 'WINDOWS' }).then(data => {
        if (data.success) {
          this.price = data.data.length ? data.data[0].unitPrice * Number(this.dictDisCount.name) * 730 : 0
        }
      })
    },
    getDiskPrice() {
      this.sizeList = []
      this.currentElement.insAmount = ''
      getVolumePirce({
        category: this.vmData.systemDiskCategory,
        regionId: this.addData.location.region
      }).then(data => {
        if (data.success) {
          this.sizeList = data.data
          const obj = { unitPrice: 0, ...this.sizeList.find(item => item.size > this.minSize) }
          this.currentElement.insAmount = obj.size
          this.diskPrice = this.setPrice(obj)
        }
      })
    },
    setPrice(obj) {
      return obj.unitPrice * this.dictDisCount.name
    },
    getEipPrice() {
      getEipPirce({
        regionId: this.addData.location.region,
        category: 'static',
        sku: 'Global'
      }).then(data => {
        if (data.success) {
          const obj = { unitPrice: 0, ...data.data.find(item => item.unitPrice) }
          this.eipPrice = obj.unitPrice * this.dictDisCount.name
        }
      })
    },
    getDisCount() {
      getDict().then(data => {
        if (data.success) {
          this.dictDisCount = data.data.find(item => item.value == 'PARITIES')
        }
      })
    },
    setSize(data) {
      console.log(data)
      if (this.vmData.flavorId) this.setElement()
      if (data >= 127) {
        this.loginWays = [{ name: '密码' }]
        this.login = '密码'
      } else {
        this.loginWays = [{ name: '密钥' }, { name: '密码' }]
      }
      const obj = this.sizeList.find(item => item.size >= data) || { size: '' }
      this.$set(this.currentElement, 'insAmount', obj.size || '')
      this.minSize = data
    },
    getParams() {
      if (!this.vmData.flavorId) {
        this.$message.error('请选择规格')
        return false
      }
      let data = false
      this.$refs.addForm.validate(valid => {
        if (valid) {
          if (!this.currentElement.insAmount) return this.$message.error('请选择容量大小')
          if (this.vmData.volumeIds.length > 0) this.addData.emption.count = 1
          const { keypairId, password, confirm_password, systemDiskSize, availabilityZoneIds, availabilitySetId, ...other } = this.vmData
          const result = {
            ...other,
            regionId: this.addData.location.region,
            zoneId: this.addData.location.az,
            discount: this.discount,
            basicPrice: this.price,
            finalPrice: this.price * this.discount
          }
          if (this.availabilitySetValue == 'zone') {
            result.availabilityZoneIds = JSON.stringify([availabilityZoneIds])
            if (this.addData.configs.availabilitySetId) delete this.addData.configs.availabilitySetId
          } else if (this.availabilitySetValue == 'id') {
            result.availabilitySetId = availabilitySetId
            if (this.addData.configs.availabilityZoneIds) delete this.addData.configs.availabilityZoneIds
          }
          if (this.licenseType && this.vmData.PopularWindowsImage) result.licenseType = 'Windows_Server'
          if (result.popularLinuxImage || result.PopularWindowsImage) {
            this.addData.configs.osCategory = ''
            this.addData.configs.osVersion = ''
            this.addData.configs.imageId = ''
          } else {
            if (!this.addData.configs.imageId && !result.imageId) {
              data = false
              this.$message.error('未找到合适的镜像，请重新选择')
              return
            }
            result.popularLinuxImage = ''
            result.PopularWindowsImage = ''
          }
          if (this.login == '密钥') {
            result.keypairId = keypairId
          } else {
            if (password !== confirm_password) return this.$message.error('两次密码输入不一致')
            result.password = crypto.encrypt(password)
          }
          if (this.IsSecurityGroup == false) delete result.securityGroupId
          if (result.flavorFamily) delete result.flavorFamily
          data = result
        }
      })
      return data
    },
    getFlavors() {
      // const params = {
      //   page: 1,
      //   rows: 9999,
      //   params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region, status: 'IN_USE', available: true }, sign: 'EQ' }])
      // }
      // getFlavor(params).then(data => {
      //   if (data.success) {
      //     this.flavorList = data.data.rows
      //     if (this.vmData.flavorId) this.vmData.flavorId = ''
      //   }
      // })
      getDictChildren({ value: 'FLAVORFAMILY' }).then(data => {
        if (data.success) {
          this.flavorData = data.data
        }
      })
    },
    getFlavorData() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region, status: 'IN_USE', available: true, family: this.vmData.flavorFamily }, sign: 'EQ' }])
      }
      getFlavor(params).then(data => {
        if (data.success) {
          this.flavorList = data.data.rows
          if (this.vmData.flavorId) this.vmData.flavorId = ''
        }
      })
    },
    changeResource() {
      // this.getPublicIps()
      this.getVpc()
      this.getGroup()
      // this.getLb()
      this.getKey()
      this.getVolume()
    },
    getList() {
      this.getEipPrice()
      if (this.vmData.systemDiskCategory) this.getDiskPrice()
      this.getFlavors()
      this.getResource()
      this.getSet()
    },
    getVpc() {
      const obj = this.resourceData.find(item => this.vmData.resourceGroupId == item.id)
      if (this.vmData.vpcId) this.vmData.vpcId = ''
      getVpc({
        simple: true,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.networkList = data.data.rows
          if (this.networkList.length) {
            this.$set(this.vmData, 'vpcId', this.networkList[0].id)
            this.subnetList = []
            this.getSubnet()
          } else {
            this.subnetList = []
            this.vmData.subnetId = ''
          }
        }
      })
    },
    getSubnet() {
      // let id = ''
      // this.networkList.forEach(item => {
      //   if (item.id == this.vmData.vpcId) id = item.vpcId
      // })
      this.vmData.subnetId = ''
      const params = JSON.stringify([
        {
          param: {
            vendorId: this.addData.location.vendorId,
            networkId: this.vmData.vpcId
          },
          sign: 'EQ'
        }
      ])
      getSubnet({
        page: 1,
        rows: 9999,
        params
      }).then(data => {
        if (data.success) {
          this.subnetList = data.data.rows
          if (this.subnetList.length) {
            const obj = this.subnetList.find(item => item && item.name.indexOf('GatewaySubnet') == -1 && item.name.indexOf('BastionSubnet') == -1 && item.name.indexOf('FirewallSubne') == -1 && item.name.indexOf('FirewallManagementSubnet') == -1)
            this.$set(this.vmData, 'subnetId', obj.id || '')
          }
        }
      })
    }
  },
  watch: {
    // 后端特殊要求
    'elements.0.insAmount'() {
      this.addData.configs.systemDiskSize = this.currentElement.insAmount
      this.vmData.cpu = this.currentElement.cpu
      this.vmData.memory = this.currentElement.memory
    },
    'vmData.systemDiskCategory'() {
      this.currentElement.category = this.vmData.systemDiskCategory
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../index.scss';
</style>
