<template>
  <common-wrapper code="compute" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" @vendorId="getHostList">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <basic-form-item label="产品类型：">
        <el-radio-group v-model="currentElement.categoryId" @change="getSku(currentElement)">
          <el-radio-button :label="item.id" v-for="(item, index) in currentElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="规格：" validate="required">
        <sku-table :skus="currentElement.skuList" style="max-width: 800px" :mode="addData.emption.duration.mode" :show-price="true">
          <el-table-column show-overflow-tooltip label="规格代码" prop="code">
            <template v-slot="scope">
              <el-radio v-model="currentElement.skuId" :label="scope.row.id">{{ scope.row.code }}</el-radio>
            </template>
          </el-table-column>
        </sku-table>
      </basic-form-item>
      <ImageItem :add-data="addData" :systemElement="systemElement" v-if="addData.location.vendorId" :elements="elements" @getImageSize="getImageSize">
        <template #imageSize>
          <span style="margin-left: 20px; color: #606060">系统盘大小(GB): {{ templateRootDisk || 0 }}</span>
        </template>
      </ImageItem>
      <basic-form-item label="系统盘：">
        <el-select :disabled="addData.configs.createMode == 'Template'" v-model="addData.configs.diskType" class="w">
          <el-option label="普通延迟置零" value="1"></el-option>
          <el-option label="普通" value="0"></el-option>
          <el-option label="精简" value="2"></el-option>
        </el-select>
        <el-select :disabled="addData.configs.createMode == 'Template'" v-model="systemElement.categoryId" class="w m-l-md" @change="getSku(systemElement)(systemElement)">
          <el-option :label="item.name" v-for="(item, index) in systemElement.categoryList" :key="index" :value="item.id"></el-option>
        </el-select>
        <el-select :disabled="addData.configs.createMode == 'Template'" v-model="systemElement.skuId" class="w m-l-md">
          <el-option :label="generateSpec(item.spec)" v-for="item in systemElement.skuList" :key="item.id" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <DataDisk :add-data="addData" :item="elements[2]" ref="diskRef" :diskType="addData.configs.diskType"></DataDisk>
      <basic-form-item label="应用分级：" prop="configs.befrom" validate="required">
        <el-input class="basic-cmp" v-model="addData.configs.befrom"></el-input>
      </basic-form-item>
      <basic-form-item label="主机：" prop="configs.hostId" validate="required">
        <el-select class="basic-cmp" v-model="addData.configs.hostId" @change="getDataStoresList">
          <el-option v-for="(item, index) in hostsList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="数据存储：" prop="configs.dataStoreId" validate="required">
        <el-select class="basic-cmp" v-model="addData.configs.dataStoreId">
          <el-option v-for="(item, index) in dataStoresList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
    </div>
    <div class="item-block">
      <h5>网络信息</h5>
      <ipPool :add-data="addData" :vm-data="vmData" :createMode="addData.configs.createMode" v-if="addData.networkRelations.length"></ipPool>
    </div>
    <div class="item-block" v-if="addData.configs.networkCardConfigs.length">
      <h5 v-if="addData.configs.createMode == 'Template'">自定义设置</h5>
      <add-set ref="addSet" :addData="vmData" :count="addData.emption.count" v-if="addData.configs.createMode == 'Template'" :networkCardConfigs="addData.configs.networkCardConfigs" :networkRelations="addData.networkRelations" :disabled="itemData ? true : false"></add-set>
    </div>
    <div class="item-block">
      <h5>云主机信息</h5>
      <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="24">
            <basic-form-item label="云主机名称：" validate="required" prop="name">
              <el-input v-model="vmData.name" placeholder="请输入云主机名" class="basic-cmp"></el-input>
              <div class="tip">设置云主机名称前缀</div>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
    </div>
    <div slot="preview-card">
      <category-display label="机型" :item="currentElement"></category-display>
      <basic-form-item label="镜像：">{{ addData.configs.osCategory }} {{ addData.configs.osVersion }}</basic-form-item>
      <category-display label="系统盘类型" :item="elements[1]"></category-display>
      <category-display label="数据盘类型" :item="elements[2]"></category-display>
      <!-- <basic-form-item label="规格：">{{specArray.map(item => `${item.specValue}${item.unit}`).join('/')}}</basic-form-item> -->
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../../components/CommonWrapper.vue'
import crypto from 'utils/crypto'
import addSet from './addSet.vue'
import DataDisk from './DataDisk.vue'
import ImageItem from './image.vue'
import CategoryDisplay from '../../components/CategoryDisplay.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import ipPool from './ippool.vue'
import { cloneDeep } from 'lodash-es'
import { generateSpec, getSpecValue } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import { getOsVersion } from 'services/platform/fc'
import { getPoolCondition } from 'services/platform/pool'
export default {
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
  components: { CommonWrapper, CategoryDisplay, addSet, ipPool, ImageItem, DataDisk },
  mixins: [sku],
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.location.vendorType)
    }
  },
  data() {
    return {
      elements: [
        {
          ...element,
          name: '云主机',
          serviceCode: 'fusionsphere.standard.server',
          main: true
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'fusionsphere.standard.volume'
        },
        {
          ...element,
          name: '数据盘',
          serviceCode: 'fusionsphere.standard.volume',
          isLoadData: false,
          elements: []
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'fusionsphere.standard.server',
        configs: {
          resourceLabel: [],
          diskCategoryId: 0,
          osCategory: '',
          osVersion: '',
          addDiskList: [],
          diskType: '0',
          networkCardConfigs: [],
          createMode: 'Template',
          isTemplate: true,
          vmHostName: '',
          customization: false,
          confirm_password: '',
          password: ''
          // isAddShterm: false
        },
        networkRelations: []
      },
      vmData: {
        name: '',
        confirm_password: '',
        password: '',
        vmHostName: '',
        operations: [],
        customization: false
      },
      retention: false,
      templateData: [],
      templateRootDisk: 0,
      hostsList: [],
      dataStoresList: []
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
  methods: {
    getImageSize(data) {
      this.templateRootDisk = data
    },
    // changeTemplate (value) {
    //   if (value == 'Template') {
    //     this.addData.configs.osCategory = ''
    //     this.addData.configs.diskType = '0'
    //     this.systemElement.categoryId = ''
    //     this.elements[1].skuId = ''
    //     this.readying = true
    //     // this.elements[1].skuList = ''
    //   }
    // },
    formatCategory(code) {
      let obj
      switch (code) {
        case 'PERSISTENT':
          obj = {
            indepDisk: false,
            persistentDisk: true
          }
          break
        case 'INDEPPERSISTENT':
          obj = {
            indepDisk: true,
            persistentDisk: true
          }
          break
        case 'INDEP':
          obj = {
            indepDisk: true,
            persistentDisk: false
          }
          break
      }
      return obj
    },
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    // 数据回现展示
    handleShowData() {
      this.addData = {
        ...cloneDeep(this.retention),
        networkRelations: []
      }
      const { name, password, vmHostName, operations, customization } = this.addData.configs
      this.vmData = {
        name: name,
        vmHostName: vmHostName,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password),
        operations: operations,
        customization: customization
      }
      const { configs, elements } = this.retention
      const { diskCategoryId, addDiskList, disk } = configs
      const disks = addDiskList
      const [first, two, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'fusionsphere.standard.volume',
          categoryId: diskCategoryId,
          ...two
        },
        {
          serviceCode: 'fusionsphere.standard.volume',
          isLoadData: false,
          elements: others.map((item, index) => {
            return {
              ...item,
              ...disks[index]
            }
          })
        }
      ]
      setTimeout(() => {
        this.initLoad()
        this.$refs.diskRef.loadSku()
      })
    },
    generateSpec,
    getParams() {
      let data = false
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          if (this.addData.configs.createMode == 'Template' && this.vmData.customization) {
            this.$refs.addSet.$refs.addData.validate((valid) => {
              if (valid) {
                data = this.formatData()
              }
            })
          } else {
            this.vmData.customization = false
            data = this.formatData()
          }
        }
      })
      return data
    },
    formatData() {
      let data = false
      if (!this.addData.configs.imageId) {
        data = false
        this.$message.error('未找到合适的镜像，请重新选择')
        return
      }
      if (!this.systemElement.skuId) {
        this.$message.error('系统盘容量为空，请重新选择')
        return
      }
      let flag = false
      if (!this.addData.configs.networkCardConfigs.length) {
        this.$message.error('网卡配置为空，请重新选择')
        return
      }
      this.addData.configs.networkCardConfigs.forEach((item) => {
        if (!item.portGroupId) flag = true
      })
      if (flag) {
        data = false
        this.$message.error('网卡信息配置不完善')
        return
      }
      this.systemElement.categoryList.forEach((item) => {
        if (item.id == this.systemElement.categoryId) {
          const obj = this.formatCategory(item.code)
          this.$set(this.addData.configs, 'diskCategory', obj)
        }
      })
      const { password, confirm_password, customization, operations, ...other } = this.vmData
      if (password != confirm_password) {
        data = false
        this.$message.error('两次密码输入不一致')
        return
      }
      if (customization) {
        // ps: 自定义配置 判断ip数量与 云主机数量是否一致
        if (operations[0].address.length !== this.addData.emption.count) {
          data = false
          this.$message.error('网卡指定IP不满足申请云主机所需数量，请重新配置网络设备IP')
          return
        }
      }
      const result = {
        ...other,
        customization,
        operations,
        // password: crypto.encrypt(password),
        password: password ? crypto.encrypt(password) : '',
        diskCategoryId: this.elements[1].categoryId,
        categoryId: this.currentElement.categoryId,
        // 系统盘
        ...getSpecValue(this.systemElement)
      }
      this.specArray.forEach((item) => {
        result[item.specName] = item.specValue
      })
      const { elements, categoryMap } = this.elements[2]
      result.addDiskList = elements.map((item, index) => {
        const { categoryId, diskType, device, forceMount, fileSystem, pciType, createLvm } = item
        const category = this.formatCategory(categoryMap[categoryId].code)
        const { disk } = getSpecValue(item)
        return {
          createLvm,
          fileSystem,
          device,
          forceMount,
          sequenceNum: index + 2,
          size: Number(disk),
          pciType,
          indepDisk: category.indepDisk,
          persistentDisk: category.persistentDisk,
          volumeType: diskType
        }
      })
      data = result
      return data
    },
    async getHostList() {
      if (this.addData.configs.hostId && !this.itemData) this.addData.configs.hostId = ''
      const {
        data: { rows }
      } = await getPoolCondition({ condition: 'listResources', category: 'Host', poolGroupId: this.addData.location.poolGroupId })
      this.hostsList = rows
      if (this.addData.configs.dataStoreId) this.getDataStoresList(this.addData.configs.hostId)
    },
    async getDataStoresList(val) {
      if (!val) return
      if (this.addData.configs.dataStoreId && !this.itemData) this.addData.configs.dataStoreId = ''
      const { data } = await getPoolCondition({ condition: 'listDataStoresByHost', hostId: val })
      console.log(data)
      this.dataStoresList = data
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../index.scss';
</style>
