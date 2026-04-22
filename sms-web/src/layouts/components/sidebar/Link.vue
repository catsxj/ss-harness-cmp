<template>
  <component :is="linkProps.is" v-bind="linkProps">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isExternalLink } from 'utils/resolvePath'

const props = defineProps<{
  to: string
}>()

interface LinkProps {
  is: string
  href?: string
  target?: string
  to?: string
}

const linkProps = computed<LinkProps>(() => {
  if (isExternalLink(props.to)) {
    return {
      is: 'a',
      href: props.to,
      target: '_blank'
    }
  }
  return {
    is: 'router-link',
    to: props.to
  }
})
</script>
