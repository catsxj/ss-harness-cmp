<template>
  <textarea ref="textareaEl"></textarea>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
// @ts-expect-error - codemirror@5 无内置 .d.ts；迁移过渡期暂不引入 @types/codemirror
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'

// Vue 3 + TS port of original/cmp-element/components/code-mirror/CodeMirror.vue
// 保持原 API：props.value / props.readOnly，@changed 事件
const props = withDefaults(
  defineProps<{
    value?: string
    readOnly?: boolean
  }>(),
  { value: '', readOnly: true }
)

const emit = defineEmits<{
  changed: [value: string]
}>()

const textareaEl = ref<HTMLTextAreaElement | null>(null)
let editor: any = null

onMounted(() => {
  if (!textareaEl.value) return
  editor = CodeMirror.fromTextArea(textareaEl.value, {
    lineNumbers: true,
    theme: 'rubyblue',
    mode: 'shell',
    readOnly: props.readOnly,
    extraKeys: {
      F11(cm: any) {
        cm.setOption('fullScreen', !cm.getOption('fullScreen'))
      },
      Esc(cm: any) {
        if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false)
      }
    }
  })
  editor.setValue(props.value || '')
  editor.on('change', (cm: any) => {
    emit('changed', cm.getValue())
  })
})

watch(
  () => props.value,
  (value) => {
    if (!editor) return
    const editorValue = editor.getValue()
    if (value !== editorValue) {
      editor.setValue(value ?? '')
    }
  }
)

watch(
  () => props.readOnly,
  (value) => {
    editor?.setOption('readOnly', value)
  }
)

onBeforeUnmount(() => {
  if (editor) {
    editor.toTextArea()
    editor = null
  }
})
</script>
