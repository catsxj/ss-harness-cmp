<template>
  <div>
    <basic-form-item :label="`${label}：`" v-if="item.elements && item.elements.length">
      <basic-form-item style="padding-left: 20px" label-width="60px" v-for="(cell, index) in item.elements" :key="index" :label="`${item.name || ''}${index + 1}`">
        <span>{{ categoryMap ? categoryMap[cell.categoryId].name : '' }}</span>
        <span class="m-l-sm">{{ generateSpec(findSku(cell)) }}{{ templateDisk ? `/${templateDisk}GB` : '' }}</span>
      </basic-form-item>
      <div v-if="!item.elements.length">--</div>
    </basic-form-item>
    <basic-form-item :label="`${label}：`" v-else>
      <span>{{ data.name }}</span>
      <span class="m-l-sm">{{ generateSpec(findSku(item)) }}{{ templateDisk ? `/${templateDisk}GB` : '' }}</span>
      <span class="tip" v-if="data.remark">（{{ data.remark }}）</span>
    </basic-form-item>
  </div>
</template>
<script>
import { generateSpec } from '../utils/index'
export default {
  props: {
    label: {
      type: String,
      default: ''
    },
    item: {
      type: Object
    },
    templateDisk: {
      type: [String, Number]
    }
  },
  computed: {
    categoryMap() {
      return this.item.categoryMap || {}
    },
    data() {
      const { categoryId, categoryMap = {} } = this.item
      return categoryMap[categoryId] || {}
    }
  },
  setup() {
    function findSku(item) {
      const { skuList, skuId } = item
      const sku = skuList.find((item) => item.id === skuId)
      if (this.templateDisk) {
        // 去掉 key 为 disk 的一项
        return sku.spec.slice(
          0,
          sku.spec.findIndex((i) => i.disk)
        )
      }
      return sku.spec
    }
    return {
      findSku,
      generateSpec
    }
  }
}
</script>
