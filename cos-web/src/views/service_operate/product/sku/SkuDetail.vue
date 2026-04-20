<template>
  <common-detail-right :title="detailData.code" @goBack="$emit('goBack')">
    <template v-slot:item_container>
      <common-detail-item label="规格代码">{{ detailData.code }}</common-detail-item>
      <common-detail-item label="资费代码">{{ detailData.tariffCode }}</common-detail-item>
      <common-detail-item label="状态">
        <status-icon :type="skuStatusFilter(detailData.status, 'color')">
          {{ skuStatusFilter(detailData.status) }}
        </status-icon>
      </common-detail-item>
      <common-detail-item label="产品规格">{{ generateSpec(detailData) }}</common-detail-item>
      <common-detail-item label="产品描述">{{ detailData.remark }}</common-detail-item>
    </template>
    <basic-table :data="[{}]" v-if="serviceItem.billable">
      <el-table-column label="计费策略">
        <template>
          {{ billPolicyFilter(serviceItem.billPolicy) }}
        </template>
      </el-table-column>
      <el-table-column label="按需计费(元/小时)">
        <template>
          <span>{{ getPrice('hourPrice') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="包月(元/月)">
        <template>
          <span>{{ getPrice('monthPrice') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="包年(元/年)">
        <template>
          <span>{{ getPrice('yearPrice') }}</span>
        </template>
      </el-table-column>
      <div slot="pagination"></div>
    </basic-table>
  </common-detail-right>
</template>
<script lang="ts">
import { generateSpec, getPrice as getPrices } from './utils'
import { skuStatusFilter } from './filter'
import { defineComponent } from '@vue/composition-api'
import { billPolicyFilter } from '../service_catalog/filter'

export default defineComponent({
  props: {
    detailData: {
      type: Object,
      required: true
    },
    serviceItem: {}
  },
  setup(props) {
    function getPrice(type: string) {
      console.log(props.detailData)
      return getPrices(type, props.serviceItem, {
        ...props.detailData,
        spec: JSON.parse(props.detailData.spec)
      })
    }
    return {
      generateSpec,
      getPrice,
      billPolicyFilter,
      skuStatusFilter
    }
  }
})
</script>
<style scoped lang="scss">
::v-deep {
  .el-card {
    box-shadow: none;
    border-bottom: none;
  }
}
</style>
