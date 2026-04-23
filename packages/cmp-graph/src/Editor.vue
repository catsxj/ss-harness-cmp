<template>
  <div></div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
// @ts-expect-error - @antv/g6-editor 无 .d.ts（legacy 包，保持 v1.2.0 不升级）
import G6Editor from '@antv/g6-editor'

// Vue 3 port of original/cmp-graph/src/components/Editor.vue
// G6Editor.track(false) 关闭远程上报；行为保持与原版一致

G6Editor.track(false)

const props = withDefaults(
  defineProps<{
    height?: number
    mode?: string
  }>(),
  { height: 400, mode: 'default' }
)

const emit = defineEmits<{
  nodeClick: [item: unknown]
  edgeClick: [item: unknown]
}>()

let editor: any = null
let flow: any = null
const panelItems = ref<Array<{ type: string; config?: Record<string, unknown> }>>([])

const graph = computed(() => flow?.getGraph?.())

function init(): void {
  flow = new G6Editor.Flow({
    graph: {
      container: 'page',
      mode: props.mode,
      modes: {
        default: [
          'panBlank',
          'hoverGroupActived',
          'keydownCmdWheelZoom',
          'clickEdgeSelected',
          'clickNodeSelected',
          'clickCanvasSelected',
          'clickGroupSelected',
          'hoverNodeActived',
          'hoverEdgeActived',
          'hoverButton',
          'clickCollapsedButton',
          'clickExpandedButton',
          'keydownShiftMultiSelected',
          'dragNodeAddToGroup',
          'dragOutFromGroup',
          'panItem',
          'hoverEdgeControlPoint',
          'dragEdgeControlPoint',
          'hoverAnchorActived'
        ]
      },
      height: props.height > 400 ? props.height : 400
    },
    grid: {
      line: {}
    },
    noEndEdge: false
  })
  editor.add(flow)
  panelItems.value.forEach((item) => {
    addPanel(item.type, item.config)
  })
}

function addPanel(type: string, config: Record<string, unknown> = {}): any {
  const PanelCtor = (G6Editor as any)[type]
  const panel = new PanelCtor({
    container: type,
    ...config
  })
  editor.add(panel)
  return panel
}

function eveSet(): void {
  graph.value?.on('node:dblclick', (ev: any) => {
    emit('nodeClick', ev.item)
  })
  graph.value?.on('edge:click', (ev: any) => {
    if (ev.button === 0) emit('edgeClick', ev.item)
  })
}

function save(): unknown {
  return graph.value?.save()
}

function changeEdge(value: string): void {
  flow?.changeAddEdgeModel({ shape: value })
}

function changeZoom(zoom: number): void {
  flow?.zoom(zoom)
}

function nodeHasBeenLinked(source: any, target: any): boolean {
  const edges = target.getEdges()
  for (const a of edges) {
    if (a.source.id === source.id || a.target.id === source.id) {
      return true
    }
  }
  return false
}

function update(node: unknown, model: unknown): unknown {
  return graph.value?.update(node, model)
}

onMounted(() => {
  editor = new G6Editor()
  init()
  eveSet()
})

defineExpose({
  graph,
  flow: () => flow,
  editor: () => editor,
  addPanel,
  save,
  changeEdge,
  changeZoom,
  nodeHasBeenLinked,
  update
})
</script>

<style lang="scss" scoped>
@import './fonts/iconfont.css';

.edit-wrapper {
  position: relative;
  background: #fff;
  width: 100%;
  height: 100%;

  .edit-body {
    width: 100%;
    height: 100%;
    position: relative;
  }
}
</style>
