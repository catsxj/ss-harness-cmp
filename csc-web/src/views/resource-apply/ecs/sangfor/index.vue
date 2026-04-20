<template>
  <common-wrapper code="compute" :add-data="addData" ref="common" :elements="elements" :get-params="getParams" :item-data="retention" :disabled="disabled" @vendorId="changeVendor">
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
      <ImageItem :add-data="addData"></ImageItem>
      <basic-form-item label="系统盘：">
        <el-select v-model="addData.configs.storage" class="w fix-select">
          <el-option v-for="(item, index) in dataStoresList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
        <el-select v-if="false" v-model="systemElement.categoryId" class="w m-l-md" @change="getSku(systemElement)">
          <el-option :label="item.name" v-for="(item, index) in systemElement.categoryList" :key="index" :value="item.id"></el-option>
        </el-select>
        <el-select v-model="systemElement.skuId" class="w m-l-md">
          <el-option :label="generateSpec(item.spec)" v-for="item in systemElement.skuList" :key="item.id" :value="item.id"></el-option>
        </el-select>
      </basic-form-item>
    </div>
    <div class="item-block">
      <h5>网络信息</h5>
      <ipPool :add-data="addData" v-if="addData.networkRelations.length" :disabled="disabled" :retention="retention"></ipPool>
    </div>
    <div class="item-block">
      <h5>云主机信息</h5>
      <basic-form :model="vmData" ref="addForm" label-position="left" :disabled="disabled">
        <el-row :gutter="20">
          <rule :add-data="vmData"></rule>
          <el-col :span="12">
            <basic-form-item label="用途：" validate="required,purposeName" prop="purpose">
              <el-input v-model="vmData.purpose" class="basic-cpt"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="主机名：" validate="required,vcName" prop="vmHostName" :rule="[{ pattern: /^[a-zA-Z0-9]{5,15}$/, message: '请按提示输入正确格式' }]">
              <el-input v-model="vmData.vmHostName" placeholder="请输入主机名" class="basic-cpt"></el-input>
              <div class="tip">5~15位英文、数字的组合，不可为空</div>
            </basic-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <basic-form-item label="密码设置：" validate="required,vmPassword" prop="password">
              <el-input v-model="vmData.password" placeholder="请输入密码" show-password class="basic-cpt"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="确认密码：" validate="required,vmPassword" prop="confirm_password">
              <el-input v-model="vmData.confirm_password" placeholder="请确认密码" show-password class="basic-cpt"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
    </div>
    <div slot="preview-card">
      <category-display label="机型" :item="currentElement"></category-display>
      <basic-form-item label="镜像：">{{ addData.configs.osCategory }} {{ addData.configs.osVersion }}</basic-form-item>
      <category-display label="系统盘类型" :item="elements[1]"></category-display>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../../components/CommonWrapper.vue'
import crypto from 'utils/crypto'
import ImageItem from './../ImageItem.vue'
import CategoryDisplay from '../../components/CategoryDisplay.vue'
import sku from '../../mixins/sku'
import { add, element } from '../../data/init'
import ipPool from './ippool.vue'
import { cloneDeep, isNumber } from 'lodash-es'
import { generateSpec, getSpecValue } from 'views/resource-apply/utils/index'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import rule from '../namerule.vue'
import { getDatastores, getVm } from 'services/platform/index'

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
  components: { CommonWrapper, CategoryDisplay, ImageItem, ipPool, rule },
  mixins: [sku],
  watch: {
    'addData.location.vendorType'() {
      this.$emit('type', this.addData.location.vendorType)
    },
    'addData.configs.templateDisk'() {
      this.setSystemDisk()
    }
  },
  data() {
    return {
      elements: [
        {
          ...element,
          name: '云主机',
          serviceCode: 'sangfor.standard.server',
          main: true
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'sangfor.storage.disk'
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type
        },
        service: 'sangfor.standard.server',
        configs: {
          count: 1, // 固定为 1
          cloneType: 'fast', // 克隆方式
          storage: '', // 存储位置
          groupUuid: '', // 分组 UUID
          resourceLabel: [],
          diskCategoryId: 0,
          osCategory: '',
          osVersion: '',
          imageId: '',
          vmUuid: '', // 克隆的模板虚机
          networkCardConfigs: [],
          templateDisk: null,
          disk: '', // 系统磁盘大小 130GB
          cpu: 0,
          memory: 0
        },
        networkRelations: []
      },
      vmData: {
        name: '',
        confirm_password: '',
        password: '',
        vmHostName: '',
        purpose: ''
      },
      retention: false,
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
    changeVendor() {
      // 深信服分组 ID
      this.addData.configs.groupUuid = this.addData.location.groupUuid
      this.getDataStoresList()
    },
    async getDataStoresList() {
      const {
        data: { rows }
      } = await getDatastores({ page: 1, rows: 9999, params: this.$tools.handleSearchParam({ vendorId: this.addData.location.vendorId, 'type:UEQ': 'SD', azUuid: this.addData.location.azUuid }) })
      this.dataStoresList = rows
      if (!this.addData.configs.storage) this.addData.configs.storage = rows[0]?.id
    },
    // 根据镜像自动设置系统盘大小
    setSystemDisk() {
      const { skuId, skuList } = this.systemElement
      if (!isNumber(this.addData.configs.templateDisk)) return
      this.systemElement.skuId = skuList.find(item1 => item1.spec[0].specValue * 1 >= this.addData.configs.templateDisk)?.id
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
      const { name, password, vmHostName, nameruleId, purpose } = this.addData.configs
      this.vmData = {
        name: name,
        vmHostName: vmHostName,
        purpose,
        password: crypto.decrypt(password),
        confirm_password: crypto.decrypt(password),
        nameruleId
      }
      const { configs, elements } = this.retention
      const { diskCategoryId, disk } = configs
      const [first, two, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        },
        {
          ...element,
          name: '系统盘',
          serviceCode: 'sangfor.storage.disk',
          categoryId: diskCategoryId,
          ...two
        }
      ]
      setTimeout(() => {
        this.initLoad()
        if (this.$refs.diskRef) this.$refs.diskRef.loadSku()
      })
    },
    generateSpec,
    getParams() {
      let data = false
      this.$refs.addForm.validate(valid => {
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
          this.addData.configs.networkCardConfigs.forEach(item => {
            if (!item.ipPoolId || (item.ipPolicy == 'Manual' && item.address.length == 0)) flag = true
            if (item.ipPolicy == 'Manual' && item.address.length !== this.addData.emption.count) {
              addressLenFlag = true
            }
          })
          if (flag) {
            data = false
            this.$message.error('网卡信息配置不完善')
            return
          }
          if (addressLenFlag) {
            data = false
            setTimeout(() => {
              this.$message.error('网卡IP数量与云主机订购数量不一致')
            })
            return
          }
          const selectedIps = this.addData.configs.networkCardConfigs.map(({ address }) => address).flat()
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
.basic-cpt {
  width: 280px !important;
}
</style>
