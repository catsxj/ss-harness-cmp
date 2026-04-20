<template>
  <div class="select-round">
    <div class="content"></div>
  </div>
</template>
<script>
export default {}
</script>
<style lang="scss" scoped>
.select-round {
  width: 10px;
  height: 10px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  right: -10px;
  transform: rotate(-90deg);
  &.left {
    bottom: 0;
    left: -10px;
    transform: rotate(180deg);
  }
  .content {
    width: 20px;
    height: 20px;
    background: radial-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 71%, #e7f4ff 0%);
  }
}
</style>
