<template>
  <component :is="'PageLayout'" title-name="作业编排" @goBack="goBack">
    <span slot="operate" class="pull-right" v-if="!isPreview">
      <el-button type="primary" @click="save" icon="el-icon-check"> 保存 </el-button>
    </span>
    <CardLayout title="基本信息">
      <basic-form ref="addForm" :model="graphDialog.task" class="task-form" :disabled="isPreview">
        <el-row :gutter="10">
          <el-col :span="8" v-if="!hideScene">
            <basic-form-item label="作业场景：" prop="sceneId" validate="required">
              <SceneSelect v-model="graphDialog.task.sceneId" @change="getTplList"></SceneSelect>
            </basic-form-item>
          </el-col>
          <el-col :span="8" v-if="showTpl">
            <basic-form-item label="选择模板：" prop="templateId" validate="required">
              <el-select filterable placeholder="请选择模板" v-model="graphDialog.task.templateId" @change="getEditData(graphDialog.task.templateId, 'NotConfig')">
                <el-option v-for="item in tplListData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
    </CardLayout>
    <component class="flow-editor" ref="editor" :is="editorComponent" :options="{ validateConnection: judgeNodeLink, validateContextMenu: judgeContextMenu }" @nodeClick="nodeClick"></component>
    <attribute-item @save="updateNode" :dialog="attributeDialog" :current-node="currentNode" v-if="attributeDialog.visible"></attribute-item>
  </component>
</template>
<script>
import { makeTimeStamp } from 'utils'
import { cloneDeep, isObject } from 'lodash-es'
import AttributeItem from './attributeItem.vue'
import Editor from './flow-editor/index.vue'
import DetailEditor from './flow-editor/detail.vue'
import SceneSelect from './sceneSelect.vue'
import show from './mixins/show'
import graphTools from './mixins/graphTools'
import { handleReadData } from './tools'
import { handleGroupData, handleOracleData, handleSingleGroups } from './software/tools'
import { getTaskDetail, createTask, modifyTask, getTemplate, getTemplateBySimple, getTemplateDetail, createTemplate, modifyTemplate, getInstanceDetail } from 'services/task/task'

export default {
  mixins: [show, graphTools],
  components: {
    AttributeItem,
    Editor,
    DetailEditor,
    SceneSelect
  },
  props: {
    graphDialog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectNodeModel: {},
      editorComponent: '',
      showTpl: true, // 是否可以选择模板,
      hideScene: false, // 是否隐藏场景选择
      saveService: '', // 保存service
      getDataService: '', // 获取数据service
      tplListData: [], // 模板列表
      attributeDialog: {
        visible: false
      },
      currentNode: {},
      task: {}
    }
  },
  computed: {
    moduleMap() {
      return this.$store.state.graph.moduleMap
    },
    editor() {
      return this.$refs.editor
    }
  },
  created() {
    this.initData()
    this.editorComponent = this.isPreview || this.isTaskInstance ? 'DetailEditor' : 'Editor'
    this.$store.dispatch('GetModuleMap', this)
  },
  mounted() {
    this.$store.commit('SET_EDITOR', this.editor)
    this.graphEveSet()
  },
  methods: {
    goBack() {
      this.$emit('back')
    },
    initData() {
      this.saveService = createTask
      this.getDataService = getTemplateDetail
      if (!this.graphDialog.task.templateId) return
      // 配置状态
      this.getEditData(this.graphDialog.task.templateId, this.graphDialog.task.configStatus || '')
      this.getTplList(this.graphDialog.task.sceneId)
      // 不根据路由来判断
      // ..
    },
    // 获取模板列表
    getTplList(id) {
      if (!this.isTaskInstance) return
      getTemplateBySimple({
        params: JSON.stringify([{ param: { sceneId: id, status: 'APPROVED' }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.tplListData = data.data.rows
        }
      })
    },
    getEditData(id, type) {
      // type 当前拓扑所属状态，值为clone时为克隆
      this.getDataService(id).then(data => {
        if (data.success) {
          let graph = data.data.graph
          if (type === 'NotConfig') {
            // 未配置状态
            graph = data.data.graph
          } else {
            // 已经配置过
            graph = this.graphDialog.task.taskGraph
          }
          this.$set(this.graphDialog, 'task', Object.assign(this.graphDialog.task, { ...data.data, graph }))
          if (type === 'clone') {
            this.graphDialog.task.name = `${this.graphDialog.task.name} - ${makeTimeStamp()}`
            delete this.graphDialog.task.id
          }
          this.editor.read(handleReadData(isObject(this.graphDialog.task.graph) ? this.graphDialog.task.graph : JSON.parse(this.graphDialog.task.graph), type === 'clone' ? 'Complete' : type))
          // 解决分组节点内的连线获取数据展示异常bug
          setTimeout(() => {
            const edges = this.editor.graph.getEdges().filter(item => item.parent)
            edges.forEach(edge => {
              edge.attr('line/strokeDasharray', '')
            })
          })
        }
      })
    },
    nodeClick(item) {
      this.selectNodeModel = item
      const nodeData = cloneDeep(item.getData())
      this.currentNode = {
        id: item.id,
        ...nodeData
      }
      this.attributeDialog.visible = true
    },
    updateNode(node) {
      this.selectNodeModel.updateData({
        ...node,
        status: 'Complete'
      })
    },
    graphEveSet() {
      // // 节点连线控制
      // let sourceNode = {}
      // this.editor.flow.on('dragedge:beforeshowanchor', ev => {
      //   sourceNode = ev.source
      //   this.judgeNodeLink(ev)
      // })
      // // commond控制
      // this.editor.editor.on('beforecommandexecute', ev => {
      //   const command = ev.command
      //   switch (command.name) {
      //     case 'delete':
      //       this.judgeDelete(command)
      //       break
      //     case 'add':
      //       this.handleAddAfter(command)
      //       break
      //     case 'unGroup':
      //       this.judgeUnGroup(command)
      //       break
      //   }
      // })
    },
    // 判断节点参数
    judgeNodeParams(node) {
      const { input, code, label } = node
      const requires = this.moduleMap[code].requires
      if (!requires) return true
      const requiredParams = JSON.parse(requires)
      let flag = true
      for (const item of requiredParams) {
        const { name, value, orValue } = item
        if (!this.returnObjValue(input?.fronts, value.split('.')) && !input?.fronts[orValue]) {
          flag = false
          this.$message.error(`节点【${label}】缺少必填参数 ${name}`)
          break
        }
      }
      return flag
    },
    // 判断节点数据准确性
    judgeNode(node) {
      const whiteCode = ['ctrl.start', 'ctrl.stop']
      if (this.isTemplate && node.code === 'task.software.role') whiteCode.push('task.software.role') // 模板时不对role节点做校验
      if (whiteCode.includes(node.code)) return true
      if (this.isTaskInstance && node.role === 'redis_sentinel') node.input = node.input || { fronts: {} }
      if (node.status === 'NotConfig' && !node.input) {
        this.$message.error('节点参数未设置')
        return false
      }
      if (!this.isTemplate && !this.judgeNodeParams(node)) return false // 节点参数判断
      // 目标机器判断
      if (!this.isTemplate && !this.judgeTargetHost(node)) return false
      // 节点必连判断
      return this.judgeRequiredNodeIsLink(node)
    },
    handlePostData() {
      const data = this.editor.save()
      if (!data.nodes) {
        this.$message.error('请新增节点')
        return false
      }
      const graph = {
        nodes: [],
        groups: [],
        edges: data.edges.map(item => {
          const { data: config, ...others } = item
          return {
            ...config,
            ...others
          }
        })
      }
      let flag = false
      for (const nodeView of data.nodes) {
        const { component, id, position, shape, parent, children, attrs, size, zIndex } = nodeView
        if (shape === 'groupNode') {
          const {
            attrs: {
              label: { text: label }
            }
          } = nodeView
          graph.groups.push({
            label,
            children,
            id,
            position,
            shape,
            size: nodeView.size,
            zIndex
          })
          continue
        }
        const node = nodeView.data
        // 代码容错处理 将节点id赋值到node
        node.id = id
        const { label: name, code, input = { fronts: {} }, control, icon, ignore, index, tplId, mainNode, role, nodeType, pid } = node
        if (this.judgeNode(node)) {
          const obj = {
            name,
            code,
            input,
            control,
            tplId,
            config: {
              component,
              zIndex,
              position,
              parent,
              attrs,
              icon,
              shape,
              nodeType,
              size,
              ignore,
              index,
              id,
              role,
              mainNode,
              pid
            }
          }
          this.editor.graph.getCellById(id).updateData({
            status: 'Complete'
          })
          if (mainNode) {
            // 内置分组处理
            handleGroupData(this.editor.graph, obj)
          } else {
            if (code === 'ctrl.judge') this.handleJudgeOrder(input.fronts.conditions)
            if (code === 'task.software.oracle') handleOracleData(obj)
            const groupsCode = ['task.software.kafka', 'task.software.nfs.server', 'task.software.nfs.client', 'task.software.postgresql', 'task.software.zookeeper', 'task.software.iscsi.server', 'task.software.iscsi.client']
            if (this.isTaskInstance && groupsCode.includes(code)) handleSingleGroups(obj)
            // mysql MGR多主特殊处理
            if (code === 'task.software.mysql' && input.fronts.cluster_type) handleSingleGroups(obj)
          }

          graph.nodes.push(obj)
        } else {
          this.editor.graph.getCellById(id).updateData({
            status: 'Error'
          })
          flag = true
          break
        }
      }
      return flag ? false : graph
    },
    // 保存任务
    save() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          const graph = this.handlePostData()
          if (!graph) return (this.graphDialog.task.configStatus = 'Error')
          this.graphDialog.task.taskGraph = graph
          // 配置状态
          this.graphDialog.task.configStatus = 'Complete'
          if (typeof this.graphDialog.cb === 'function') this.graphDialog.cb()
          this.$emit('back')
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.flow-editor {
  height: calc(100vh - 450px) !important;
}
::v-deep .template-header {
  .back {
    display: none;
  }
  .line {
    display: none !important;
  }
}
</style>
