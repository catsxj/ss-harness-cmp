<template>
  <div>
    <!-- <basic-form-item label="数据盘磁盘格式：" label-width="130px">
      <el-select v-model="diskType" class="m-l-xs" style="width: 300px">
        <el-option label="与源格式相同" value="sameAsSource"></el-option>
        <el-option label="厚置备延迟置零" value="flat"></el-option>
        <el-option label="厚置备快速置零" value="thick"></el-option>
        <el-option label="精简置备" value="thin"></el-option>
      </el-select>
    </basic-form-item> -->
    <basic-form-item label="数据盘：" class="m-b-lg">
      <el-row>
        <el-col :span="24">
          <el-button type="text" @click.native="addItem()">添加数据盘</el-button>
          <span style="font-size: 12px; margin-left: 32px">您已选择{{ disks.length || 0 }}块盘，还可以选择{{ 4 - (disks.length || 0) }}块盘</span>
        </el-col>
        <el-col :span="24" v-for="(cell, index) in disks" :key="index" class="m-t disk-cell">
          <el-col :span="22">
            <el-col :span="24">
              <el-select v-model="cell.categoryId" @change="getSku(cell)" class="w m-r-xs">
                <el-option :label="item.name" v-for="(item, index) in categoryList" :key="index" :value="item.id"></el-option>
              </el-select>
              <el-select v-model="cell.skuId" class="w m-l-md m-r">
                <el-option :label="generateSpec(item.spec)" v-for="item in cell.skuList" :key="item.id" :value="item.id"></el-option>
              </el-select>
              <i class="el-icon-close" @click="removeItem(index)"></i>
            </el-col>
          </el-col>
        </el-col>
      </el-row>
    </basic-form-item>
  </div>
</template>
<script>
import { element } from '../../data/init'
import { getCategoriesByCode, getSkus } from 'services/services/product'
import { formatEqParams } from 'utils'
import { generateSpec } from 'views/resource-apply/utils/index'
export default {
  props: {
    addData: {
      type: Object
    },
    item: {
      type: Object
    },
    diskType: {
      type: String,
      default: 'off'
    },
    disabled: {
      type: Boolean
    }
  },
  data() {
    return {
      categoryList: [],
      // diskType: 'thin',
      fileList: []
    }
  },
  computed: {
    disks() {
      return this.item.elements
    }
  },
  created() {
    this.getCategoryList()
  },
  watch: {
    diskType() {
      this.disks.forEach(item => {
        item.diskType = this.diskType
      })
    }
  },
  methods: {
    generateSpec,
    loadSku() {
      if (this.disks.length) {
        this.handleShowData()
      }
    },
    handleShowData() {
      this.disks.forEach(item => {
        this.getSku(item)
      })
    },
    setDevice(value) {
      let flag = false
      // 数字不能开头
      // 不能是纯/ 也不能以/dev或者/boot开头
      const reg = /^[/a-zA-Z][a-zA-Z0-9_-]*$/
      if ((value == '/' || new RegExp('^/dev').test(value) || new RegExp('^/boot').test(value) || !reg.test(value)) && value) {
        flag = true
      }
      return flag
    },
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode('cnware.standard.volume').then(data => {
        if (data.success) {
          if (!data.data.length) return this.$message.error('该服务不存在产品类型请检查')
          this.categoryList = data.data
          this.item.categoryMap = this.getCategoryMap(data.data)
        }
      })
    },
    // 获取商品的sku
    getSku(item) {
      const { categoryId, skuId } = item
      this.loading = true
      getSkus(formatEqParams({ categoryId }))
        .then(data => {
          if (data.success) {
            if (!data.data.length) return this.$message.error('该产品类型下不存在产品，请检查')
            if (!skuId) {
              const cell = data.data[0]
              item.skuId = cell.id
            }
            this.$set(
              item,
              'skuList',
              data.data.map(item => {
                const spec = JSON.parse(item.spec)
                return {
                  ...item,
                  spec
                }
              })
            )
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 生成服务类型map
    getCategoryMap(data) {
      const map = {}
      data.forEach(item => {
        const { id, name, remark, props } = item
        map[id] = { name, remark, props }
      })
      return map
    },
    removeItem(index) {
      this.disks.splice(index, 1)
    },
    querySearch(queryString, cb) {
      var ary = []
      this.disks.forEach(item => {
        if (item.device != '') ary.push({ name: item.device, value: item.device })
      })
      const restaurants = []
      const value = []
      ary.forEach(item => {
        if (!value.includes(item.value)) {
          restaurants.push(item)
          value.push(item.value)
        }
      })
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      }
    },
    addItem() {
      if (this.disks.length === 10) return this.$message.error('数据盘最多可增加10个')
      const [{ id: categoryId }] = this.categoryList
      const ary = []
      this.disks.forEach(item => {
        if (!this.setDevice(item.device) && item.device != '') ary.push({ name: item.device, value: item.device })
      })
      const result = {
        ...element,
        serviceCode: 'cnware.standard.volume',
        categoryId,
        categoryMap: this.item.categoryMap,
        list: ary,
        diskType: this.diskType
      }
      this.getSku(result)
      this.disks.push(result)
    }
  }
}
</script>
<style lang="scss" scoped>
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
.disk-cell {
  padding: 20px;
  background-color: #f5f7fb;
  position: relative;
  .el-icon-close {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 20px;
    cursor: pointer;
  }
}
</style>
