/** * Created by HaijunZhang on 2019/4/28. */
<template>
  <common-wrapper :add-data="addData" @vendorId="getList" ref="common" vendorType="ZSTACK" :elements="elements" :loading="loading" :get-params="getParams" :item-data="retention" :disabled="disabled" v-bind="$attrs">
    <!-- <el-divider></el-divider> -->
    <div class="item-block">
      <h5>配置信息</h5>
      <basic-form-item label="名称：" prop="configs.name" validate="required,notChinese">
        <el-input v-model="addData.configs.name" class="basic-cmp"></el-input>
      </basic-form-item>
      <basic-form-item label="硬盘类型：">
        <el-radio-group v-model="currentElement.categoryId" @change="getSku(currentElement)">
          <el-radio-button :label="item.id" v-for="(item, index) in currentElement.categoryList" :key="index">{{ item.name }}</el-radio-button>
        </el-radio-group>
      </basic-form-item>
      <basic-form-item label="配置：" validate="required">
        <sku-table :skus="currentElement.skuList" style="max-width: 600px" :mode="addData.emption.duration.mode" :show-price="true" :column-props="[{ label: '磁盘（GB）', value: 'disk' }]">
          <el-table-column show-overflow-tooltip label="规格名称" prop="name">
            <template v-slot="scope">
              <el-radio v-model="currentElement.skuId" :label="scope.row.id">{{ scope.row.code }}</el-radio>
            </template>
          </el-table-column>
        </sku-table>
      </basic-form-item>
      <basic-form-item label="描述：" prop="configs.remark">
        <el-input v-model="addData.configs.remark" class="basic-cmp"></el-input>
      </basic-form-item>
    </div>
    <div slot="preview-card">
      <basic-form-item label="规格：">{{ specArray.map((item) => `${item.specValue}${item.unit}`).join('/') }}</basic-form-item>
    </div>
  </common-wrapper>
</template>

<script>
import CommonWrapper from '../components/CommonWrapper.vue'
import sku from '../mixins/sku'
import create from '../mixins/create'
import { add, element } from '../data/init'
import { cloneDeep } from 'lodash-es'
import { getShoppingCartDetail } from 'services/system/shop_cart'
import { getDiskType } from 'services/platform/index'
export default {
  components: { CommonWrapper },
  mixins: [sku, create],
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
  created() {
    if (this.itemData) {
      this.retention = this.itemData
      this.addData = cloneDeep(this.retention)
      this.handleShowData()
    } else if (this.$route.query.id) {
      getShoppingCartDetail(this.$route.query.id).then((data) => {
        if (data.success) {
          this.retention = JSON.parse(data.data.inventory)
          this.addData = cloneDeep(this.retention)
          this.handleShowData()
        }
      })
    }
  },
  data() {
    return {
      elements: [
        {
          ...element,
          name: '云硬盘',
          serviceCode: 'zstack.standard.volume',
          main: true
        }
      ],
      addData: {
        ...cloneDeep(add),
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'zstack.standard.volume',
        configs: {}
      },
      diskTypeList: [],
      regionData: [],
      snapshotList: [],
      volumeList: [],
      imageList: [],
      retention: false,
      cacheData: [{ id: 'default' }, { id: 'none' }, { id: 'writethrough' }, { id: 'writeback' }, { id: 'directsync' }, { id: 'unsafe' }],
      busData: [{ id: 'sata' }, { id: 'scsi' }, { id: 'usb' }, { id: 'virtio' }]
    }
  },
  watch: {},
  computed: {
    currentElement() {
      return this.elements[0]
    },
    vendorId() {
      return this.addData.location.vendorId
    },
    specArray() {
      const { skuList, skuId } = this.currentElement
      const item = skuList.find((item) => item.id === skuId)
      if (!item) return []
      const result = item.spec
      return result
    }
  },
  methods: {
    handleShowData() {
      const { elements } = this.retention
      const [first, ...others] = elements
      this.elements = [
        {
          ...element,
          ...first
        }
      ]
      this.initLoad()
    },
    getPostData() {
      let data = false
      data = this.$refs.common.handlePostData()
      return data
    },
    getParams() {
      const data = this.addData.configs
      delete data.password
      return data
    },
    getList() {
      this.getDiskTypeData()
    },
    getDiskTypeData() {
      // console.log(this.addData)
      getDiskType({
        page: 1,
        rows: 9999,
        params: JSON.stringify([
          {
            param: {
              vendorId: this.addData.location.vendorId
            },
            sign: 'EQ'
          }
        ])
      }).then((data) => {
        if (data.success) {
          this.diskTypeList = data.data.rows
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
