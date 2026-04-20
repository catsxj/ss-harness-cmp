<template>
  <div id="mountNode" style="height: 100%; width: 100%"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import G6 from '@antv/g6'
import registerDefault from './registerDefault'

interface TopologyData {
  nodes?: unknown[]
  edges?: unknown[]
  [key: string]: unknown
}

const props = defineProps({
  defaultEdgeType: {
    type: String,
  },
  defaultNodeType: {
    type: String,
    default: 'circle',
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  data: {
    type: Object as () => TopologyData,
    default: () => ({}),
  },
  layout: {
    type: Object,
  },
})

const emit = defineEmits<{
  (e: 'nodeClick', params: Record<string, unknown>): void
  (e: 'edgeClick', params: Record<string, unknown>): void
  (e: 'canvasClick'): void
}>()

const graph = ref<InstanceType<typeof G6.Graph> | null>(null)

registerDefault(G6, props.defaultNodeType, props.defaultEdgeType)

function initGraph() {
  const target = document.getElementById('mountNode')
  if (!target) return
  const options = {
    modes: {
      default: [
        'drag-canvas',
        'zoom-canvas',
        'drag-node',
        'drag-combo',
      ],
    },
    container: 'mountNode',
    width: target.offsetWidth,
    height: target.offsetHeight,
    defaultNode: {
      type: 'image',
      size: [60],
      color: '#ffffff',
      style: {
        fill: '#9EC9FF',
        lineWidth: 1,
      },
      labelCfg: {
        style: {
          fill: '#ffffff',
          fontSize: 12,
        },
        position: 'bottom',
      },
    },
    defaultEdge: {
      type: 'circle-running',
      style: {
        stroke: '#7ECEF4',
        lineWidth: 2,
      },
    },
    groupByTypes: false,
    defaultCombo: {
      type: 'rect',
      padding: [40, 40, 40, 40],
      style: {
        fill: '#112A51',
        stroke: '#112A51',
        radius: 4,
      },
      labelCfg: {
        refY: 20,
        refX: 20,
        position: 'top',
        style: {
          fill: '#ffffff',
          fontSize: 15,
        },
      },
    },
    layout: props.layout,
  }
  graph.value = new G6.Graph(options)
  graph.value.read(props.data)
  bindEvent()
}

function save() {
  return graph.value?.save()
}

function itemClick(evt: Record<string, unknown>, type: 'nodeClick' | 'edgeClick') {
  const { clientX, clientY, item } = evt
  const params = {
    x: clientX,
    y: clientY,
    item: (item as Record<string, unknown> & { getModel: () => unknown })?.getModel(),
  }
  emit(type, params)
}

function bindEvent() {
  if (!graph.value) return
  graph.value.on('node:click', (evt: Record<string, unknown>) => {
    itemClick(evt, 'nodeClick')
  })
  graph.value.on('edge:click', (evt: Record<string, unknown>) => {
    itemClick(evt, 'edgeClick')
  })
  graph.value.on('canvas:click', () => {
    emit('canvasClick')
  })
}

function changeSize() {
  setTimeout(() => {
    const target = document.getElementById('mountNode')
    if (!target || !graph.value) return
    const width = target.offsetWidth
    const height = target.offsetHeight
    graph.value.changeSize(width, height)
  }, 1000)
}

watch(
  () => props.data,
  () => {
    if (graph.value) {
      graph.value.changeData(props.data)
    }
  }
)

onMounted(() => {
  initGraph()
  window.addEventListener('resize', changeSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', changeSize)
})

defineExpose({ save })
</script>
<style lang="scss">
</style>
