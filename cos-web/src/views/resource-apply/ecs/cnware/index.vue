/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper code="compute" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled">
    <div class="item-block">
      <h5>配置信息</h5>
      <basic-form-item label="规格：" validate="required">
        <sku-table :skus="currentElement.skuList" style="min-width: 800px" :mode="addData.emption.duration.mode" :show-price="true">
          <el-table-column show-overflow-tooltip label="" prop="code" width="50px">
            <template v-slot="scope">
              <el-radio v-model="currentElement.skuId" :label="scope.row.id">{{ scope.row.aaaa }}</el-radio>
            </template>
          </el-table-column>
        </sku-table>
      </basic-form-item>
      <ImageItem :add-data="addData" :elements="systemElement" v-if="addData.location.vendorId"></ImageItem>
      <basic-form-item label="系统盘："> <el-input class="w m-r" disabled v-model="addData.configs.templateDisk"></el-input>GB </basic-form-item>
      <DataDisk :add-data="addData" :item="elements[2]" ref="diskRef" :currentElement="currentElement"></DataDisk>
    </div>
    <div class="item-block">
      <h5>网络信息</h5>
      <ipPool :add-data="addData" v-if="addData.networkRelations.length" :disabled="disabled" :retention="retention"></ipPool>
      <!-- <el-divider></el-divider> -->
    </div>
    <div class="item-block">
      <h5>云主机信息</h5>
      <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="主机名：" prop="vmHostName" validate="required">
              <el-input v-model="vmData.vmHostName" placeholder="请输入主机名" class="w-lg"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="虚机名：" prop="name" validate="required">
              <el-input v-model="vmData.name" class="w-lg"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="密码设置：" prop="password" validate="required">
              <el-input v-model="vmData.password" placeholder="请输入密码" show-password class="w-lg"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="确认密码：" validate="required" prop="confirm_password">
              <el-input v-model="vmData.confirm_password" placeholder="请确认密码" show-password class="w-lg"></el-input>
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
import DataDisk from './DataDisk.vue'
import ImageItem from '../ImageItem.vue'
import CategoryDisplay from '../../components/CategoryDisplay.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import ipPool from './ippool.vue'
import { cloneDeep, isNumber } from 'lodash-es'
import { generateSpec, getSpecValue, getSpec } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'
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
  components: { CommonWrapper, CategoryDisplay, ImageItem, ipPool, DataDisk },
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
          serviceCode: 'cnware.standard.server',
          main: true
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'cnware.standard.volume'
        },
        {
          ...element,
          name: '数据盘',
          serviceCode: 'cnware.standard.volume',
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
        service: 'cnware.standard.server',
        configs: {
          sysDiskList: [],
          action: 'create',
          diskCategoryId: 0,
          diskCategoryName: '',
          osCategory: '',
          osVersion: '',
          addDiskList: [],
          diskType: 'off',
          imageId: '',
          templateId: '',
          networkCardConfigs: [
            {
              ipPolicy: 'Manual',
              ipPoolId: '',
              portGroupId: '',
              address: [],
              mask: '',
              gateway: '',
              dns: '',
              loading: false
            }
          ],
          isAddShterm: false,
          templateDisk: null
        },
        networkRelations: []
      },
      vmData: {
        name: '',
        password: '',
        vmHostName: '',
        confirm_password: ''
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
      const { name, password, vmHostName } = this.addData.configs
      this.vmData = {
        name,
        vmHostName,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password)
      }
      const { configs, elements } = this.retention
      const { diskCategoryId, addDiskList, disk } = configs
      const disks = addDiskList
      const [first, two, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first,
          serviceCode: 'cnware.standard.server'
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'cnware.standard.volume',
          categoryId: diskCategoryId,
          insAmount: configs.templateDisk, // configs 中系统盘大小在镜像中设置的
          ...two
        },
        {
          serviceCode: 'cnware.standard.volume',
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
    getSpec,
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
          if (!this.systemElement.skuId) {
            data = false
            this.$message.error('系统盘规格未选择')
            return
          }

          let flag = false
          let addressLenFlag = false
          this.addData.configs.networkCardConfigs.forEach((item) => {
            if (!item.portGroupId || !item.ipPoolId || item.address.length == 0) flag = true
            if (item.address.length !== this.addData.emption.count) {
              addressLenFlag = true
            }
            this.addData.configs.portGroupId = item.portGroupId
          })

          if (flag || !this.addData.configs.portGroupId) {
            data = false
            this.$message.error('网卡信息配置不完善')
            return
          }
          if (addressLenFlag) {
            data = false
            this.$message.error('网卡IP数量与云主机订购数量不一致')
            return
          }

          this.addData.configs.templateId = this.addData.configs.imageId
          // 设置系统盘大小
          this.addData.configs.sysDiskList[0].size = this.addData.configs.templateDisk

          const { password, ...other } = this.vmData
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
          const { elements, categoryMap } = this.elements[2]
          result.addDiskList = elements.map((item) => {
            const { categoryId, diskType } = item
            return {
              diskType,
              categoryId,
              // 数据盘
              ...getSpecValue(item),
              category: categoryMap ? categoryMap[categoryId].remark : ''
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
