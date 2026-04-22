<template>
  <FlowEditor ref="editorRef" :options="options" :flowNodeOption="flowNodeOption" v-bind="$attrs" v-on="$listeners">
    <template #header>
      <div class="graph-header">拓扑展示</div>
    </template>
    <template #toolbar>
      <ToolbarSimple></ToolbarSimple>
    </template>
  </FlowEditor>
</template>
<script lang="ts">
import { FlowEditor, ItemPanel, ToolbarSimple, useFlowInstance } from 'cmp-graph-editor'
import 'cmp-graph-editor/lib/cmp-graph-editor.css'
import { defineComponent } from '@vue/composition-api'
import { flowNodeOption } from './filters'
export default defineComponent({
  components: {
    FlowEditor,
    ItemPanel,
    ToolbarSimple
  },
  setup() {
    const ins = useFlowInstance();
    const options = {
      readOnly: true
    }
    return {
      options,
      flowNodeOption,
      ...ins
    }
  }
})
</script>
<style lang="scss" scoped>
.graph-header {
  background: #fff;
  padding: 10px;
  width: 100%;
  border: 1px solid #e9e9e9;
}
</style>
