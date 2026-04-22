/**
 * Created by Zhang Haijun on 2017/11/21.
 */
export default {
  methods: {
    // 递归获取对象的属性
    returnObjValue(obj, attr) {
      // 容错处理 obj不存在
      if (!obj) return false;
      const length = attr.length
      // 大于1时递归取值
      if (length > 1) {
        const head = attr.shift()
        return this.returnObjValue(obj[head], attr)
      }
      return obj[attr[0]]
    },
    getOutEdgesCode(item) {
      const edges = this.editor.graph.getOutgoingEdges(item)
      const outCodes = []
      edges && edges.forEach(cell => {
        const cellModel = cell.getTargetNode()
        cellModel && outCodes.push(cellModel.data.code)
      })
      return outCodes
    },
    getInEdgesCode(item) {
      const edges = this.editor.graph.getIncomingEdges(item)
      const inCodes = []
      edges && edges.forEach(cell => {
        const cellModel = cell.getSourceNode()
        inCodes.push(cellModel.data.code)
      })
      return inCodes
    },
    // 判断强依赖节点是否有连线
    judgeRequiredNodeIsLink(node) {
      if (node.input?.fronts.origin === 'reuse') return true // 资源节点已有不做强依赖限制
      const postConstraints = JSON.parse(this.moduleMap[node.code].postConstraints)
      const preConstraints = JSON.parse(this.moduleMap[node.code].preConstraints)
      const itemNode = this.editor.graph.getCellById(node.id)
      let postFlag = true
      let preFlag = true
      if (postConstraints.rule === 'white') {
        postFlag = postConstraints.data.every(item => {
          let reuqiredFlag = true
          if (item.required) {
            reuqiredFlag = this.getOutEdgesCode(itemNode).some(cell => {
              return this.generateReg(item.code).test(cell)
            })
          }
          if (!reuqiredFlag) this.$message.error(`该节点【${node.label}】强依赖于后置模型【${this.moduleMap[item.code].name}】，要求必须连接`)
          return reuqiredFlag
        })
      }
      if (preConstraints.rule === 'white') {
        preFlag = preConstraints.data.every(item => {
          let reuqiredFlag = true
          if (item.required) {
            reuqiredFlag = this.getInEdgesCode(itemNode).some(cell => {
              return this.generateReg(item.code).test(cell)
            })
          }
          if (!reuqiredFlag) this.$message.error(`该节点【${node.label}】强依赖于前置模型【${this.moduleMap[item.code].name}】，要求必须连接`)
          return reuqiredFlag
        })
      }
      return postFlag && preFlag
    },
    // 判断节点加入order
    handleJudgeOrder(data) {
      data.forEach((item, index) => {
        item.order = index
      })
    },
    // 生成正则表达式
    generateReg(value) {
      return new RegExp(value, 'g')
    },
    // 判断是否为虚拟机节点
    judgeIsVm(code) {
      return /^task[.]resource[.]cvm[.][a-z]{1,20}$/.test(code)
    },
    judgeContextMenu(cell) {

    },
    // 节点连线：判断节点之前是否可以连线
    judgeNodeLink(sourceNode, targetNode) {
      const source = sourceNode.getData()
      const target = targetNode.getData()
      // 前置依赖后置依赖处理
      const postConstraints = JSON.parse(this.moduleMap[source.code].postConstraints)
      const preConstraints = JSON.parse(this.moduleMap[target.code].preConstraints)
      // 后置依赖处理
      if (postConstraints.rule === 'black') {
        const flag = postConstraints.data.some(item => {
          return this.generateReg(item.code).test(target.code)
        })
        if (flag) {
          return false
        }
      }
      if (postConstraints.rule === 'white') {
        const flag = postConstraints.data.some(item => {
          let unigueFlag = false
          if (item.unique) {
            unigueFlag = this.getOutEdgesCode(sourceNode).includes(target.code)
          }
          return this.generateReg(item.code).test(target.code) && !unigueFlag
        })
        if (!flag) {
          return false;
        }
      }
      // 前置依赖
      if (preConstraints.rule === 'black') {
        const flag = preConstraints.data.some(item => {
          return this.generateReg(item.code).test(source.code)
        })
        if (flag) {
          return false
        }
      }
      if (preConstraints.rule === 'white') {
        const flag = preConstraints.data.some(item => {
          let unigueFlag = false
          if (item.unique) {
            unigueFlag = this.getInEdgesCode(targetNode).includes(source.code)
          }
          return this.generateReg(item.code).test(source.code) && !unigueFlag
        })
        if (!flag) {
          return false
        }
      }
      if (postConstraints.limit && this.getOutEdgesCode(sourceNode).length === postConstraints.limit) {
        return false
      }
      return true;
    },
    // 判断节点是否可以解组
    judgeUnGroup(command) {
      setTimeout(() => {
        command.snapShot.groups.forEach(item => {
          if (item.internal && command.selectedItems.includes(item.id)) {
            this.$message.error('内置分组不能进行解组')
            command.back(this.editor.editor)
          }
        })
      })
    },
    // 判断节点是否可以删除
    judgeDelete(command) {
      const nodes = command.getDeleteItems(this.editor.editor)
      const itemIds = []
      nodes.forEach(item => {
        const model = item.getModel()
        if (model.ignore || model.mainNode) return this.$message.error('该节点不支持删除')
        itemIds.push(model.id)
        this.handleDelAfter(item)
      })
      command.itemIds = itemIds
      setTimeout(() => {
        this.handleDependData() // 保证关联主机数据准确性
      })
    },
    // 节点删除逻辑处理
    handleDelAfter(item) {
      if (item.type === 'edge') {
        if (item.target.model.code === 'ctrl.judge') this.delJudgeEdgeToRmData(item.source, item.target)
      }
      if (item.type === 'node') {
        const edges = item.getOutEdges()
        edges.forEach(cell => {
          if (cell.target.model.code === 'ctrl.judge') this.delJudgeEdgeToRmData(cell.source, cell.target)
        })
      }
    },
    // 节点新增逻辑处理
    handleAddAfter(command) {
      if (command.type === 'edge') {
        const targetModel = this.editor.graph.find(command.addModel.target).getModel()
        const sourceModel = this.editor.graph.find(command.addModel.source).getModel()
        if (targetModel.code === 'ctrl.judge') this.linkJudgeToAddData(sourceModel, targetModel)
        if (sourceModel.code === 'ctrl.judge') this.addJudgeNodeEdge(command.addModel)
      }
    },
    // 判断节点新增输出
    addJudgeNodeEdge(model) {
      const outEdges = this.editor.graph.find(model.source).getOutEdges()
      let label = '成功'
      let dicision = true
      if (outEdges.length && outEdges[0].getModel().dicision) {
        label = '失败'
        dicision = false
      }
      model.label = label
      model.dicision = dicision
      this.updateNode(model)
    },
    getRelationIds(id, visitedIds = []) {
      this.editor.graph
        .find(id)
        .getInEdges()
        .forEach(item => {
          const model = item.source.getModel()
          if (visitedIds.includes(model.id)) return
          visitedIds.push(model.id)
          this.getRelationIds(model.id, visitedIds)
        })
      return visitedIds
    },
    // 保证depend数据准确性
    handleDependData() {
      this.editor.save().nodes.forEach(item => {
        if (!(item.input && item.input.depend)) return
        const depend = item.input.depend.data
        if (!depend.length) return
        const ids = this.getRelationIds(item.id)
        const host = []
        depend.forEach(id => {
          if (ids.includes(id)) host.push(id)
        })
        item.input.depend.data = host
        this.updateNode(item)
      })
    },
    // 删除判断节点的连线同步删除数据
    delJudgeEdgeToRmData(source, target) {
      const model = target.getModel()
      const conditions = model.input.fronts.conditions
      const ids = conditions.map(item => {
        return item.id
      })
      conditions.splice(ids.indexOf(source.id), 1)
      this.updateNode(model)
    }
  }
}
