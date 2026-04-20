/**
 * Created by HaijunZhang on 2019/2/20.
 */
export function handleReadData(data) {
  const graph = {
    nodes: [],
    edges: []
  }
  for (const node of data) {
    const { name: label, type: code, transitions, config, id, assignee, assigneeRole, assigneeTenantAdmin, assigneeProjectManager, autoExecute } = node
    const obj = {
      label,
      id,
      code,
      assignee,
      assigneeRole,
      assigneeTenantAdmin,
      assigneeProjectManager,
      ...config,
      autoExecute
    }
    transitions.forEach(item => {
      const { id, shape, sourceAnchor, targetAnchor, to: target, auditFlag, name: label } = item
      graph.edges.push({ id, shape, sourceAnchor, targetAnchor, target, auditFlag, label, source: node.id })
    })
    graph.nodes.push(obj)
  }
  return graph
}
