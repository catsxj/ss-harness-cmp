/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="compute" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled">
    <el-divider></el-divider>
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
    <basic-form-item style="width: 300px; display: inline-block" label="系统类型：" prop="configs.osCategory" validate="required">
      <el-select disabled v-model="addData.configs.osCategory" filterable @change="getOsVersion">
        <el-option :key="index" v-for="(item, index) in osCategoryData" :label="item.name" :value="item.value"></el-option>
      </el-select>
    </basic-form-item>
    <basic-form-item style="width: 300px; display: inline-block" label="系统版本：" prop="configs.osVersion" validate="required">
      <el-select disabled v-model="addData.configs.osVersion" filterable @change="changeVersion">
        <el-option :key="index" v-for="(item, index) in osVersionData" :label="item.versionDes" :value="item.osVersionUuid"></el-option>
      </el-select>
    </basic-form-item>
    <!-- <basic-form-item label="系统盘：">
      <el-select disabled v-model="addData.configs.diskType" class="w">
        <el-option label="普通延迟置零" value="1"></el-option>
        <el-option label="普通" value="0"></el-option>
        <el-option label="精简" value="2"></el-option>
      </el-select>
      <el-select disabled v-model="systemElement.categoryId" class="w m-l-md" @change="getSku(systemElement)">
        <el-option :label="item.name" v-for="(item, index) in systemElement.categoryList" :key="index" :value="item.id"></el-option>
      </el-select>
      <el-select disabled v-model="systemElement.skuId" class="w m-l-md">
        <el-option :label="generateSpec(item.spec)" v-for="item in systemElement.skuList" :key="item.id" :value="item.id"></el-option>
      </el-select>
    </basic-form-item> -->
    <DataDisk :add-data="addData" :systemElement="systemElement" :item="elements[2]" ref="diskRef" :diskType="addData.configs.diskType"></DataDisk>
    <el-divider></el-divider>
    <h5>网络信息</h5>
    <ipPool :add-data="addData" :createMode="addData.configs.createMode" v-if="addData.networkRelations.length"></ipPool>
    <el-divider></el-divider>
    <h5>云主机信息</h5>
    <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
      <el-row :gutter="20">
        <el-col :span="12">
          <basic-form-item label="云主机名称：" validate="required" prop="name">
            <el-input v-model="vmData.name" placeholder="请输入云主机名"></el-input>
            <div class="tip">设置云主机名称前缀</div>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
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
import DataDisk from './disks.vue'
import ImageItem from './image.vue'
import CategoryDisplay from '../../components/CategoryDisplay.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import ipPool from './ippool.vue'
import { cloneDeep } from 'lodash-es'
import { generateSpec, getSpecValue } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import { getOsVersion, getNics } from 'services/platform/fc'
import { detailVm } from 'services/platform/index'

export default {
  props: {
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    }
  },
  components: { CommonWrapper, CategoryDisplay, ipPool, DataDisk },
  mixins: [sku],
  watch: {},
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
          vendorType: 'FUSIONSPHERE'
        },
        service: 'fusionsphere.standard.server',
        configs: {
          serverId: '',
          resourceLabel: [],
          diskCategoryId: 0,
          osCategory: '',
          osVersion: '',
          addDiskList: [],
          diskType: '0',
          networkCardConfigs: [],
          createMode: 'FromServer',
          isTemplate: false,
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
      osCategoryData: [
        { name: 'Windows', value: 'windows' },
        { name: 'Linux', value: 'linux' }
      ],
      osVersionData: [],
      serverId: '',
      volumeList: [],
      netcardList: []
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
      const item = skuList.find(item => item.id === skuId)
      if (!item) return []
      const result = item.spec
      return result
    }
  },
  async created() {
    this.getOsVersion()
    if (this.$router.currentRoute.params.serverId) {
      const serverData = this.$router.currentRoute.params.serverId.split('#')
      this.serverId = serverData[0]
      this.addData.configs.serverId = this.serverId
      detailVm(this.addData.configs.serverId).then(data => {
        if (data.success) {
          this.addData.configs.osCategory = data.data.osCategory
          this.addData.configs.osVersion = data.data.osVersion
        }
      })
      this.getNetcardsList()
    }
    if (this.itemData) {
      // 审批时候
      this.retention = this.itemData
      this.handleShowData()
    } else if (this.$route.query.id) {
      // 加入购物车的编辑
      const res = await getShoppingCartDetail(this.$route.query.id)
      if (res.success) {
        this.retention = JSON.parse(res.data.inventory)
        this.handleShowData()
      }
    }
  },
  methods: {
    getNetcardsList() {
      getNics({
        page: 1,
        rows: 9999,
        params: this.$tools.handleSearchParam({
          serverId: this.serverId
        })
      }).then(data => {
        if (data.success) {
          this.netcardList = data.data.rows
          this.$set(this.addData.configs, 'networkCards', this.netcardList)
        }
      })
    },
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
    changeVersion(value) {
      this.addData.configs.imageId = value
      for (let index = 0; index < this.osVersionData.length; index++) {
        const element = this.osVersionData[index]
        if (element.osVersionUuid == value) {
          this.addData.configs.osName = element.name
          return
        }
      }
    },
    getOsVersion() {
      getOsVersion({
        page: 1,
        rows: 99999,
        params: this.$tools.handleSearchParam({
          osType: this.addData.configs.osCategory,
          vendorId: this.addData.location.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.osVersionData = data.data.rows
        }
      })
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
      this.$refs.addForm.validate(valid => {
        if (valid) {
          this.vmData.customization = false
          data = this.formatData()
        }
      })
      return data
    },
    formatData() {
      let data = false
      // if (!this.addData.configs.imageId) {
      //   data = false
      //   this.$message.error('未找到合适的镜像，请重新选择')
      //   return
      // }
      if (!this.systemElement.skuId) {
        this.$message.error('系统盘容量为空，请重新选择')
        return
      }
      let flag = false
      this.addData.configs.networkCardConfigs.forEach(item => {
        if (!item.portGroupId) flag = true
      })
      if (flag) {
        data = false
        this.$message.error('网卡信息配置不完善')
        return
      }
      this.systemElement.categoryList.forEach(item => {
        if (item.id == this.systemElement.categoryId) {
          const obj = this.formatCategory(item.code)
          this.$set(this.addData.configs, 'diskCategory', obj)
        }
      })
      const { password, confirm_password, ...other } = this.vmData
      if (password !== confirm_password) return this.$message.error('两次密码输入不一致')
      const result = {
        ...other,
        password: crypto.encrypt(password),
        diskCategoryId: this.elements[1].categoryId,
        categoryId: this.currentElement.categoryId,
        // 系统盘
        ...getSpecValue(this.systemElement)
      }
      this.specArray.forEach(item => {
        result[item.specName] = item.specValue
      })
      const { elements, categoryMap } = this.elements[2]
      result.addDiskList = elements.map(item => {
        const { categoryId, diskType, device, forceMount, fileSystem } = item
        const category = this.formatCategory(categoryMap[categoryId].code)
        return {
          categoryId,
          // 数据盘
          ...getSpecValue(item),
          diskType,
          diskCategory: category,
          device,
          forceMount,
          fileSystem
        }
      })
      data = result
      return data
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../index.scss';
</style>
