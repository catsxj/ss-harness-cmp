<template>
  <div>
    <basic-form ref="data" :model="addData.configs">
      <el-row :gutter="20">
        <el-col :span="12">
          <basic-form-item label="大小：">
            <el-select :disabled="status == 'update'" v-model="currentElement.specs[0].disk" placeholder="请选择磁盘" @change="sizeChange">
              <el-option v-for="item in sizeList" :label="item.name + item.price" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <el-col :span="12" v-if="nodeList.length >= 1">
          <basic-form-item label="磁盘类型：">
            <el-select v-model="currentElement.specs[0].diskType" class="w m-l-md">
              <el-option v-for="item in diskTypes" :key="item.value" :label="item.label" :value="item.value2"></el-option>
            </el-select>
          </basic-form-item>
        </el-col>
        <!-- <el-col :span="12" v-if="nodeList.length >= 1">
          <basic-form-item label="缓存方式：">
            <el-select v-model="addData.configs.cache" placeholder="请选择缓存方式">
              <el-option v-for="item in cacheList" :label="item.name" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </basic-form-item>
        </el-col> -->
      </el-row>
    </basic-form>
  </div>
</template>

<script>
import { add, element } from './data/publicInit'
import { getSystemConfigs } from 'services/system/index'
import { getSku } from 'services/services/spec'
import { formatEqParams } from 'utils/index'
import { getCategoriesByCode, getSkusDetail } from 'services/services/product'
import { conditionVoleme } from 'services/platform/index'
import { diskTypes } from '@/common/commonData.js'
export default {
  props: {
    itemData: {
      type: Object
    },
    allowCancelation: {
      type: Boolean
    },
    auditNodeName: {
      type: String
    },
    editData: {
      type: Object
    },
    status: {
      type: String
    },
    nodeList: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    currentElement() {
      return this.elements[0]
    }
  },
  data() {
    return {
      diskTypes,
      cacheList: [
        { name: '直接读写', value: 'directsync', code: '1' },
        { name: '一级物理缓存', value: 'writethrough', code: '2' },
        { name: '二级虚拟缓存', value: 'writeback', code: '3' },
        { name: '一级虚拟缓存', value: 'none', code: '4' }
      ],
      elements: [
        {
          ...element,
          // name: '云硬盘',
          serviceCode: 'cnware.standard.volume',
          specs: [
            {
              disk: '',
              diskType: 'off'
            }
          ],
          count: 1
          // main: true
        }
      ],
      addData: {
        ...add,
        location: {
          ...add.location,
          vendorType: this.type,
          diskCategory: ''
        },
        service: 'cnware.standard.volume',
        configs: {
          name: '',
          size: '',
          formatType: 1,
          preallocation: 'off',
          vendorId: this.itemData.vendorId,
          cache: ''
        },
        serverId: ''
      },
      minSize: 20,
      maxSize: 10000,
      serverList: [],
      retention: false,
      isLoadData: false,
      sizeList: [],
      skuList: []
    }
  },
  created() {
    if (this.status == 'update') {
      this.addData.configs = this.editData.config
    } else {
      console.log(this.addData.configs)
      this.addData.configs.cache = this.cacheFormat()
    }
    // this.getCategoriesByCode()
    this.getSystemSkuId()
    getSystemConfigs({ codes: 'DefaultDiskSize' }).then(data => {
      if (data.success) {
        this.maxSize = Number(data.data.DefaultDiskSize)
      }
    })
  },
  methods: {
    cacheFormat() {
      console.log(this.itemData.cache)
      const obj = this.cacheList.find(item => item.code == this.itemData.cache)
      return obj.value
    },
    ok() {
      let data = false
      this.$refs.data.validate(valid => {
        if (valid) {
          const { props, tenantId, vendorType } = this.itemData
          this.addData.location = {
            ...JSON.parse(props),
            vendorType,
            diskCategory: null,
            tenantId,
            vendorId: this.itemData.vendorId
          }
          this.addData.configs.size = this.currentElement.specs[0].disk
          this.addData.configs.diskType = this.currentElement.specs[0].diskType
          this.addData.elements = this.elements
          this.addData.serverId = this.itemData.id
          data = this.addData
        }
      })
      return data
    },
    getSystemSkuId() {
      conditionVoleme({
        condition: 'listByVmId',
        serverId: this.itemData.id
      }).then(res => {
        if (res.success) {
          const [{ skuId }] = res.data
          this.getSkusDetail(skuId)
        }
      })
    },
    getSkusDetail(id) {
      getSkusDetail(id).then(res => {
        if (res.success) {
          const { categoryId } = res.data
          this.getSku(categoryId)
        }
      })
    },
    getSku(categoryId) {
      this.currentElement.categoryId = categoryId
      getSku(formatEqParams({ categoryId, status: 'enable' })).then(res => {
        if (res.success) {
          this.skuList = res.data.rows
          this.sizeList = res.data.rows.map(item => {
            const size = JSON.parse(item.spec)[0].specValue
            return {
              name: size + 'GB',
              value: size,
              skuId: item.id,
              yearPrice: item.yearPrice,
              dayPrice: item.dayPrice,
              price: this.allowCancelation ? `(${item.dayPrice}元/天)` : `(${item.yearPrice}元/年)`
            }
          })
          if (this.sizeList.length > 0) {
            console.log(this.status)
            if (this.status == 'create') {
              this.currentElement.specs[0].disk = this.sizeList[0].value
              this.currentElement.skuId = this.sizeList[0].skuId
            } else {
              this.currentElement.specs[0].disk = this.editData.elements[0].specs[0].disk
              this.currentElement.specs[0].diskType = this.editData.elements[0].specs[0].diskType || 'off'
              this.currentElement.skuId = this.editData.elements[0].skuId
            }
          }
        }
      })
    },
    sizeChange(val) {
      this.currentElement.skuId = this.sizeList.find(item => item.value == val).skuId
    },
    getPriceList() {
      return this.skuList.map(item => {
        const size = JSON.parse(item.spec)[0].specValue
        return {
          size: size,
          yearPrice: item.yearPrice,
          dayPrice: item.dayPrice
        }
      })
    }
  }
}
</script>
