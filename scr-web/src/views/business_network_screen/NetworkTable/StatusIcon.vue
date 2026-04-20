<template>
  <i class="icon" :class="icon"></i>
</template>
<script>
export default {
  props: {
    icon: {
      type: String,
      default: 'el-icon-success green'
    }
  },
  setup(props) {
    return {}
  }
}
</script>
<style lang="scss" scoped>
.icon {
  font-size: 18px;
}
.green {
  color: #19be6b;
}
.yellow {
  color: #ff9900;
}
.red {
  color: #f84540;
}
</style>
