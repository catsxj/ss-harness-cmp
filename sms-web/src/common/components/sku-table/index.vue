<template>
  <basic-table ref="table" :data="specList" v-bind="tableProps">
    <slot></slot>
    <el-table-column sortable v-for="item in columnProps" :prop="item.value" show-overflow-tooltip :label="item.label" :key="item.value" width="150px"> </el-table-column>
    <el-table-column show-overflow-tooltip label="参考价格" v-if="showPrice">
      <template #default="scope"> {{ getPrice(scope.row, mode) }} 元/ {{ modeUnitFilter(mode) }} </template>
    </el-table-column>
    <slot name="append"></slot>
    <template #pagination><span></span></template>
  </basic-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPrice, modeUnitFilter } from './utils'

interface IColumnProps {
  label: string
  value: string
}

// TODO: type - skus 元素结构来源于后端，后续可补 interface
interface ISku {
  spec: { specName: string; specValue: string | number }[]
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    skus?: ISku[]
    mode?: string
    showPrice?: boolean
    columnProps?: IColumnProps[]
  }>(),
  {
    skus: () => [],
    mode: 'Hour',
    showPrice: false,
    columnProps: () => [
      { label: 'CPU（核）', value: 'cpu' },
      { label: '内存（GB）', value: 'memory' }
    ]
  }
)

const specList = computed(() => {
  return props.skus.map((item) => {
    const result: Record<string, number> = {}
    item.spec.forEach((cell) => {
      result[cell.specName] = Number(cell.specValue)
    })
    return { ...item, ...result }
  })
})

// 规格高度的计算
const tableProps = computed(() => {
  const [{ value } = { value: '' }] = props.columnProps
  const prop: Record<string, unknown> = {
    defaultSort: { prop: value }
  }
  const length = props.skus.length
  if (length >= 6) {
    prop.height = '260'
  }
  return prop
})
</script>
