<template>
  <svg class="svg-icon-compat" aria-hidden="true">
    <use :xlink:href="`#icon-${iconName}`" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ iconName?: string; className?: string }>()
</script>

<style scoped>
.svg-icon-compat {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
