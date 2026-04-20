<template>
  <basic-table ref="table" :data="specList" v-bind="tableProps">
    <slot></slot>
    <el-table-column sortable v-for="item in columnProps" :prop="item.value" show-overflow-tooltip :label="item.label" :key="item.value" width="150px"> </el-table-column>
    <el-table-column show-overflow-tooltip label="参考价格" v-if="showPrice">
      <template v-slot="scope"> {{ getPrice(scope.row, mode) }} 元/ {{ modeUnitFilter(mode) }} </template>
    </el-table-column>
    <slot name="append"></slot>
    <div slot="pagination"></div>
  </basic-table>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { getPrice, modeUnitFilter } from './utils'
interface IColumnProps {
  label: string
  value: string
}
type IProps = {
  skus: any[]
  mode: string
  columnProps: IColumnProps[]
}
export default defineComponent({
  props: {
    skus: {
      type: Array,
      default: function () {
        return []
      }
    },
    mode: {
      type: String,
      default: 'Hour'
    },
    showPrice: {
      default: false
    },
    columnProps: {
      type: Array,
      default: function () {
        return [
          {
            label: 'CPU（核）',
            value: 'cpu'
          },
          {
            label: '内存（GB）',
            value: 'memory'
          }
        ]
      }
    }
  },
  setup(props: IProps) {
    const specList = computed(() => {
      return props.skus.map((item: any) => {
        const result: any = {}
        item.spec.forEach((cell: any) => {
          result[cell.specName] = Number(cell.specValue)
        })
        return { ...item, ...result }
      })
    })
    // 规格高度的计算
    const tableProps = computed(() => {
      const [{ value } = { value: '' }] = props.columnProps
      const prop: any = {
        defaultSort: {
          prop: value
        }
      }
      const length = props.skus.length
      if (length >= 6) {
        prop.height = '260'
      }
      return prop
    })
    return {
      specList,
      tableProps,
      getPrice,
      modeUnitFilter
    }
  }
})
</script>
