<template>
  <div id="Toolbar">
    <i data-command="undo" class="command iconfont icon-chexiao" title="撤销"></i>
    <i data-command="redo" class="command iconfont icon-zhongzuo1" title="重做"></i>
    <span class="separator"></span>
    <i data-command="copy" class="command iconfont icon-fuzhi" title="复制"></i>
    <i data-command="paste" class="command iconfont icon-niantie" title="粘贴"></i>
    <i data-command="delete" class="command iconfont icon-shanchu" title="删除"></i>
    <span class="separator"></span>
    <i data-command="zoomIn" class="command iconfont icon-fangda" title="放大"></i>
    <i data-command="zoomOut" class="command iconfont icon-suoxiao" title="缩小"></i>
    <i data-command="autoZoom" class="command iconfont icon-shiyinghuabu" title="适应画布"></i>
    <i data-command="resetZoom" class="command iconfont icon-shijichicun" title="实际尺寸"></i>
    <span class="separator"></span>
    <i data-command="toBack" class="command iconfont icon-cengjihouzhi" title="层级后置"></i>
    <i data-command="toFront" class="command iconfont icon-cengjiqianzhi" title="层级前置"></i>
    <span class="separator"></span>
    <i data-command="multiSelect" class="command iconfont icon-duoxuan" title="多选"></i>
    <i data-command="addGroup" class="command iconfont icon-chengzu" title="成组"></i>
    <i data-command="unGroup" class="command iconfont icon-jiezu" title="解组"></i>
    <span class="separator"></span>
    <el-radio-group v-model="lineType" size="small" @change="selectLine">
      <el-radio value="flow-polyline">折线</el-radio>
      <el-radio value="flow-smooth">曲线</el-radio>
      <el-radio value="flow-polyline-round">圆角折线</el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Vue 3 port of original/cmp-graph/src/components/Toolbar.vue
// Element Plus 兼容：`size="mini"` → `"small"`，`<el-radio label="x">` → `value="x"`
const lineType = ref('flow-polyline')

const emit = defineEmits<{
  changeEdge: [value: string]
}>()

function selectLine(value: string | number | boolean | undefined): void {
  emit('changeEdge', String(value ?? ''))
}

onMounted(() => {
  setTimeout(() => {
    selectLine('flow-polyline')
  })
})
</script>

<style lang="scss" scoped>
#Toolbar {
  background: #fff;
  padding: 4px 0;
  width: 100%;
  border: 1px solid #e9e9e9;
  box-shadow: 0 8px 12px 0 rgba(0, 52, 107, 0.04);
  text-align: left;
  color: #333;

  .disable {
    color: rgba(0, 0, 0, 0.25);

    &:hover {
      cursor: default;
      border: 1px solid rgba(2, 2, 2, 0);
    }
  }

  .icon-select.disable {
    background: #eeeeee;
  }

  .separator {
    margin: 4px;
    border-left: 1px solid #e9e9e9;
  }

  .command {
    font-size: 16px;
    margin: 0 6px;
    border-radius: 2px;
    padding: 5px;
    display: inline-block;
    border: 1px solid rgba(2, 2, 2, 0);

    &:nth-of-type(1) {
      margin-left: 24px;
    }

    &:hover {
      cursor: pointer;
      border: 1px solid #e9e9e9;
    }
  }

  .el-radio-group {
    font-size: 0 !important;
  }
}
</style>
