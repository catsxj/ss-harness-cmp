<template>
  <div class="preview">
    <common-wrapper :propsUuid="$route.query.uuid" />
  </div>
</template>
<script>
import CommonWrapper from '../designer/tools/componentWrapper.vue'
export default {
  components: {
    CommonWrapper
  }
}
</script>
<style scoped>
.preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
  background: #fff;
}
</style>
