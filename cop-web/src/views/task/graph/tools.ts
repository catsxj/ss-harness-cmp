export function handleReadData(data: any, configStatus: string) {
  const { groups = [], edges = [] } = data;
  const graph: { nodes: any[], groups: any[], edges: any[] } = {
    nodes: [],
    groups: groups.map((item:any) => ({ shape: 'groupNode', ...item })),
    edges: edges.map((item:any) => {
      const { dicision, ignore, ...others } = item
      return {
        ...others,
        data: {
          dicision,
          ignore
        }
      }
    })
  }
  for (const node of data.nodes) {
    const { id: nodeId, name: label, code, input, control, status = configStatus, config: { id, icon, ignore, role, nodeType, mainNode, pid, ...other } } = node
    const obj = {
      size: {
        width: ignore ? 120 : 180,
        height: 40
      },
      ...other,
      id,
      data: {
        mainNode,
        control,
        status,
        label,
        nodeType,
        code,
        icon,
        ignore,
        role,
        pid,
        id,
        nodeId
      }
    }
    // fronts有值时进行赋值
    if (input && Object.keys(input?.fronts).length !== 0) {
      obj.data.input = input;
    }
    graph.nodes.push(obj)
  }
  console.log(graph)
  return graph
}
