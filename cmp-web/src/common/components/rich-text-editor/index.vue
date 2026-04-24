<template>
  <div class="rich-editor">
    <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" />
    <Editor
      v-model="valueHtml"
      :default-config="editorConfig"
      mode="default"
      @on-created="handleCreated"
      @on-change="handleChange"
    />
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
// @ts-expect-error - @wangeditor/editor-for-vue 无 .d.ts for vue 3 named export
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

const props = withDefaults(
  defineProps<{ value?: string }>(),
  { value: '' }
)
const emit = defineEmits<{ change: [value: string] }>()

const editorRef = shallowRef<any>()
const valueHtml = ref<string>(props.value)

watch(
  () => props.value,
  (v) => {
    if (valueHtml.value !== v) valueHtml.value = v
  }
)

function handleCreated(editor: any) {
  editorRef.value = editor
}
function handleChange(editor: any) {
  emit('change', editor.getHtml())
}

onBeforeUnmount(() => {
  editorRef.value?.destroy?.()
})

const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }
</script>
<style scoped>
.rich-editor {
  position: relative;
  z-index: 1;
}
</style>
