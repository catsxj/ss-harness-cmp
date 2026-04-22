<template>
  <div class="box">
    <div class="box1">
      <slot></slot>
    </div>
    <div class="box2">
    </div>
    <div class="box3"></div>
  </div>
</template>

<script>
export default {}
</script>
<style lang="scss" scoped>
$color: #ebebeb;
.box {
  width: 60px;
  height: 20px;
  overflow: hidden;
}
.box1 {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  background: $color;
  position: absolute;
  left: 20px;
  z-index: 2;
}
.box2,
.box3 {
  border: 20px solid transparent;
  border-bottom: 20px solid $color;
  position: absolute;
  left: 20px;
  top: -20px;
}
.box3 {
  left: 0px;
}
.collapsed {
  $color: #fff;
  .box1 {
    background: $color;
  }
  .box2,
  .box3 {
    border: 20px solid transparent;
    border-bottom: 20px solid $color;
  }
}
</style>
