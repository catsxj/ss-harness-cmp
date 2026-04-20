<template>
  <i class="icon" :class="icon"></i>
</template>
<script setup lang="ts">
interface Props {
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'el-icon-success green'
})
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
