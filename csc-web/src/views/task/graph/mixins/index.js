export default {
  computed: {
    graph() {
      return this.$store.state.graph.editor.graph
    }
  },
  methods: {
    getPostData() {
      let data = false
      this.$refs.form.validate(valid => {
        if (valid) {
          data = this.itemData
        }
      })
      return data
    },
    getPreNodeData(nodeId, preCode) {
      if (!nodeId) return {} // 节点模板处理
      const node = this.graph.getCellById(nodeId)
      const edges = this.graph.getIncomingEdges(node)
      let data = {}
      if (edges) {
        for (const cell of edges) {
          const cellModel = cell.getSourceNode().getData()
          if (cellModel.code === preCode) {
            if (cellModel.input) data = cellModel.input.fronts
            break
          }
        }
      }
      return data
    }
  }
}
