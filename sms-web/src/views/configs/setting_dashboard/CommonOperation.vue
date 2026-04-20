<template>
  <el-row class="operation-wrapper" :gutter="11">
    <el-col :span="6" v-for="(item, index) in list" :key="index">
      <div class="operation-cell" @click="goPage(item.path)">
        <span>{{ item.name }}</span>
        <i class="el-icon-close" @click.stop="closeCell(item.path)" v-if="isSetting"></i>
      </div>
    </el-col>
    <el-col :span="6" v-if="isSetting">
      <el-popover placement="bottom" width="200" trigger="click">
        <el-select v-model="itemData.config.selecteds" multiple filterable collapse-tags placeholder="请选择">
          <el-option v-for="item in shortcuts" :key="item.name" :label="item.name" :value="item.path"> </el-option>
        </el-select>
        <div class="operation-cell" slot="reference">
          <i class="el-icon-plus m-r-sm"></i>
          <span>添加快捷入口</span>
        </div>
      </el-popover>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api'
import { shortcuts } from './data'
export default defineComponent({
  props: {
    itemData: {
      type: Object as PropType<{ config: any }>,
      required: true
    },
    isSetting: {
      type: Boolean
    }
  },
  setup(props, context) {
    const list = computed(() => {
      return shortcuts.filter((item) => {
        const {
          config: { selecteds = [] }
        } = props.itemData
        return selecteds.includes(item.path)
      })
    })
    function closeCell(path: string) {
      const {
        config: { selecteds = [] }
      } = props.itemData
      selecteds.splice(selecteds.indexOf(path), 1)
    }
    function goPage(path: string) {
      ;(context.root as any).mainRouter.push(path)
    }
    return {
      shortcuts,
      list,
      closeCell,
      goPage
    }
  }
})
</script>
<style lang="scss" scoped>
.operation-wrapper {
  height: 100%;
  overflow: auto;
  .operation-cell {
    padding: 0 16px;
    height: 40px;
    display: flex;
    margin-bottom: 16px;
    align-items: center;
    background: #f2f4f8;
    border-radius: 4px;
    cursor: pointer;
    & > span {
      flex: 1;
    }
    .el-icon-close {
      display: none;
    }
    &:hover {
      background: #e8efff;
      .el-icon-close {
        display: inline-block;
      }
    }
  }
}
</style>
