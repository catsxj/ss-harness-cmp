<template>
  <FlowEditor ref="editorRef" :options="resultOptions" :flowNodeOption="flowNodeOption" v-bind="$attrs" v-on="$listeners">
    <template #header>
      <Toolbar></Toolbar>
    </template>
    <template #itempanel>
      <ItemPanel :data="nodePool"></ItemPanel>
    </template>
    <template #contextmenu>
      <ContextMenu v-on="$listeners"></ContextMenu>
    </template>
  </FlowEditor>
</template>
<script lang="ts">
import { FlowEditor, ItemPanel, Toolbar, useFlowInstance, ContextMenu } from 'cmp-graph-editor'
import 'cmp-graph-editor/lib/cmp-graph-editor.css'
import { defineComponent, onMounted, ref } from '@vue/composition-api'
import { getTreeNodes } from 'services/task/node'
import { flowNodeOption } from './filters'
export default defineComponent({
  components: {
    FlowEditor,
    ItemPanel,
    Toolbar,
    ContextMenu
  },
  props: {
    options: {
      type: Object
    },
    configs: {
      type: Object
    }
  },
  setup(props) {
    const resultOptions = {
      ...props.options,
      validateContextMenu: (cell: any) => {
        // 群组内节点
        const parent = cell.getParent()
        if (parent) {
          return {
            delete: true,
            copy: true
          }
        }
        // 群组
        if (cell.shape === 'groupNode') {
          return {
            edit: true,
            copy: true
          }
        }
        // 判断节点
        if (cell.shape === 'circle') {
          return {
            edit: true
          }
        }
        return {}
      }
    }
    const ins = useFlowInstance()
    onMounted(() => {
      bindEvent()
    })
    // 判断节点连线同步新增数据
    function linkJudgeToAddData(source: any, target: any) {
      const targetData = target.getData()
      const relation = {
        id: source.id,
        name: source.getData().label,
        source: 'result',
        link: 'AND',
        relation: '==',
        key: 'success',
        value: true
      }
      if (!targetData.input) {
        targetData.input = {
          fronts: {
            conditions: [relation]
          }
        }
      } else {
        targetData.input.fronts.conditions.push(relation)
      }
      target.updateData(targetData)
    }
    // 删除判断节点的连线同步删除数据
    function delJudgeEdgeToRmData(node: any) {
      const model = node.getData()
      const conditions = model.input.fronts.conditions
      const ids = conditions.map((item: any) => {
        return item.id
      })
      conditions.splice(ids.indexOf(node.id), 1)
      node.updateData(model)
    }
    // 判断节点新增输出
    function addJudgeNodeEdge(node: any, edge: any) {
      const graph = ins.graph.value
      const outEdges = graph.getOutgoingEdges(node)
      let label = '成功'
      let dicision = true
      if (outEdges.length > 1 && outEdges[0].getData().dicision) {
        label = '失败'
        dicision = false
      }
      edge.setLabels(label)
      edge.updateData({
        dicision
      })
    }
    function bindEvent() {
      const graph = ins.graph.value
      graph.on('edge:connected', ({ edge }: { edge: any }) => {
        const target = edge.getTargetNode()
        const source = edge.getSourceNode()
        if (target!.data.code === 'ctrl.judge') linkJudgeToAddData(source, target)
        if (source!.data.code === 'ctrl.judge') addJudgeNodeEdge(source, edge)
      })
      graph.on('edge:removed', ({ edge }: { edge: any }) => {
        const target = graph.getCellById(edge.getTargetCellId())
        // 判断节点逻辑
        if (target?.getData()?.code === 'ctrl.judge') {
          delJudgeEdgeToRmData(target!)
        }
      })
    }
    // 获取节点数据
    const nodePool = ref([])
    ;(async function () {
      const res = await getTreeNodes({
        code: 'multiful'
      })
      nodePool.value = res.data.map((item: any) => {
        const { modules, ...others } = item
        return {
          ...others,
          children: modules.map((cell: any) => {
            const { props, ...others } = cell
            return {
              ...others,
              configs: JSON.parse(props) || {}
            }
          })
        }
      })
    })()
    return {
      nodePool,
      resultOptions,
      flowNodeOption,
      ...ins
    }
  }
})
</script>
