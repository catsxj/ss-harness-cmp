import { computed, ref } from '@vue/composition-api'
export default function (store: any) {
  const graph = computed(() => store.state.graph.graph)
  function getPreNodeData (nodeId: string, preCode: string) {
    if (!nodeId) return {}; // 节点模板处理
    const edges = graph.value.find(nodeId).getInEdges();
    let data = {};
    for (const cell of edges) {
      const cellModel = cell.source.getModel()
      if (cellModel.code === preCode) {
        if (cellModel.input) data = cellModel.input.fronts;
        break;
      }
    };
    return data;
  }
  return {
    graph,
    getPreNodeData
  }
}
