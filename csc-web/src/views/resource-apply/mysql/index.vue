/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="setVendor" ref="common" :elements="elements" :showCount="false" :getParams="getConfigs">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-col :span="12">
          <basic-form-item label="资源组：" prop="configs.resourceGroupId" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.configs.resourceGroupId">
              <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-col>
      <el-col :span="24">
        <el-col :span="24">
          <el-popover ref="popover" placement="right" trigger="hover">
            <div>
              <span v-if="addData.configs.name">
                <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.length" />
                <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
              </span>
              长度为3到63位
            </div>
            <div>
              <span v-if="addData.configs.name">
                <Icon type="icon-ok" style="color: #0fd59d" v-if="popoverObj.intension" />
                <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
              </span>
              小写字母、数字和连字符。不可以连字符开头或结尾
            </div>
          </el-popover>
          <basic-form-item label="名称：" prop="configs.name" validate="required,mysqlName" required-message="请输入名称" maxlength="63">
            <el-input v-model="addData.configs.name" @blur="checkNames" v-popover:popover></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数据源：" required>
            <el-radio-group v-model="datasource" @change="changeDatasource">
              <el-radio :label="false">无</el-radio>
              <el-radio :label="true">备份</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="datasource">
          <basic-form-item label="备份：" prop="configs.masterServerId" validate="required">
            <el-select v-model="addData.configs.masterServerId">
              <el-option v-for="(item, index) in mysqlList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="!datasource">
          <basic-form-item label="版本：" prop="configs.version" validate="required">
            <el-select v-model="addData.configs.version">
              <!-- <el-option label="5.6" value="5.6"></el-option> -->
              <el-option label="5.7" value="5.7"></el-option>
              <el-option label="8.0" value="8.0"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="24" v-if="!datasource">
          <popover :add-data="addData" ref="popover"></popover>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格：" required>
            <el-select v-model="specId" @change="getDetail">
              <el-option v-for="(item, index) in specList" :key="index" :label="specFilter(item.uuid)" :value="item.id" :disabled="item.uuid.indexOf('Basic') > -1"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="详细规格：" prop="configs.sloId" validate="required">
            <el-select v-model="addData.configs.sloId" @change="setStorageMb">
              <el-option v-for="(item, index) in sloList" :key="index" :label="`${item.uuid}(vCore：${item.vcore})`" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
      </el-col>
      <el-col :span="24" v-if="!datasource">
        <el-col :span="12">
          <basic-form-item label="存储空间：" prop="configs.storageMb" validate="required" required-message="请输入名称">
            <el-input-number v-model="addData.configs.storageMb" style="width: 80%" :min="minStorageMb" :max="maxStorageMb"></el-input-number>
            <span class="m-l-xs">GB</span>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="备份保持期：" label-width="120px" prop="configs.backupRetentionDays" validate="required" required-message="请输入名称">
            <el-input-number v-model="addData.configs.backupRetentionDays" style="width: 80%" :min="7" :max="35"></el-input-number>
            <span class="m-l-xs">天</span>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="备份冗余：" prop="configs.geoRedundantBackup" validate="required">
            <el-radio-group v-model="addData.configs.geoRedundantBackup">
              <el-radio label="Disabled">本地冗余</el-radio>
              <el-radio v-if="specList.find(item => item.id == specId && item.uuid != 'Basic')" label="Enabled">地域冗余</el-radio>
            </el-radio-group>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="是否允许访问此服务器的公共网络：" label-width="320px" prop="configs.publicNetworkAccess" validate="required">
            <el-checkbox v-model="addData.configs.publicNetworkAccess">允许</el-checkbox>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="是否启用SSL连接：" label-width="230px" prop="configs.sslEnforcement" validate="required">
            <el-checkbox v-model="addData.configs.sslEnforcement">启用</el-checkbox>
          </basic-form-item>
        </el-col>
        <!-- <el-col :span="12" v-if="addData.configs.sslEnforcement">
          <basic-form-item label="TLS 版本：" prop="configs.minimumTlsVersion">
            <el-select v-model="addData.configs.minimumTlsVersion">
              <el-option label="1.0" value="TLS1_0"></el-option>
              <el-option label="1.1" value="TLS1_1"></el-option>
              <el-option label="1.2" value="TLS1_2"></el-option>
            </el-select>
          </basic-form-item>
        </el-col> -->
        <el-col :span="12" v-if="specList.find(item => item.id == specId && item.uuid != 'Basic')">
          <basic-form-item label="显示服务器是否启用了基础结构加密的状态：" label-width="320px" prop="configs.infrastructureEncryption" validate="required">
            <el-checkbox v-model="addData.configs.infrastructureEncryption">启用</el-checkbox>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="启用存储自动增长：" label-width="230px" prop="configs.storageAutogrow" validate="required">
            <el-checkbox v-model="addData.configs.storageAutogrow">启用</el-checkbox>
          </basic-form-item>
        </el-col>
      </el-col>
    </el-row>
    <div slot="preview-card">
      <!-- <basic-form-item label="磁盘价格：">
        {{(addData.configs.storageMb * stroagePrice * disCount.name).toFixed(2)}}元/月
      </basic-form-item> -->
      <basic-form-item label="vCore价格："> {{ (vcorePrice * disCount.name * 730).toFixed(2) }}元/月 </basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../components/PublicCommonWrapper.vue'
import { add, element } from '../data/publicInit'
import { getResource, createMysql, getSku, getSkuDetail, chcekName, getMysqlStoragePirce, getMysqlVcouePirce, getMysql } from 'services/platform/azure'
import { getDict } from 'services/platform/index'
import popover from './popover'
import crypto from 'utils/crypto.js'
import { cloneDeep } from 'lodash-es'

export default {
  components: { CommonWrapper, popover },
  data() {
    return {
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'azure.database.mysql',
        configs: {
          resourceLabel: [],
          vendorId: '',
          publicNetworkAccess: true,
          sslEnforcement: true,
          // minimumTlsVersion: 'TLS1_0',
          infrastructureEncryption: false,
          geoRedundantBackup: 'Disabled',
          storageAutogrow: true,
          backupRetentionDays: 7,
          storageMb: 0
        }
      },
      elements: [
        {
          name: 'mySql',
          serviceCode: 'azure.database.mysql',
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
      specList: [],
      sloList: [],
      specId: '',
      datasource: false,
      mysqlList: [],
      minStorageMb: 0,
      maxStorageMb: 0,
      stroagePrice: 0,
      vcorePrice: 0,
      disCount: {
        name: 0
      },
      createMode: 'Default'
    }
  },
  created() {
    this.getDisCount()
  },
  watch: {
    'addData.configs.name'() {
      this.popoverObj = {
        length: this.addData.configs.name.length >= 3 && this.addData.configs.name.length <= 63,
        intension: /^[a-z0-9-]{3,63}$/.test(this.addData.configs.name) && !this.addData.configs.name.startsWith('-') && !this.addData.configs.name.endsWith('-')
      }
    }
  },
  methods: {
    specFilter(value) {
      const specMap = {
        Basic: '基本',
        GeneralPurpose: '常规用途',
        MemoryOptimized: '优化内存'
      }
      return specMap[value]
    },
    changeDatasource(data) {
      if (data) {
        this.$set(this.addData.configs, 'masterServerId', '')
        this.createMode = 'GeoRestore'
      } else {
        delete this.addData.configs.masterServerId
        this.createMode = 'Default'
      }
    },
    setVendor() {
      this.getResource()
      this.getMysql()
    },
    getMysql() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, status: 'Ready', isMaster: false }, sign: 'EQ' }])
      }
      getMysql(params).then(data => {
        if (data.success) {
          this.mysqlList = data.data.rows
        }
      })
    },
    getConfigs() {
      const { configs } = this.addData
      if (!this.datasource) {
        if (this.$refs.popover.validate()) return this.$message.error('用户名与密码不可一致，请重新输入')
      }
      const obj = this.specList.find(item => item.id == this.specId && item.uuid != 'Basic')
      console.log({
        databaseServer: {
          ...configs,
          publicNetworkAccess: this.addData.configs.publicNetworkAccess ? 'Enabled' : 'Disabled',
          sslEnforcement: this.addData.configs.sslEnforcement ? 'Enabled' : 'Disabled',
          infrastructureEncryption: this.addData.configs.infrastructureEncryption && obj ? 'Enabled' : 'Disabled',
          storageAutogrow: this.addData.configs.storageAutogrow ? 'Enabled' : 'Disabled',
          administratorPassword: crypto.encrypt(this.addData.configs.administratorPassword)
        }
      })
      return {
        endConfig: {
          ...configs,
          regionId: this.addData.location.region,
          vendorId: this.addData.location.vendorId,
          availablitiyZone: this.addData.location.az,
          publicNetworkAccess: this.addData.configs.publicNetworkAccess ? 'Enabled' : 'Disabled',
          sslEnforcement: this.addData.configs.sslEnforcement ? 'Enabled' : 'Disabled',
          infrastructureEncryption: this.addData.configs.infrastructureEncryption && obj ? 'Enabled' : 'Disabled',
          storageAutogrow: this.addData.configs.storageAutogrow ? 'Enabled' : 'Disabled',
          administratorPassword: crypto.encrypt(this.addData.configs.administratorPassword),
          storageMb: this.addData.configs.storageMb * 1024,
          createMode: this.createMode
        }
      }
    },
    getDisCount() {
      getDict().then(data => {
        if (data.success) {
          this.disCount = data.data.find(item => item.value == 'PARITIES') || { name: 0 }
        }
      })
    },
    checkNames() {
      if (!this.addData.configs.name) return
      if (/^[a-z0-9-]{3,63}$/.test(this.addData.configs.name) && !this.addData.configs.name.startsWith('-') && !this.addData.configs.name.endsWith('-')) {
        chcekName({
          name: this.addData.configs.name,
          type: 'Microsoft.DBforMySQL',
          vendorId: this.addData.location.vendorId
        }).then(data => {
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
    setStorageMb(id) {
      const obj = this.sloList.find(item => item.id == id)
      const obj1 = this.specList.find(item => item.id == this.specId)
      getMysqlVcouePirce({
        uuid: obj1.uuid,
        regionId: this.addData.location.region
      }).then(data => {
        if (data.success) {
          const obj1 = data.data.find(item => item.unitPrice)
          this.vcorePrice = obj1.unitPrice * obj.vcore
        }
      })
      this.minStorageMb = obj.minStorageMB / 1024
      this.maxStorageMb = obj.maxStorageMB / 1024
      this.addData.configs.storageMb = obj.minStorageMB / 1024
    },
    getResource() {
      if (this.addData.configs.resourceGroupId) this.addData.configs.resourceGroupId = ''
      this.getSku()
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          this.resourceData = data.data.rows
        }
      })
    },
    getSku() {
      getSku({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.location.vendorId, regionId: this.addData.location.region }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.specList = data.data.rows
          this.specList.forEach((item, index) => {
            if (item.uuid.indexOf('Basic') > -1) {
              this.specList.splice(index, 1)
            }
          })
          if (this.specId) this.specId = ''
        }
      })
    },
    getDetail(id) {
      const obj = this.specList.find(item => item.id == this.specId)
      getMysqlStoragePirce({
        uuid: obj.uuid,
        regionId: this.addData.location.region
      }).then(data => {
        if (data.success) {
          const obj = data.data.find(item => item.unitPrice)
          this.stroagePrice = obj.unitPrice
        }
      })
      getSkuDetail(id).then(data => {
        if (data.success) {
          this.sloList = data.data.serviceLevelObjectives
          if (this.addData.configs.sloId) this.addData.configs.sloId = ''
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
