<template>
  <svg class="icon svg-icon" aria-hidden="true" v-if="iconName.includes('svg')">
    <use :xlink:href="icon" />
  </svg>
  <i v-else class="icon" :class="iconName"></i>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    iconName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const icon = computed(() => `#icon-${props.iconName}`)
    return {
      icon,
    }
  },
})
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
