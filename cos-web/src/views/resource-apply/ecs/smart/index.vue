/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="compute" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled">
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
      <ImageItem :add-data="addData" :elements="systemElement" v-if="addData.location.vendorId"></ImageItem>
      <basic-form-item :label="`系统盘${index + 1}：`" v-for="(item, index) in systemElement.elements" :key="index">
        <el-select v-model="item.categoryId" class="w" @change="getSku(systemElement)">
          <div v-for="(item, index) in systemElement.categoryList" :key="index">
            <el-option :label="item.name" v-if="item.code == 'SMARTX-NORMAL'" :value="item.id"></el-option>
          </div>
        </el-select>
        <el-input class="w m-l-md" disabled v-model="item.insAmount">
          <template slot="append">GB</template>
        </el-input>
      </basic-form-item>
      <DataDisk :add-data="addData" :item="elements[2]" ref="diskRef"></DataDisk>
      <!-- <basic-form-item label="加入堡垒机：" label-width="120px">
      <el-switch v-model="addData.configs.isAddShterm" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
    </basic-form-item> -->
    </div>
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>网络信息</h5>
      <ipPool :add-data="addData" v-if="addData.networkRelations.length"></ipPool>
    </div>
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>云主机信息</h5>
      <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
        <el-row :gutter="20">
          <rule :add-data="vmData"></rule>
          <el-col :span="12">
            <basic-form-item label="主机名：" validate="required,vcName" prop="vmHostName" :rule="[{ pattern: /^[a-zA-Z0-9]{5,22}$/, message: '请按提示输入正确格式' }]">
              <el-input v-model="vmData.vmHostName" placeholder="请输入主机名" class="basic-cmp"></el-input>
              <div class="tip">5~22位英文、数字的组合，不可为空</div>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
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
      </basic-form>
    </div>
    <div slot="preview-card">
      <category-display label="机型" :item="currentElement"></category-display>
      <basic-form-item label="镜像：">{{ addData.configs.osCategory }} {{ addData.configs.osVersion }}</basic-form-item>
      <basic-form-item :label="`系统盘${index + 1}:`" v-for="(item, index) in systemElement.elements" :key="index">{{ item.insAmount }}GB</basic-form-item>
      <category-display label="数据盘类型" :item="elements[2]"></category-display>
      <!-- <basic-form-item label="规格：">{{specArray.map(item => `${item.specValue}${item.unit}`).join('/')}}</basic-form-item> -->
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../../components/CommonWrapper.vue'
import crypto from 'utils/crypto'
import DataDisk from './DataDisk.vue'
import ImageItem from '../ImageItem.vue'
import CategoryDisplay from '../../components/CategoryDisplay.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import ipPool from './ippool.vue'
import { cloneDeep } from 'lodash-es'
import { generateSpec, getSpecValue } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import rule from '../namerule.vue'

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
  components: { CommonWrapper, CategoryDisplay, DataDisk, ImageItem, ipPool, rule },
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
          serviceCode: 'smartx.standard.server',
          main: true
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'smartx.standard.volume',
          elements: []
        },
        {
          ...element,
          name: '数据盘',
          serviceCode: 'smartx.standard.volume',
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
        service: 'smartx.standard.server',
        configs: {
          resourceLabel: [],
          diskCategoryId: 0,
          osCategory: '',
          osVersion: '',
          addDiskList: [],
          networkCardConfigs: [],
          isAddShterm: false
        },
        networkRelations: []
      },
      vmData: {
        name: '',
        confirm_password: '',
        password: '',
        vmHostName: ''
      },
      retention: false
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
      const { name, password, vmHostName, nameruleId } = this.addData.configs
      this.vmData = {
        name: name,
        vmHostName: vmHostName,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password),
        nameruleId
      }
      const { configs, elements } = this.retention
      const { diskCategoryId, addDiskList, sysltemDiskList } = configs
      const [first, ...others] = elements
      const arr = []
      const arr1 = []
      others.forEach((item) => {
        if (item.props) {
          arr.push(item)
        } else {
          arr1.push(item)
        }
      })
      this.elements = [
        {
          ...element,
          ...first
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'smartx.standard.volume',
          categoryId: diskCategoryId,
          elements: arr.map((item, index) => {
            return {
              ...item,
              ...sysltemDiskList[index]
            }
          })
        },
        {
          serviceCode: 'smartx.standard.volume',
          isLoadData: false,
          elements: arr1.map((item, index) => {
            return {
              ...item,
              ...addDiskList[index]
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
          if (!this.addData.configs.imageId) {
            data = false
            this.$message.error('未找到合适的镜像，请重新选择')
            return
          }
          let flag = false
          this.addData.configs.networkCardConfigs.forEach((item) => {
            if (!item.portGroupId || (item.ipPolicy == 'Manual' && item.address.length == 0)) flag = true
          })
          if (flag) {
            data = false
            this.$message.error('网卡信息配置不完善')
            return
          }
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
          this.specArray.forEach((item) => {
            result[item.specName] = item.specValue
          })
          result.sysltemDiskList = this.elements[1].elements.map((item) => {
            return {
              ...item,
              skuList: item.skuList ? [item.skuList[0]] : [],
              disk: item.insAmount
            }
          })
          const { elements, categoryMap } = this.elements[2]
          result.addDiskList = elements.map((item) => {
            const { categoryId, createLvm, device, forceMount, fileSystem } = item
            return {
              categoryId,
              // 数据盘
              ...getSpecValue(item),
              category: categoryMap[categoryId].remark,
              createLvm,
              device,
              forceMount,
              fileSystem
            }
          })
          data = result
        }
      })
      return data
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../index.scss';
</style>
