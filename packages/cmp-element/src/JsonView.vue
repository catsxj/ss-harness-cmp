<template>
  <textarea ref="textareaEl"></textarea>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
// @ts-expect-error - codemirror@5 无内置 .d.ts
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/foldgutter.css'

// Vue 3 + TS port of original/cmp-element/components/json-view/JsonView.vue
// 保持原 API：props.value（对象或字符串）/ props.readOnly，@changed + @input
const props = withDefaults(
  defineProps<{
    value?: unknown
    readOnly?: boolean
  }>(),
  { readOnly: true }
)

const emit = defineEmits<{
  changed: [value: string]
  input: [value: string]
}>()

const textareaEl = ref<HTMLTextAreaElement | null>(null)
let editor: any = null

function stringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v ?? '')
  }
}

onMounted(() => {
  if (!textareaEl.value) return
  editor = CodeMirror.fromTextArea(textareaEl.value, {
    lineNumbers: true,
    mode: 'application/json',
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    theme: 'rubyblue',
    readOnly: props.readOnly
  })

  editor.setValue(stringify(props.value))
  editor.on('change', (cm: any) => {
    emit('changed', cm.getValue())
    emit('input', cm.getValue())
  })
})

watch(
  () => props.value,
  (value) => {
    if (!editor) return
    const editorValue = editor.getValue()
    const next = stringify(value)
    if (next !== editorValue) {
      editor.setValue(next)
    }
  },
  { deep: true }
)

function getValue(): string {
  return editor?.getValue() ?? ''
}

onBeforeUnmount(() => {
  if (editor) {
    editor.toTextArea()
    editor = null
  }
})

defineExpose({ getValue })
</script>
