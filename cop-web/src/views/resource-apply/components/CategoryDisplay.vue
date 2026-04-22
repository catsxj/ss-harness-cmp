<template>
  <div>
    <basic-form-item :label="`${label}：`" v-if="item.elements">
      <basic-form-item style="padding-left: 20px" label-width="60px" v-for="(cell, index) in item.elements" :key="index" :label="`${item.name}${index + 1}`">
        <span>{{ categoryMap[cell.categoryId].name }}</span>
        <span class="m-l-sm">{{ generateSpec(findSku(cell)) }}</span>
      </basic-form-item>
      <div v-if="!item.elements.length">--</div>
    </basic-form-item>
    <basic-form-item :label="`${label}：`" v-else>
      <span>{{ data.name }}</span>
      <span class="m-l-sm">{{ generateSpec(findSku(item)) }}</span>
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
      const sku = skuList.find(item => item.id === skuId)
      return sku.spec
    }
    return {
      findSku,
      generateSpec
    }
  }
}
</script>
