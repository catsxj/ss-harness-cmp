<template>
  <div id="Toolbar">
    <i data-command="zoomIn" class="command iconfont icon-fangda" title="放大"></i>
    <i data-command="zoomOut" class="command iconfont icon-suoxiao" title="缩小"></i>
    <i data-command="autoZoom" class="command iconfont icon-shiyinghuabu" title="适应画布"></i>
    <i data-command="resetZoom" class="command iconfont icon-shijichicun" title="实际尺寸"></i>
  </div>
</template>

<script setup lang="ts">
// Vue 3 port of original/cmp-graph/src/components/ToolbarSimple.vue
// 纯模板，无状态；g6-editor 通过 data-command 绑定 DOM 事件
</script>

<style lang="scss" scoped>
#Toolbar {
  position: absolute;
  right: 10px;
  top: 10%;
  background: #fff;
  z-index: 2;
  padding: 4px 0;
  width: 40px;
  height: 120px;
  border: 1px solid #e9e9e9;

  .separator {
    margin: 4px;
    border-left: 1px solid #e9e9e9;
  }

  .command {
    font-size: 16px;
    margin: 0 6px;
    border-radius: 2px;
    padding: 5px;
    color: #333;
    display: inline-block;
    border: 1px solid rgba(2, 2, 2, 0);

    &:hover {
      cursor: pointer;
      border: 1px solid #e9e9e9;
    }
  }
}
</style>
