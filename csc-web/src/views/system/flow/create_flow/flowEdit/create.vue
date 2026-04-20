<template>
  <div class="edit-wrapper">
    <Toolbar @changeEdge="changeEdge"></Toolbar>
    <div class="edit-body">
      <ItemPanel></ItemPanel>
      <ContextMenu></ContextMenu>
      <div id="page"></div>
      <MiniMap @change-zoom="changeZoom"></MiniMap>
    </div>
  </div>
</template>

<script>
import { Editor, Toolbar, MiniMap, ContextMenu } from 'cmp-graph'
import ItemPanel from './components/ItemPanel'
import './components/registerNode'

export default {
  mixins: [Editor],
  components: {
    Toolbar,
    ItemPanel,
    MiniMap,
    ContextMenu
  },
  data() {
    return {
      panelItems: [{ type: 'Toolbar' }, { type: 'Contextmenu' }, { type: 'Minimap' }, { type: 'Itempannel' }]
    }
  },
  created() {}
}
</script>
<style lang="scss" scoped>
.edit-wrapper {
  position: relative;
  background: #fff;
  width: 100%;
  height: 100%;
  .edit-body {
    width: 100%;
    height: 100%;
    position: relative;
    #page {
      margin-left: 200px;
    }
  }
}
</style>
