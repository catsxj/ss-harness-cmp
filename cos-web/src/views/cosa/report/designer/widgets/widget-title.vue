<template>
  <section :style="style">
    <div
      ref="textArea"
      :style="{ fontSize: options.title.fontSize + 'px', fontWeight: options.title.fontWeight, color: options.title.color, height: '100%' }"
      contenteditable="true"
      class="editable"
      @input="inputTitle"
    >
      {{ options.title.text || '标题' }}
    </div>
  </section>
</template>
<script>
import { MinxinStyleOptions } from './minxin-style-options'
export default {
  mixins: [MinxinStyleOptions],
  methods: {
    inputTitle(evt) {
      this.$set(this.options.title, 'text', evt.target.innerText)
      const options = this.options
      options.title.text = evt.target.innerText
      this.$store.commit('updateElementOptions', { uuid: this.element.uuid, options })
      this.setFocus()
    },
    setFocus() {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(this.$refs.textArea)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}
</script>
<style lang="scss" scoped>
.editable {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
