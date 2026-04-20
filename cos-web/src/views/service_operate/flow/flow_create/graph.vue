<template>
  <PageLayout title-name="流程编排" @goBack="goBack">
    <span slot="operate" class="pull-right">
      <el-button type="primary" @click="save" :loading="loading" icon="el-icon-check"> 保存 </el-button>
    </span>
    <CardLayout title="基本信息">
      <basic-form ref="addForm" :model="addData" class="task-form">
        <el-row :gutter="10">
          <el-col :span="8">
            <basic-form-item label="流程名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <basic-form-item label="申请类型：">
              <el-select v-model="addData.type" :disabled="!!addData.id" clearable @change="selectType">
                <el-option v-for="item in applyTypeList" :key="item.value" :value="item.value" :label="item.name"></el-option>
              </el-select>
            </basic-form-item>
          </el-col> -->
          <el-col :span="8">
            <basic-form-item label="描述：">
              <el-input v-model="addData.remark"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="8">
            <el-alert show-icon title="审核节点默认连出的第一条线为审核通过" type="info" :closable="false"></el-alert>
          </el-col>
        </el-row>
      </basic-form>
    </CardLayout>
    <editor @nodeClick="nodeClick" ref="editor" :height="editHeight"></editor>
    <attribute-item @save="updateNode" :dialog="attributeDialog" :apply-type="addData.type" :current-node="currentNode" v-if="attributeDialog.visible"></attribute-item>
  </PageLayout>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import Editor from './flowEdit/create.vue'
import AttributeItem from './attributeItem.vue'
import constraintsData from './constraints'
import { handleReadData } from './util'
import { getFlowDetail, modifyFlow, createFlow } from 'services/services/flow'
import { getDictChildren } from 'services/system/dictionary'

export default {
  components: {
    Editor,
    AttributeItem
  },
  data() {
    return {
      loading: false,
      addData: {},
      attributeDialog: {
        visible: false
      },
      // applyTypeList: [],
      editHeight: 0,
      currentNode: {}
    }
  },
  computed: {
    editor() {
      return this.$refs.editor
    }
  },
  created() {
    this.initData()
    this.editHeight = window.innerHeight - 400
    // this.getApplyType()
  },
  mounted() {
    this.graphEveSet()
  },
  methods: {
    // async getApplyType() {
    //   const res = await getDictChildren({ value: 'FLOW_TYPE' })
    //   if (res.success) {
    //     this.applyTypeList = res.data
    //   }
    // },
    selectType() {
      this.editor.graph.clear()
      this.addStartEndNode()
    },
    goBack() {
      this.$router.go(-1)
    },
    addStartEndNode() {
      this.editor.graph.add('node', {
        x: 100,
        y: 180,
        label: '开始节点',
        shape: 'flow-circle',
        size: '60*60',
        code: 'start',
        color: '#FA8C16'
      })
      this.editor.graph.add('node', {
        x: 800,
        y: 180,
        label: '结束节点',
        shape: 'flow-circle',
        size: '60*60',
        code: 'end',
        color: '#722ED1'
      })
    },
    initData() {
      if (this.$route.name === 'CreateFlow') {
        setTimeout(() => {
          this.addStartEndNode()
        })
      } else {
        this.getDetail(this.$route.params.id)
      }
    },
    getDetail(id) {
      getFlowDetail(id).then((data) => {
        if (data.success) {
          this.addData = data.data
          this.editor.flow.read(handleReadData(JSON.parse(this.addData.graph)))
        }
      })
    },
    nodeClick(item) {
      this.currentNode = cloneDeep(item.getModel())
      const blackCode = ['start', 'end']
      if (blackCode.includes(this.currentNode.code)) {
        this.$message.info('当前节点不支持编辑')
        return
      }
      this.attributeDialog.visible = true
    },
    updateNode(node) {
      this.editor.update(node.id, {
        ...node,
        statusIcon: ''
      })
    },
    // 判断节点是否可以删除
    judgeDelete(command) {
      const nodes = command.getDeleteItems(this.editor.editor)
      const itemIds = []
      const blackCode = ['start', 'end']
      nodes.forEach((item) => {
        const model = item.getModel()
        if (blackCode.includes(model.code)) return this.$message.error('该节点不支持删除')
        itemIds.push(model.id)
      })
      command.itemIds = itemIds
    },
    // 节点添加逻辑处理
    handleAddAfter(command) {
      if (command.type === 'edge') {
        const sourceModel = this.editor.graph.find(command.addModel.source).getModel()
        if (sourceModel.code === 'auditTask') this.addAuditNodeEdge(command.addModel)
      }
    },
    // 审批节点添加输出
    addAuditNodeEdge(model) {
      const outEdges = this.editor.graph.find(model.source).getOutEdges()
      let label = '审批通过'
      let auditFlag = 'pass'
      if (outEdges.length && outEdges[0].getModel().auditFlag === 'pass') {
        label = '审批拒绝'
        auditFlag = 'nopass'
      }
      model.label = label
      model.auditFlag = auditFlag
      this.updateNode(model)
    },
    judgeNodeLink(ev) {
      const source = ev.source.getModel()
      const target = ev.target.getModel()
      // 不可连接自身 && 节点不能连接两条线或者环路
      if (source.id === target.id || this.editor.nodeHasBeenLinked(ev.source, ev.target)) {
        ev.cancel = true
        return
      }
      const { post, postLimit } = constraintsData[source.code]
      const { pre, preLimit } = constraintsData[target.code]
      if (!post.includes(target.code) || (postLimit && ev.source.getOutEdges().length >= postLimit)) {
        ev.cancel = true
        return
      }
      if (!pre.includes(source.code) || (preLimit && ev.target.getInEdges().length >= preLimit)) {
        ev.cancel = true
      }
    },
    graphEveSet() {
      // 节点连线控制
      this.editor.flow.on('dragedge:beforeshowanchor', (ev) => {
        this.judgeNodeLink(ev)
      })
      // commond控制
      this.editor.editor.on('beforecommandexecute', (ev) => {
        const command = ev.command
        switch (command.name) {
          case 'delete':
            this.judgeDelete(command)
            break
          case 'add':
            this.handleAddAfter(command)
            break
        }
      })
    },
    // 判断节点数据准确性
    judgeNode(node) {
      if (node.code === 'auditTask' && !node.assignee) {
        this.$message.error('部分节点参数未设置')
        return false
      }
      // 游离节点判断
      return this.judgeSingleNode(node)
    },
    judgeSingleNode(node) {
      const item = this.editor.graph.find(node.id)
      if (!item.getEdges().length) {
        this.$message.error(`节点【${node.label}】为游离节点，请处理`)
        return false
      }
      const blackType = ['start', 'end']
      if (blackType.includes(node.code)) return true
      if (!item.getInEdges().length || !item.getOutEdges().length) {
        this.$message.error(`节点【${node.label}】必须存在上下游节点`)
        return false
      }
      return true
    },
    getOutEdges(id) {
      const arr = []
      this.editor.graph
        .find(id)
        .getOutEdges()
        .forEach((item) => {
          const model = item.getModel()
          const { id, label: name, auditFlag, shape, target: to, targetAnchor, sourceAnchor } = model
          arr.push({ id, name, auditFlag, shape, to, targetAnchor, sourceAnchor })
        })
      return arr
    },
    handlePostData() {
      const data = this.editor.save()
      if (data.nodes.length === 2) {
        this.$message.error('请添加节点')
        return false
      }
      const graph = []
      let flag = false
      let auditNodeCount = 0
      for (const node of data.nodes) {
        const { label: name, code: type, x, y, shape, color, size, index, id, ...others } = node
        if (type === 'auditTask') auditNodeCount++
        if (this.judgeNode(node)) {
          const obj = {
            ...others,
            id,
            name,
            type,
            config: {
              x,
              y,
              shape,
              color,
              size,
              index
            }
          }
          obj.transitions = this.getOutEdges(node.id)
          this.editor.update(node.id, {
            statusIcon: 'success.png'
          })
          graph.push(obj)
        } else {
          this.editor.update(node.id, {
            statusIcon: 'error.png'
          })
          flag = true
          break
        }
      }
      if (auditNodeCount === 0) {
        this.$message.error('请保证至少存在一个审批节点')
        flag = true
      }
      return flag ? false : graph
    },
    // 保存任务
    save() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          const graph = this.handlePostData()
          if (!graph) return
          // this.loading = true
          const params = {
            ...this.addData,
            graph
          }
          const http = this.$route.params.id ? modifyFlow : createFlow
          http(params).then((data) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              this.goBack()
            }
            this.loading = false
          })
        }
      })
    }
  }
}
</script>
