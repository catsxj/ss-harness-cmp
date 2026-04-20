<template>
  <basic-form label-suffix="：" label-width="120px">
    <basic-form-item :label="item.label" v-for="item in preview" :key="item.name">
      <template v-if="typeof item.value === 'object'">
        <div v-for="cell in item.value" :key="cell">{{ cell }}</div>
      </template>
      <div v-else>{{ item.value }}</div>
    </basic-form-item>
  </basic-form>
</template>
<script>
import { computed, defineComponent } from '@vue/composition-api'

export default defineComponent({
  props: {
    itemData: {
      type: Object
    }
  },
  setup(props) {
    const preview = computed(() => {
      if (typeof props.itemData.preview === 'string') {
        return JSON.parse(props.itemData.preview)
      }
      return props.itemData.preview
    })
    return {
      preview
    }
  }
})
</script>
