/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="getResource" ref="common" :elements="elements" :showCount="false" :getParams="getConfigs">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-col :span="12">
          <basic-form-item label="资源组：" prop="configs.resourceGroupId" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.configs.resourceGroupId">
              <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="名称：" prop="configs.name" validate="required,redisName" required-message="请输入名称" maxlength="63">
            <el-popover ref="popover" placement="right" trigger="hover">
              <div>
                <span v-if="addData.configs.name">
                  <i class="el-icon-check" v-if="popoverObj.length"></i>
                  <i class="el-icon-close" v-else></i>
                  <!-- <Icon type="icon-ok" style="color:#0fd59d" v-if="popoverObj.length" />
                  <Icon type="icon-icon-31" style="color:#d35e5c" v-else /> -->
                </span>
                长度为1到63位
              </div>
              <div>
                <span v-if="addData.configs.name">
                  <i class="el-icon-check" v-if="popoverObj.length"></i>
                  <i class="el-icon-close" v-else></i>
                  <!-- <Icon type="icon-ok" style="color:#0fd59d" v-if="popoverObj.length" />
                  <Icon type="icon-icon-31" style="color:#d35e5c" v-else /> -->
                </span>
                小写字母、数字和连字符
              </div>
            </el-popover>
            <el-input v-model="addData.configs.name" v-popover:popover @blur="checkNames"></el-input>
            <span style="font-size: 12px" class="pull-right">.redis.cache.windows.net</span>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格：" required>
            <el-select v-model="specId">
              <el-option v-for="(item, index) in specList" :key="index" :label="item.label" :value="item.value" :disabled="item.value.indexOf('Basic') > -1"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="详细规格：" required>
            <el-select v-model="sloId" @change="changeSku">
              <el-option v-for="(item, index) in sloList[specId]" :key="index" :label="item.skuFamily + item.value + item.content" :value="index"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <basic-form-item label="缓存类型：">
            <el-select v-model="sku" @change="changeSku">
              <el-option v-for="(item, index) in skuList" :key="index" :label="`${filter[item.skuName] + '   ' + item.skuFamily + item.value + item.content}`" :value="index"></el-option>
            </el-select>
          </basic-form-item>
        </el-col> -->
      </el-col>
      <el-col :span="24">
        <el-col :span="12">
          <basic-form-item label="非 TLS 端口：" prop="configs.enableNonSslPort" validate="required" label-width="160px">
            <el-checkbox v-model="addData.configs.enableNonSslPort">启用</el-checkbox>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="TLS 版本：" prop="configs.minimumTlsVersion" validate="required">
            <el-select v-model="addData.configs.minimumTlsVersion">
              <el-option label="1.0" value="1.0"></el-option>
              <el-option label="1.1" value="1.1"></el-option>
              <el-option label="1.2" value="1.2"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-col>
      <el-col :span="24" v-if="specId == 'Premium'">
        <el-col :span="12">
          <basic-form-item label="群集：">
            <el-checkbox v-model="shard">启用</el-checkbox>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="shard">
          <el-form-item prop="configs.shardCount" :rules="[{ required: true, message: '该选项不能为空' }]">
            <span slot="label">
              分片计数：
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">请选择群集中的分片数</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </span>
            <el-slider v-model="addData.configs.shardCount" :step="1" :min="1" :max="10" show-input show-stops> </el-slider>
            <span class="pull-right" style="fong-size: 12px">总大小:{{ sloList[specId].find((item, index) => sloId == index).size * addData.configs.shardCount }}GB</span>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-else>
          <el-form-item prop="configs.replicasPerMaster" :rules="[{ required: true, message: '该选项不能为空' }]">
            <span slot="label">
              副本计数：
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">默认情况下，对于每个部署，每个分片有一个副本。目前，对于具有多个副本的部署，持久性、群集和异地复制均被禁用。</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </span>
            <el-slider v-model="addData.configs.replicasPerMaster" :step="1" :min="1" :max="3" show-input show-stops> </el-slider>
          </el-form-item>
        </el-col>
      </el-col>
      <el-col :span="24">
        <el-col :span="12">
          <basic-form-item label="网络连接：">
            <el-radio-group v-model="networkJoin">
              <el-radio label="public">公共终结点</el-radio>
              <el-radio label="virtual" v-if="specId == 'Premium'">虚拟网络</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="networkJoin == 'public'">
          <basic-form-item label="是否允许访问此服务器的公共网络：" label-width="320px" prop="configs.publicNetworkAccess" validate="required">
            <el-checkbox v-model="addData.configs.publicNetworkAccess"></el-checkbox>
          </basic-form-item>
        </el-col>
      </el-col>
      <el-col :span="24" v-if="networkJoin == 'virtual'">
        <el-col :span="12">
          <basic-form-item label="VPC：" prop="configs.vpcId" validate="required">
            <el-select v-model="addData.configs.vpcId" @change="getSubnet">
              <el-option v-for="(item, index) in vpcList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="子网：" prop="configs.subnetId" validate="required">
            <el-select v-model="addData.configs.subnetId">
              <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="IP地址：" prop="configs.staticIp" validate="ip">
            <el-input v-model="addData.configs.staticIp"></el-input>
            <div style="font-size: 12px">若不指定IP地址，则自动分配</div>
          </basic-form-item>
        </el-col>
      </el-col>
    </el-row>
    <div slot="preview-card">
      <basic-form-item label="预估价格：">{{ priceData.unitPrice }}元/月</basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../components/PublicCommonWrapper.vue'
import { add, element } from '../data/publicInit'
import { getRegion, getVpc, getSubnet, getDict } from 'services/platform/index'
import { getResource, createRedis, chcekName, getRedisPirce } from 'services/platform/azure'
import { cloneDeep } from 'lodash-es'

export default {
  components: { CommonWrapper },
  data() {
    return {
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'azure.redis',
        configs: {
          resourceLabel: [],
          enableNonSslPort: false,
          minimumTlsVersion: '1.0',
          publicNetworkAccess: true,
          shardCount: 1,
          replicasPerMaster: 1
        }
      },
      elements: [
        {
          name: 'redis',
          serviceCode: 'azure.redis',
          ...element
        }
      ],
      popoverObj: {
        length: true,
        intension: true,
        indexOf: true
      },
      regionList: [],
      resourceData: [],
      loading: false,
      specId: 'Standard',
      sloId: 0,
      specList: [
        // { label: '基本', value: 'Basic' },
        { label: '标准', value: 'Standard' },
        { label: '高级', value: 'Premium' }
      ],
      sloList: {
        Basic: [
          { skuName: 'Basic', skuFamily: 'C', value: 0, content: '(250 MB 缓存)', size: 250 },
          { skuName: 'Basic', skuFamily: 'C', value: 1, content: '(1 GB 缓存)', size: 1 },
          { skuName: 'Basic', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存)', size: 2.5 },
          { skuName: 'Basic', skuFamily: 'C', value: 3, content: '(6 GB 缓存)', size: 6 },
          { skuName: 'Basic', skuFamily: 'C', value: 4, content: '(13 GB 缓存)', size: 13 },
          { skuName: 'Basic', skuFamily: 'C', value: 5, content: '(26 GB 缓存)', size: 26 },
          { skuName: 'Basic', skuFamily: 'C', value: 6, content: '(53 GB 缓存)', size: 53 }
        ],
        Standard: [
          { skuName: 'Standard', skuFamily: 'C', value: 0, content: '(250 MB 缓存, 复制)', size: 250 },
          { skuName: 'Standard', skuFamily: 'C', value: 1, content: '(1 GB 缓存 复制)', size: 1 },
          { skuName: 'Standard', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存 复制)', size: 2.5 },
          { skuName: 'Standard', skuFamily: 'C', value: 3, content: '(6 GB 缓存 复制)', size: 6 },
          { skuName: 'Standard', skuFamily: 'C', value: 4, content: '(13 GB 缓存 复制)', size: 13 },
          { skuName: 'Standard', skuFamily: 'C', value: 5, content: '(26 GB 缓存 复制)', size: 26 },
          { skuName: 'Standard', skuFamily: 'C', value: 6, content: '(53 GB 缓存 复制)', size: 53 }
        ],
        Premium: [
          { skuName: 'Premium', skuFamily: 'P', value: 1, content: '(6 GB 缓存 复制)', size: 6 },
          { skuName: 'Premium', skuFamily: 'P', value: 2, content: '(13 GB 缓存 复制)', size: 13 },
          { skuName: 'Premium', skuFamily: 'P', value: 3, content: '(26 GB 缓存 复制)', size: 26 },
          { skuName: 'Premium', skuFamily: 'P', value: 4, content: '(53 GB 缓存 复制)', size: 53 },
          { skuName: 'Premium', skuFamily: 'P', value: 5, content: '(120 GB 缓存 复制)', size: 120 }
        ]
      },
      skuList: [
        { skuName: 'Basic', skuFamily: 'C', value: 0, content: '(250 MB 缓存)', size: 250 },
        { skuName: 'Basic', skuFamily: 'C', value: 1, content: '(1 GB 缓存)', size: 1 },
        { skuName: 'Basic', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存)', size: 2.5 },
        { skuName: 'Basic', skuFamily: 'C', value: 3, content: '(6 GB 缓存)', size: 6 },
        { skuName: 'Basic', skuFamily: 'C', value: 4, content: '(13 GB 缓存)', size: 13 },
        { skuName: 'Basic', skuFamily: 'C', value: 5, content: '(26 GB 缓存)', size: 26 },
        { skuName: 'Basic', skuFamily: 'C', value: 6, content: '(53 GB 缓存)', size: 53 },
        { skuName: 'Standard', skuFamily: 'C', value: 0, content: '(250 MB 缓存, 复制)', size: 250 },
        { skuName: 'Standard', skuFamily: 'C', value: 1, content: '(1 GB 缓存 复制)', size: 1 },
        { skuName: 'Standard', skuFamily: 'C', value: 2, content: '(2.5 GB 缓存 复制)', size: 2.5 },
        { skuName: 'Standard', skuFamily: 'C', value: 3, content: '(6 GB 缓存 复制)', size: 6 },
        { skuName: 'Standard', skuFamily: 'C', value: 4, content: '(13 GB 缓存 复制)', size: 13 },
        { skuName: 'Standard', skuFamily: 'C', value: 5, content: '(26 GB 缓存 复制)', size: 26 },
        { skuName: 'Standard', skuFamily: 'C', value: 6, content: '(53 GB 缓存 复制)', size: 53 },
        { skuName: 'Premium', skuFamily: 'P', value: 1, content: '(6 GB 缓存 复制)', size: 6 },
        { skuName: 'Premium', skuFamily: 'P', value: 2, content: '(13 GB 缓存 复制)', size: 13 },
        { skuName: 'Premium', skuFamily: 'P', value: 3, content: '(26 GB 缓存 复制)', size: 26 },
        { skuName: 'Premium', skuFamily: 'P', value: 4, content: '(53 GB 缓存 复制)', size: 53 },
        { skuName: 'Premium', skuFamily: 'P', value: 5, content: '(120 GB 缓存 复制)', size: 120 }
      ],
      filter: {
        Basic: '基本',
        Standard: '标准',
        Premium: '高级'
      },
      sku: 1,
      shard: false,
      networkJoin: 'public',
      vpcList: [],
      subnetList: [],
      priceData: { unitPirce: 0 },
      disCount: {}
    }
  },
  watch: {
    'addData.configs.name'() {
      this.popoverObj = {
        length: this.addData.configs.name.length >= 1 && this.addData.configs.name.length <= 63,
        intension: /^[a-z0-9-]{1,63}$/.test(this.addData.configs.name)
      }
    }
  },
  created() {
    this.getDisCount()
  },
  methods: {
    getConfigs() {
      const { configs } = this.addData
      const obj = this.sloList[this.specId].find((item, index) => this.sloId == index)
      let data = {
        ...this.addData.configs,
        publicNetworkAccess: this.addData.configs.publicNetworkAccess ? 'Enabled' : 'Disabled',
        skuName: obj.skuName,
        skuFamily: obj.skuFamily,
        skuCapacity: obj.value
      }
      delete data.shardCount
      delete data.replicasPerMaster
      if (obj.skuName == 'Premium') {
        data = {
          ...this.addData.configs,
          publicNetworkAccess: this.addData.configs.publicNetworkAccess ? 'Enabled' : 'Disabled',
          skuName: obj.skuName,
          skuFamily: obj.skuFamily,
          skuCapacity: obj.value
        }
        if (this.shard) {
          data.shardCount = this.addData.configs.shardCount
          delete data.replicasPerMaster
        } else {
          data.replicasPerMaster = this.addData.configs.replicasPerMaster
          delete data.shardCount
        }
        if (this.networkJoin == 'virtual') {
          data.publicNetworkAccess = 'Disabled'
        }
      }
      return {
        endConfig: {
          regionId: this.addData.location.region,
          vendorId: this.addData.location.vendorId,
          availablitiyZone: this.addData.location.az,
          ...data
        }
      }
    },
    getDisCount() {
      getDict().then((data) => {
        if (data.success) {
          this.disCount = data.data.find((item) => item.value == 'PARITIES')
        }
      })
    },
    getRedisPirce() {
      const obj = this.sloList[this.specId].find((item, index) => this.sloId == index)
      getRedisPirce({
        regionId: this.addData.location.region,
        productName: `Azure Redis Cache ${obj.skuName}`,
        skuName: obj.skuFamily + obj.value
      }).then((data) => {
        if (data.success) {
          const obj = data.data.find((item) => item.unitPrice)
          this.priceData = {
            unitPrice: (obj.unitPrice * this.disCount.name * 730).toFixed(2)
          }
        }
      })
    },
    checkNames() {
      if (!this.addData.configs.name) return
      if (/^[a-z0-9-]{1,63}$/.test(this.addData.configs.name)) {
        chcekName({
          name: this.addData.configs.name,
          type: 'Microsoft.Cache/Redis',
          vendorId: this.addData.location.vendorId
        }).then((data) => {
          if (data.success) {
            const obj = JSON.parse(data.data)
            if (!obj.result) {
              this.$message.error('输入名称已占用，请重新输入')
              this.addData.configs.name = ''
            }
          }
        })
      } else {
        this.$message.error('名称格式错误，请重新输入')
      }
    },
    changeSku() {
      if (this.specId != 'Premium' && this.networkJoin != 'public') this.networkJoin = 'public'
      this.getRedisPirce()
    },
    getResource() {
      this.getVpc()
      this.changeSku()
      if (this.addData.configs.resourceGroupId) this.addData.configs.resourceGroupId = ''
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then((data) => {
        if (data.success) {
          this.resourceData = data.data.rows
        }
      })
    },
    getVpc() {
      getVpc({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          if (this.addData.configs.vpcId) this.addData.configs.vpcId = ''
          if (this.addData.configs.subnetId) this.addData.configs.subnetId = ''
          this.vpcList = data.data.rows
        }
      })
    },
    getSubnet() {
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, networkId: this.addData.configs.vpcId }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          if (this.addData.configs.subnetId) this.addData.configs.subnetId = ''
          this.subnetList = data.data.rows
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
