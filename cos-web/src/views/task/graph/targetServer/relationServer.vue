/** * Created by Zhang Haijun on 2017/9/5. */
<template>
  <CardLayout title="关联主机">
    <basic-form :disabled="isPreview">
      <el-row :gutter="10">
        <el-col :span="24">
          <el-alert class="m-b-sm" type="warning" :closable="false" title="只有将主机关联到该节点上，主机才会作为该节点的前置依赖，在主机节点上进行脚本执行、软件安装等操作，否则只是单纯的编排"> </el-alert>
          <smart-table :data="nodeList" class="target-table">
            <el-table-column label="节点ID" prop="id" show-overflow-tooltip> </el-table-column>
            <el-table-column label="节点名称" prop="name" show-overflow-tooltip> </el-table-column>
            <el-table-column label="是否关联">
              <template slot-scope="scope">
                <el-switch @change="changeLink(scope.row)" :disabled="judgeDisLink(scope.row)" v-model="scope.row.isLink" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
              </template>
            </el-table-column>
          </smart-table>
        </el-col>
      </el-row>
    </basic-form>
  </CardLayout>
</template>

<script>
import node from '../mixins/index'
import show from '../mixins/show'
import { conditionVm } from 'services/platform'

export default {
  mixins: [node, show],
  props: {
    id: {
      type: String
    },
    itemData: {
      type: Object,
      default: function () {
        return {
          type: 'host',
          data: []
        }
      }
    }
  },
  data() {
    return {
      nodeList: [],
      visitedIds: []
    }
  },
  computed: {
    graph() {
      return this.$store.state.graph.editor.graph
    }
  },
  created() {
    this.getRelationNode(this.id)
  },
  methods: {
    judgeDisLink(data) {
      return !data.origin || (data.origin && data.origin === 'reuse' && !data.vmId)
    },
    getRelationNode(id) {
      const inEdges = this.graph.getIncomingEdges(id)
      inEdges &&
        inEdges.forEach((item) => {
          const sourceNode = item.getSourceNode()
          const model = sourceNode.getData()
          const { label: name, input: { fronts: { id: vmId, origin } = {} } = {} } = model
          const { id } = sourceNode
          if (this.visitedIds.includes(id)) return
          this.visitedIds.push(id)
          if (model.code.indexOf('task.resource.cvm') > -1) {
            this.nodeList.push({ id, name, vmId, origin, isLink: this.itemData.data.includes(model.id) })
          }
          this.getRelationNode(id)
        })
    },
    // 判断是否可以获取云主机节点的用户名密码
    changeLink(data) {
      if (!(data.origin === 'reuse' && data.isLink)) return
      conditionVm({
        condition: 'hasAuth',
        serverId: data.vmId
      }).then((res) => {
        if (res.success && (!res.data.account || !res.data.password)) {
          this.$message.error('抱歉，无法获取云主机认证信息，请自主进行配置')
          data.isLink = false
        }
      })
    },
    getPostData() {
      const data = []
      this.nodeList.forEach((item) => {
        if (item.isLink) {
          data.push(item.id)
        }
      })
      return {
        type: 'host',
        data: data
      }
    }
  }
}
</script>
