<template>
  <div>
    <basic-form label-width="120px" :model="itemData.data" ref="data">
      <div v-for="item in diskList" :key="item.uuid">
        <el-divider content-position="left">{{ item.name }}</el-divider>
        <!-- <basic-form-item label="磁盘类型：">{{item.category | typeFilter}}</basic-form-item> -->
        <basic-form-item label="原有大小：">{{ item.size || item.oldSize }} GB</basic-form-item>
        <basic-form-item label="扩容至：">
          <el-select v-model="item.skuId" class="w m-r">
            <el-option :label="generateSpec(sku.spec)" v-for="sku in item.skuList" :key="sku.id" :value="sku.id"></el-option>
          </el-select>
          <!-- <el-slider class="m-b" v-model="item.disk" :step="10" :min="item.size" :max="item.max" show-input>
          </el-slider> -->
        </basic-form-item>
      </div>
      <div v-if="!diskList.length">暂无可扩容磁盘</div>
    </basic-form>
  </div>
</template>

<script>
import { getSkus } from 'services/services/product'
import { formatEqParams } from 'utils/index'
import { generateSpec, getSpecValue } from 'views/resource-apply/utils/index'

import { conditionVoleme } from 'services/platform/index'
export default {
  props: {
    itemData: {
      type: Object
    },
    config: {
      type: Object
    }
  },
  filters: {
    typeFilter(value) {
      const map = {
        SAS: '容量型',
        SSD: '高性能型'
      }
      return map[value]
    }
  },
  data() {
    return {
      generateSpec,
      loading: false,
      diskList: [],
      skuId: ''
    }
  },
  created() {
    if (this.itemData.editDataDisks) {
      this.diskList = []
      this.itemData.editDataDisks.forEach((item, index) => {
        const result = {
          ...item,
          ...this.itemData.upgrade[index]
        }
        this.getSku(result)
        this.diskList.push(result)
      })
    } else {
      this.getDisk()
    }
  },
  methods: {
    async getDisk() {
      const data = await conditionVoleme({ condition: 'vmDisks', serverId: this.itemData.id })
      if (data.success) {
        const ary = []
        data.data.forEach(item => {
          if (item.id == this.itemData.volumeId) {
            const { uuid, name, size, category, skuId, categoryId } = item
            const result = {
              uuid,
              name,
              size,
              category,
              disk: size,
              categoryId,
              skuId,
              max: 1024,
              sliderMarks: {}
            }
            this.getSku(result)
            ary.push(result)
          }
        })
        this.diskList = ary
      }
    },
    getSku(item) {
      const { categoryId } = item
      this.loading = true
      getSkus(formatEqParams({ categoryId, serviceCode: 'fusionsphere.standard.volume' }))
        .then(data => {
          if (data.success) {
            if (!data.data.length) return this.$message.error('该产品类型下不存在产品，请检查')
            const cell = data.data[0]
            // const [{ specValue: min }, { specValue: max }] = JSON.parse(cell.spec);
            if (!item.skuId) item.skuId = cell.id
            // item.min = Number(min);
            // item.max = Number(max);
            const list = []
            for (let index = 0; index < data.data.length; index++) {
              const element = data.data[index]
              const spec = JSON.parse(element.spec)
              if (spec[0].specValue > item.size) {
                list.push({
                  ...element,
                  spec
                })
              }
            }
            this.$set(item, 'skuList', list)
            item.skuId = list.length ? list[0].id : ''
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    ok() {
      const { service, expiredTime } = this.itemData
      const obj = {
        service,
        instance: this.itemData.uuid,
        instanceName: this.itemData.name,
        operation: 'EditDisk',
        upgrade: [],
        editDataDisks: [],
        expiredTime
      }
      this.diskList.forEach(item => {
        const { uuid, skuId, name } = item
        obj.upgrade.push({
          serviceCode: 'fusionsphere.standard.volume',
          uuid,
          skuId,
          specs: [
            {
              ...getSpecValue(item)
            }
          ]
        })
        obj.editDataDisks.push({
          name,
          ...getSpecValue(item),
          oldSize: item.size
        })
      })
      return obj
    },
    getApplyData() {
      const obj = {
        ...this.itemData,
        upgrade: [],
        editDataDisks: []
      }
      this.diskList.forEach(item => {
        const { uuid, skuId, name } = item
        obj.upgrade.push({
          serviceCode: 'fusionsphere.standard.volume',
          uuid,
          skuId,
          specs: [
            {
              ...getSpecValue(item)
            }
          ]
        })
        obj.editDataDisks.push({
          name,
          ...getSpecValue(item),
          oldSize: item.oldSize
        })
      })
      return obj
    }
  }
}
</script>

<style></style>
