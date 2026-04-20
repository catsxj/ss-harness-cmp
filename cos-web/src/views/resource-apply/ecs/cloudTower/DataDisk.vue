<template>
  <basic-form-item label="数据盘：" class="m-b-lg">
    <el-row>
      <el-col :span="24" v-for="(cell, index) in disks" :key="index" class="m-t">
        <el-col :span="24">
          <el-select filterable v-model="cell.categoryId" @change="getSku(cell)" class="w m-r-xs">
            <el-option :label="item.name" v-for="(item, index) in categoryList" :key="index" :value="item.id"></el-option>
          </el-select>
          <el-select filterable v-model="cell.skuId" class="w m-r-xs">
            <el-option :label="generateSpec(item.spec)" v-for="item in cell.skuList" :key="item.id" :value="item.id"></el-option>
          </el-select>
          总线：
          <el-select filterable v-model="cell.bus" class="w m-r-xs">
            <el-option v-for="(item, index) in busData" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
          存储策略：
          <el-select filterable v-model="cell.volumeTemplateId" @change="volumeTemplateChange(cell)" class="w m-r-xs">
            <el-option v-for="(item, index) in templateData" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-button size="mini" class="m-r-sm" type="danger" v-if="disks.length > 1" icon="el-icon-minus" @click="removeItem(index)"></el-button>
        </el-col>
      </el-col>
      <el-col :span="4" class="add-border" :class="{ 'm-t-md': disks.length }" @click.native="addItem()">
        <i class="el-icon-plus"></i>
      </el-col>
    </el-row>
  </basic-form-item>
</template>
<script>
import { element } from '../../data/init'
import { getCategoriesByCode, getSkus } from 'services/services/product'
import { formatEqParams } from 'utils'
import { getVolumeTpl } from 'services/platform/smart.js'
import { generateSpec } from 'views/resource-apply/utils/index'

export default {
  props: {
    addData: {
      type: Object
    },
    item: {
      type: Object
    }
  },
  data() {
    return {
      categoryList: [],
      fileList: [],
      busData: [
        { name: 'VIRTIO', value: 'VIRTIO' },
        { name: 'SCSI', value: 'SCSI' },
        { name: 'IDE', value: 'IDE' }
      ],
      templateData: []
    }
  },
  computed: {
    disks() {
      return this.item.elements
    }
  },
  async created() {
    await this.getCategoryList()
    await this.getTemplateData()
    if (!this.disks.length) this.addItem()
  },
  methods: {
    generateSpec,
    volumeTemplateChange(cell) {
      cell.volumeTemplateName = this.templateData.find(({ id }) => id === cell.volumeTemplateId).name
    },
    async getTemplateData() {
      await getVolumeTpl({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId: this.addData.location.vendorId
        })
      }).then((data) => {
        if (data.success) {
          this.templateData = data.data.rows
        }
      })
    },
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
    async getCategoryList() {
      await getCategoriesByCode('cloudtower.standard.volume').then((data) => {
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
      if (this.disks.length === 4) return this.$message.error('数据盘最多可增加四个')
      const [{ id: categoryId }] = this.categoryList
      if (!this.templateData.length) return this.$message.error('存储策略为空，添加失败')
      const result = {
        ...element,
        serviceCode: 'cloudtower.standard.volume',
        categoryId,
        categoryMap: this.item.categoryMap,
        size: '',
        type: 'newDisk',
        // name: '',
        bus: 'VIRTIO', // 总线
        volumeTemplateId: this.templateData[0].id, // 存储策略
        volumeTemplateName: this.templateData[0].name
      }
      this.getSku(result)
      this.disks.push(result)
    }
  }
}
</script>
<style lang="scss" scoped>
.w {
  width: 150px !important;
}
.add-border {
  padding: 2px;
  cursor: pointer;
  border: 1px dashed black;
  text-align: center;
}
</style>
