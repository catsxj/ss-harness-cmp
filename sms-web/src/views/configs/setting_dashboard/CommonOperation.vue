<template>
  <el-row class="operation-wrapper" :gutter="11">
    <el-col :span="6" v-for="(item, index) in list" :key="index">
      <div class="operation-cell" @click="goPage(item.path)">
        <span>{{ item.name }}</span>
        <el-icon v-if="isSetting" class="close-icon" @click.stop="closeCell(item.path)"><Close /></el-icon>
      </div>
    </el-col>
    <el-col :span="6" v-if="isSetting">
      <el-popover placement="bottom" :width="200" trigger="click">
        <template #reference>
          <div class="operation-cell">
            <el-icon class="m-r-sm"><Plus /></el-icon>
            <!-- TODO: i18n -->
            <span>添加快捷入口</span>
          </div>
        </template>
        <!-- TODO: i18n -->
        <el-select v-model="itemData.config.selecteds" multiple filterable collapse-tags placeholder="请选择">
          <el-option v-for="item in shortcuts" :key="item.name" :label="item.name" :value="item.path"></el-option>
        </el-select>
      </el-popover>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { shortcuts } from './data'
import { Close, Plus } from '@element-plus/icons-vue'

const props = defineProps<{
  itemData: { config: { selecteds?: string[] } }
  isSetting?: boolean
}>()

const list = computed(() => {
  return shortcuts.filter((item) => {
    const { selecteds = [] } = props.itemData.config
    return selecteds.includes(item.path)
  })
})

function closeCell(path: string) {
  const { selecteds = [] } = props.itemData.config
  selecteds.splice(selecteds.indexOf(path), 1)
}

// TODO: cmp-element - 原使用 context.root.mainRouter (基座注入)，Qiankun 全局跳转后续统一改为 initGlobalState
function goPage(path: string) {
  const mainRouter = (window as any).mainRouter
  if (mainRouter?.push) {
    mainRouter.push(path)
  } else {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}
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
    .close-icon {
      display: none;
    }
    &:hover {
      background: #e8efff;
      .close-icon {
        display: inline-block;
      }
    }
  }
}
</style>
