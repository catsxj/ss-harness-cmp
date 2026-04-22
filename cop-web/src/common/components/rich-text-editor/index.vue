<template>
  <div ref='editor' class="rich-editor"></div>
</template>
<script>
import { onMounted, onBeforeUnmount, ref, watch } from '@vue/composition-api';
import WangEditor from 'wangeditor';
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  setup(props, context) {
    watch(() => props.value, () => {
      if (instance) {
        instance.txt.html(props.value);
      }
    });
    const editor = ref();
    let instance;
    onMounted(() => {
      instance = new WangEditor(editor.value);
      Object.assign(instance.config, {
        onchange(val) {
          context.emit('change', val)
        }
      });
      instance.create();
    });
    onBeforeUnmount(() => {
      instance.destroy();
      instance = null;
    });
    return {
      editor
    };
  }
};
</script>
<style scoped>
.rich-editor{
  position: relative;
  z-index: 1;
}
</style>
