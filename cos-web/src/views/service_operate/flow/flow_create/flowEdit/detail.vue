<template>
  <div class="edit-wrapper">
    <div class="edit-body">
      <div id="page"></div>
      <MiniMap @change-zoom="changeZoom"></MiniMap>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { Editor, MiniMap } from 'cmp-graph'
import './components/registerNode'

export default {
  mixins: [Editor],
  components: {
    MiniMap
  },
  data() {
    return {
      mode: 'readOnly',
      panelItems: [{ type: 'Minimap' }]
    }
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>
<style lang="scss" scoped>
.edit-wrapper {
  position: relative;
  background: #fff;
  width: 100%;
  height: 100%;
  .edit-body {
    #page {
      /*margin-right: 200px;*/
    }
  }
}
</style>
