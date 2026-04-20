<template>
  <el-dialog title="节点属性" :close-on-click-modal="false" :visible.sync="dialog.visible" width="1000px" append-to-body="">
    <basic-form ref="taskForm" :model="currentNode">
      <NodeCommon ref="common" :item-data="currentNode.control" :current-node="currentNode" v-if="isShowControl"> </NodeCommon>
      <Component ref="node" :is="component" :current-node="currentNode"></Component>
    </basic-form>
    <div slot="footer" class="dialog-footer" v-if="!isPreview">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="saveNode">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import NodeCommon from './NodeCommon.vue'
import JudgeNode from './control/judgeNode.vue'
import show from './mixins/show'

export default {
  mixins: [show],
  components: {
    NodeCommon,
    MaintainNode: () => import('./maintain/index.vue'),
    ResourceNode: () => import('./resource/index.vue'),
    SoftwareNode: () => import('./software/index.vue'),
    JudgeNode
  },
  props: {
    dialog: {
      type: Object
    },
    currentNode: {
      type: Object
    }
  },
  data() {
    return {
      component: ''
    }
  },
  computed: {
    isShowControl() {
      const arr = ['JudgeNode']
      return !arr.includes(this.component) && !this.currentNode.ignore
    }
  },
  created() {
    if (!this.currentNode.input) {
      this.$set(this.currentNode, 'input', {})
    }
    this.init()
  },
  methods: {
    init() {
      if (this.currentNode.code.indexOf('task.maintain') > -1) {
        this.component = 'MaintainNode'
      } else if (this.currentNode.code.indexOf('task.resource') > -1) {
        this.component = 'ResourceNode'
      } else if (this.currentNode.code.indexOf('task.software') > -1) {
        this.component = 'SoftwareNode'
      } else {
        this.component = 'JudgeNode'
      }
    },
    saveNode() {
      this.$refs.taskForm.validate(valid => {
        if (valid) {
          const input = this.$refs.node.getPostData() // 获取input信息
          console.log(input)
          const common = this.$refs.common
          const basicInfo = common && this.$refs.common.getPostData() // 获取公共信息;
          // 节点输出、目标机器以及控制信息校验
          if (input.fronts === false || input.target === false || basicInfo === false) return
          // 目标机器不存在或者目标机器存在并且校验其节点数量
          if (!input.target || (input.target && this.judgeTargetHost({ ...this.currentNode, input }))) {
            this.currentNode.input = input
            // 角色节点不存在基础信息
            if (basicInfo) {
              const { label, ...contorl } = basicInfo
              this.currentNode.label = label
              this.currentNode.control = contorl
            }
            this.dialog.visible = false
            this.$emit('save', this.currentNode)
          }
        }
      })
    }
  }
}
</script>
