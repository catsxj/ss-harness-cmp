<template>
  <iframe :src="url" frameborder="0" class="iframe"></iframe>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class extends Vue {
  get url () {
    return this.$route.meta.externalPath;
  }
}
</script>
<style scoped>
  .iframe {
    width: 100%;
    height: 100%;
    min-height: 700px;
  }

</style>
