<template>
  <div class="table-container">
    <el-table ref="form" v-bind="$attrs" fit
          :data="formatData"
          :row-style="showRow"
          :row-class-name="rowClassName"
          header-cell-class-name="custom-header"
          @selection-change="handleSelectionChange"
          @select="handleSelectItem"
          @select-all="handleSelectAll">
      <el-table-column v-if="columns.length === 0" width="40">
        <template slot-scope="scope">
          <span v-for="space in scope.row._level" :key="space" class="ms-tree-space"/>
          <span v-if="iconShow(0, scope.row)" class="tree-ctrl" @click="toggleExpanded(scope.$index)">
            <i class="el-icon-arrow-right" :style="{ transform: !scope.row._expanded ? 'rotate(0)' : 'rotate(90deg)' }"/>
          </span>
        </template>
      </el-table-column>
      <el-table-column v-for="(column, index) in columns" v-else :key="column.value" :label="column.text" width="250">
        <template slot-scope="scope">
          <template v-for="space in scope.row._level">
            <span v-if="index === 0" :key="space" class="ms-tree-space"/>
          </template>
          <span v-if="iconShow(index, scope.row)" class="tree-ctrl" @click="toggleExpanded(scope.$index)">
            <i class="el-icon-arrow-right" :style="{ transform: !scope.row._expanded ? 'rotate(0)' : 'rotate(90deg)' }"/>
          </span>
          {{ scope.row[column.value] }}
        </template>
      </el-table-column>
      <slot/>
    </el-table>
    <slot name="pagination">
      <div class="pagination-container">
        <el-pagination @size-change="handleSizeChange"
          @current-change="getList"
          :current-page.sync="params.page"
          :page-sizes="[5,10,20,30,50]"
          :page-size="params.rows"
          background
          layout="total, prev, pager, next, sizes, jumper"
          :total="total">
        </el-pagination>
      </div>
    </slot>
  </div>
</template>

<script>
import treeToArray from './eval'
export default {
  name: 'TreeTable',
  props: {
    data2: {
      type: [Array, Object],
      required: true
    },
    columns: {
      type: Array,
      default: () => []
    },
    params: {
      type: Object,
      default: () => {}
    },
    getList: Function,
    total: Number,
    evalFunc: Function,
    evalArgs: Array,
    expandAll: {
      type: Boolean,
      default: false
    },
    rowClassName: Function
  },
  computed: {
    // 格式化数据源
    formatData () {
      let tmp
      if (!this.data2) {
        tmp = []
      } else if (!Array.isArray(this.data2)) {
        tmp = [this.data2]
      } else {
        tmp = this.data2
      }
      const func = treeToArray
      const args = this.evalArgs ? Array.concat([tmp, this.expandAll], this.evalArgs) : [tmp, this.expandAll]

      return func.apply(null, args)
    }
  },
  watch: {
    'params.page': function () {
      const { data2, getList } = this;
      if (data2.length === 0 && getList && typeof getList === 'function') {
        this.getList();
      }
    }
  },
  methods: {
    showRow (row) {
      const baseHideStyle = 'display:none;'
      const show = row.row.parent ? (row.row.parent._expanded && row.row.parent._show) : true
      row.row._show = show
      return show ? '' : baseHideStyle
    },
    // 切换下级是否展开
    toggleExpanded (trIndex) {
      const record = this.formatData[trIndex]
      record._expanded = !record._expanded
    },
    // 图标显示
    iconShow (index, record) {
      return (index === 0 && record.children && record.children.length > 0)
    },
    handleSelectionChange (val) {
      this.$emit('selection-change', val)
    },
    handleSelectItem (val, row) {
      this.$emit('select', val, row)
    },
    handleSelectAll (val) {
      this.$emit('select-all', val)
    },
    handleSizeChange (val) {
      this.params.rows = val
      this.getList()
    },
    clearSelection () {
      this.$refs.form.clearSelection()
    },
    toggleRowSelection (row, selected) {
      this.$refs.form.toggleRowSelection(row, selected)
    }
  }
}
</script>

<style lang="scss" scoped>
  $color-ctrl: #666;
  $space-width: 10px;
  .ms-tree-space {
    position: relative;
    top: 1px;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    width: $space-width;
    height: 14px;
    &::before {
      content: ""
    }
  }
  .processContainer{
    width: 100%;
    height: 100%;
  }
  table td {
    line-height: 26px;
  }
  .tree-ctrl{
    position: relative;
    cursor: pointer;
    color: $color-ctrl;
    margin-left: -$space-width;
  }
  .el-icon-arrow-right {
    transition: transform .2s ease
  }
</style>
