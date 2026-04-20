<template>
  <CommonWrapper code="compute" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled">
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
      <!-- 系统盘在镜像里面设置 -->
      <ImageItem :add-data="addData" :elements="systemElement" v-if="addData.location.vendorId"></ImageItem>
      <basic-form-item label="系统盘："> <el-input class="w m-r" disabled v-model="addData.configs.templateDisk"></el-input>GB </basic-form-item>
      <DataDisk :add-data="addData" :item="elements[2]" ref="diskRef"></DataDisk>
    </div>
    <div class="item-block">
      <h5>网络信息</h5>
      <ipPool :add-data="addData" v-if="addData.networkRelations.length" :disabled="disabled"></ipPool>
    </div>
    <div class="item-block">
      <h5>云主机信息</h5>
      <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="云主机名称：" validate="required" prop="name" label-width="107px">
              <el-input v-model="vmData.name" placeholder="请输入云主机名" class="w-lg"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="密码设置：" validate="required" prop="password">
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
  </CommonWrapper>
</template>

<script>
import CommonWrapper from '../../components/CommonWrapper.vue'
import crypto from 'utils/crypto'
import DataDisk from './DataDisk.vue'
import ImageItem from './../ImageItem.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import ipPool from './ippool.vue'
import { cloneDeep, findLastKey } from 'lodash-es'
import { generateSpec, getSpecValue } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'
// import LabelItemNew from '../../components/LabelItemNew.vue'

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
  components: { CommonWrapper, DataDisk, ipPool, ImageItem },
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
          serviceCode: 'cloudtower.standard.server',
          main: true
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'cloudtower.standard.volume'
        },
        {
          ...element,
          name: '数据盘',
          serviceCode: 'cloudtower.standard.volume',
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
        service: 'cloudtower.standard.server',
        configs: {
          templateId: '',
          resourceLabel: [],
          diskCategoryId: 0,
          osCategory: '',
          osVersion: '',
          volumeModels: [],
          networkCardConfigs: [
            {
              operation: 'newNet',
              networkId: '',
              mac: '',
              model: 'VIRTIO',
              ipAddress: [], // 对应一个ip，可以为空
              netmask: '',
              link: 'up',
              loading: false
            }
          ],
          serverId: 0,
          ha: true,
          firmware: 'BIOS',
          status: 'running',
          fullClone: false
        },
        networkRelations: []
      },
      vmData: {
        name: '',
        confirm_password: '',
        password: '',
        resourceLabel: []
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
      const item = skuList.find(item => item.id === skuId)
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
      const { name, password, resourceLabel } = this.addData.configs
      this.vmData = {
        name,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password),
        resourceLabel
      }
      const { configs, elements } = this.retention
      const { diskCategoryId, volumeModels } = configs
      const [first, two, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'cloudtower.standard.volume',
          categoryId: diskCategoryId,
          insAmount: configs.templateDisk, // configs 中系统盘大小在镜像中设置的
          ...two
        },
        {
          serviceCode: 'cloudtower.standard.volume',
          isLoadData: false,
          elements: others.map((item, index) => {
            return {
              ...item,
              ...volumeModels[index]
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
          if (!this.elements[2].elements.length) {
            this.$message.error('至少要有一块磁盘')
            return false
          }
          if (!this.addData.configs.networkCardConfigs.length) {
            this.$message.error('至少要有一个网卡')
            return false
          }
          let flag = false
          let lengthValid = false
          this.addData.configs.networkCardConfigs.forEach(item => {
            if (!item.ipPoolId || !item.ipAddress) flag = true
            // 申请2台虚机，那么 address 也必须选择 2 个
            if (item.ipAddress?.length !== this.addData.emption.count) lengthValid = true
          })
          if (lengthValid) {
            this.$message.error('IP数量与申请云主机数量不一致')
            return false
          }
          if (flag) {
            this.$message.error('网卡信息配置不完善')
            return false
          }
          const { name, password, confirm_password, ...other } = this.vmData
          if (password !== confirm_password) {
            this.$message.error('两次密码输入不一致')
            return false
          }

          const result = {
            ...other,
            name,
            password: crypto.encrypt(password),
            diskCategoryId: this.elements[1].categoryId,
            categoryId: this.currentElement.categoryId,
            // 系统盘
            ...getSpecValue(this.systemElement)
          }
          const { elements, categoryMap } = this.elements[2]
          result.volumeModels = elements.map(item => {
            const { categoryId, size, type, bus, volumeTemplateId, volumeTemplateName } = item
            return {
              categoryId,
              // 数据盘
              ...getSpecValue(item),
              size: getSpecValue(item).disk,
              type,
              category: categoryMap ? categoryMap[categoryId].remark : '',
              bus,
              volumeTemplateId,
              volumeTemplateName
            }
          })
          this.specArray.forEach(item => {
            result[item.specName] = item.specValue
          })
          result.skuId = this.currentElement.skuId
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
