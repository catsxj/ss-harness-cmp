<template>
  <div>
    <basic-form-item label="数据盘：" class="m-b-lg">
      <el-row>
        <el-col :span="24">
          <!-- <i class="el-icon-plus"></i> -->
          <el-button type="text" @click.native="addItem()">添加数据盘</el-button>
          <span style="font-size: 12px; margin-left: 32px">您已选择{{ disks.length || 0 }}块盘，还可以选择{{ 4 - (disks.length || 0) }}块盘</span>
        </el-col>
        <el-col :span="24" v-for="(cell, index) in disks" :key="index" class="m-t disk-cell">
          <el-col :span="22">
            <el-select v-model="cell.categoryId" @change="getSku(cell)" class="w m-r-xs">
              <el-option :label="item.name" v-for="(item, index) in categoryList" :key="index" :value="item.id"></el-option>
            </el-select>
            <el-select v-model="cell.skuId" class="w m-r-xs">
              <el-option :label="generateSpec(item.spec)" v-for="item in cell.skuList" :key="item.id" :value="item.id"></el-option>
            </el-select>
            <i class="el-icon-close" @click="removeItem(index)"></i>
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
import { generateSpec } from '../../utils/index'

export default {
  props: {
    addData: {
      type: Object
    },
    item: {
      type: Object
    }
    // diskType: {
    //   type: String,
    //   default: 'sameAsSource'
    // }
  },
  data() {
    return {
      categoryList: []
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
  methods: {
    generateSpec,
    loadSku() {
      if (this.disks.length) {
        this.handleShowData()
      }
    },
    handleShowData() {
      this.disks.forEach((item) => {
        this.getSku(item)
      })
    },
    // 获取服务类型
    getCategoryList() {
      getCategoriesByCode('zstack.standard.volume').then((data) => {
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
        .then((data) => {
          if (data.success) {
            if (!data.data.length) return this.$message.error('该产品类型下不存在产品，请检查')
            if (!skuId) {
              const cell = data.data[0]
              item.skuId = cell.id
            }
            this.$set(
              item,
              'skuList',
              data.data.map((item) => {
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
      data.forEach((item) => {
        const { id, name, remark, props } = item
        map[id] = { name, remark, props }
      })
      return map
    },
    removeItem(index) {
      this.disks.splice(index, 1)
    },
    addItem() {
      const [{ id: categoryId }] = this.categoryList
      const ary = []
      // this.disks.forEach(item => {
      //   if (!this.setDevice(item.device) && item.device != '') ary.push({ name: item.device, value: item.device })
      // })
      const result = {
        ...element,
        serviceCode: 'zstack.standard.volume',
        categoryId,
        categoryMap: this.item.categoryMap,
        size: 10,
        insAmount: 1
      }
      this.getSku(result)
      this.disks.push(result)
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 200px !important;
}
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
