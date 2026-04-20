/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" ref="common" :elements="elements" :get-params="getParam" :loading="loading" :showCount="false" vendorType="VMWARE" :item-data="retention" v-bind="$attrs">
    <div class="item-block">
      <h5>配置信息</h5>
      <basic-form-item label="版本类型：" required>
        <el-radio-group v-model="addData.configs.version">
          <el-radio-button :label="item.value" v-for="(item, index) in versionList" :key="index">{{ item.name }}</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <DataDisk :item="elements[1]" :get-sku="getSku"></DataDisk>
      <!-- <VpcItem :add-data="addData"></VpcItem> -->
      <ImageItem :add-data="addData" :type="service" v-if="addData.location.vendorId"></ImageItem>
      <ipPool :add-data="addData" v-if="addData.networkRelations.length" :needIpV6="false"></ipPool>
      <basic-form-item label="性能类型：" required>
        <el-radio-group v-model="currentElement.categoryId" @change="getSku(currentElement)">
          <el-radio-button :label="item.id" v-for="(item, index) in currentElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
        </el-radio-group>
        <div class="tip">{{ perRemark }}</div>
      </basic-form-item>
      <basic-form-item label="实例规格：" validate="required">
        <sku-table :skus="currentElement.skuList" style="max-width: 800px" :mode="addData.emption.duration.mode" :show-price="true" :column-props="softwareColumns">
          <el-table-column show-overflow-tooltip label="规格代码" prop="code">
            <template v-slot="scope">
              <el-radio v-model="currentElement.skuId" :label="scope.row.id">{{ scope.row.code }}</el-radio>
            </template>
          </el-table-column>
        </sku-table>
      </basic-form-item>
      <slot :add-data="addData"></slot>
    </div>
    <div slot="preview-card">
      <basic-form-item label="版本类型：">{{ addData.configs.version }}</basic-form-item>
      <category-display label="性能类型" :item="currentElement" :templateDisk="addData.configs.templateDisk"></category-display>
      <category-display label="磁盘类型" :item="elements[1]"></category-display>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from './CommonWrapper.vue'
import DataDisk from './DataDisk.vue'
import CategoryDisplay from './CategoryDisplay.vue'
import sku from '../mixins/sku'
import { getDictChildren } from 'services/platform/index'
import { add, element, softwareColumns } from '../data/init'
import ipPool from './../ecs/vc/ippool.vue'
import { cloneDeep } from 'lodash-es'
import ImageItem from './ImageItem.vue'
import { getShoppingCartDetail } from 'services/system/shop_cart'

export default {
  components: { CommonWrapper, DataDisk, CategoryDisplay, ipPool, ImageItem },
  mixins: [sku],
  props: {
    versionKey: {
      type: String
    },
    service: {
      type: String
    },
    getParams: {
      type: Function
    },
    configs: {
      type: Object,
      default: function () {
        return {
          version: '',
          vpcId: ''
        }
      }
    },
    itemData: {
      type: [Object, Boolean]
    }
  },
  data() {
    return {
      softwareColumns,
      elements: [
        {
          ...element,
          name: '实例',
          serviceCode: this.service,
          main: true
        },
        {
          ...element,
          name: '数据盘',
          serviceCode: 'vmware.storage.disk',
          tip: '(数据盘 + 实例系统盘) * 数据盘价格 * 节点数'
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: 'VMWARE'
        },
        service: this.service,
        configs: {
          resourceLabel: [],
          version: '',
          diskCategoryId: '',
          osCategory: '',
          osVersion: '',
          networkCardConfigs: [],
          ...this.configs
        },
        networkRelations: []
      },
      versionList: [],
      retention: false
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    },
    specArray() {
      const { skuList, skuId } = this.currentElement
      const item = skuList.find(item => item.id === skuId)
      if (!item) return []
      const result = item.spec
      return result
    },
    // 性能类型的提示
    perRemark() {
      const { categoryMap = {}, categoryId } = this.currentElement
      return (categoryMap[categoryId] || {}).remark
    }
  },
  async created() {
    this.getVersion()
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
    getParam() {
      let config = {}
      let flag = false
      this.addData.configs.networkCardConfigs.forEach(item => {
        if (!item.portGroupId || !item.ipPoolId || (item.ipPolicy == 'Manual' && item.address.length == 0)) flag = true
      })
      if (flag) {
        this.$message.error('网卡信息配置不完善')
        return false
      }
      if (this.getParams) {
        config = this.getParams()
        if (!config) return false
      }
      const { categoryId: diskCategoryId, categoryMap } = this.elements[1]
      return {
        diskCategoryId,
        diskCategoryName: categoryMap[diskCategoryId].name,
        ...config
      }
    },
    // 数据回现展示
    handleShowData() {
      const { configs, elements } = this.retention
      this.$emit('showData', configs)
      this.addData = {
        ...cloneDeep(this.addData), // 有些参数 比如nodes等编辑后参数就没有了
        ...cloneDeep(this.retention)
      }
      const [first, two] = elements
      this.elements = [
        {
          ...element,
          main: true,
          ...first
        },
        {
          ...element,
          name: '数据盘',
          serviceCode: 'vmware.storage.disk',
          ...two
        }
      ]
      this.initLoad()
    },
    getVersion() {
      getDictChildren({ value: this.versionKey }).then(data => {
        if (data.success) {
          this.versionList = data.data
          if (!this.addData.configs.version) {
            this.addData.configs.version = data.data[0].value
          }
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
@import '../index.scss';
</style>
