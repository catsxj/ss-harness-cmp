<template>
  <div id="Contextmenu">
    <div data-status="node-selected" class="menu">
      <div data-command="copy" class="command"><span>复制</span></div>
      <div data-command="delete" class="command"><span>删除</span></div>
    </div>
    <div data-status="edge-selected" class="menu">
      <div data-command="delete" class="command"><span>删除</span></div>
    </div>
    <div data-status="group-selected" class="menu">
      <div data-command="copy" class="command"><span>复制</span></div>
      <div data-command="delete" class="command"><span>删除</span></div>
      <div data-command="unGroup" class="command"><span>解组</span></div>
    </div>
    <div data-status="canvas-selected" class="menu">
      <div data-command="undo" class="command"><span>撤销</span></div>
      <div data-command="redo" class="command"><span>重做</span></div>
      <div data-command="pasteHere" class="command"><span>粘贴</span></div>
    </div>
    <div data-status="multi-selected" class="menu">
      <div data-command="copy" class="command"><span>复制</span></div>
      <div data-command="paste" class="command"><span>粘贴</span></div>
      <div data-command="addGroup" class="command"><span>归组</span></div>
      <div data-command="delete" class="command"><span>删除</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue 3 port of original/cmp-graph/src/components/ContextMenu.vue
// 纯模板组件，g6-editor 通过 data-status / data-command 定位 DOM；无脚本逻辑
</script>

<style lang="scss">
#Contextmenu {
  margin: 0;
  width: 200px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  color: #000;
  font-size: 12px;
  display: none;

  .disable {
    color: rgba(0, 0, 0, 0.25);
  }

  .command {
    height: 12px;
    padding: 8px;
    box-sizing: content-box;

    &:hover {
      cursor: pointer;
      background: #e6f7ff;
    }

    &.disable:hover {
      cursor: default;
      background: none;
    }
  }

  span:nth-of-type(1) {
    float: left;
  }
}
</style>
