<template>
  <div>
    <CardLayout title="节点参数" v-if="['task.software.role'].indexOf(currentNode.code) === -1">
      <el-button slot="operate" v-if="isNeedDefault" class="m-r-xs" type="text" @click="dialog.visible = true">默认安装参数配置</el-button>
      <basic-form>
        <basic-form-item label="部署方式：" v-if="deploy.cluster && deploy.default !== 'cluster'">
          <el-radio-group v-model="module" :disabled="isPreview || isTaskInstance">
            <el-radio label="standalone">单点</el-radio>
            <el-radio label="cluster">集群</el-radio>
          </el-radio-group>
        </basic-form-item>
        <component ref="node" :is="getCurrentComponent(currentNode.code)" :item-data="nodeData" :module="module" :special-config="specialConfig"></component>
      </basic-form>
    </CardLayout>
    <ParamDialog ref="paramDialog" :dialog="dialog" :item-data="software_config" v-if="isNeedDefault"></ParamDialog>
    <div v-if="(module === 'standalone' || specialConfig.showTarget) && !this.isHistoryDetail">
      <CardLayout title="主机设置" v-if="!isTemplate">
        <TargetServer ref="targetServer" :item-data="targetData" :disabled="isPreview" :hide-sudo="isHideSudo" :hide-auth-way="currentNode.code === 'task.software.role'" :code="currentNode.code"></TargetServer>
      </CardLayout>
      <RelationServer v-if="false" ref="relationServer" :item-data="dependData" :id="currentNode.id"></RelationServer>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import show from '../mixins/show'
import { roleWidth, ClusterCoor } from './clusterCoor'
import ParamDialog from './defaultParamDialog.vue'
import TargetServer from '../targetServer/TargetServer.vue'
import RelationServer from '../targetServer/relationServer.vue'
import { components, getCurrentComponent } from './components/index'
import { clusterTypeMap, clusterModeTypeMap } from './data'
import { createFlowNode, createFlowEdge, createGroup } from 'cmp-graph-editor'

export default {
  mixins: [show],
  components: {
    ParamDialog,
    TargetServer,
    RelationServer,
    ...components
  },
  props: {
    currentNode: {
      type: Object
    }
  },
  data() {
    return {
      module: 'standalone',
      dialog: {
        visible: false,
        code: this.currentNode.code
      },
      software_config: {},
      // 解决特殊配置问题
      specialConfig: {
        // mysql多主情况下需要展示目标机器
        showTarget: false
      },
      cacheConfig: {
        module: ''
      }
    }
  },
  setup() {
    return {
      getCurrentComponent
    }
  },
  computed: {
    ...mapState({
      graph: state => state.graph.editor.graph,
      moduleMap: state => state.graph.moduleMap
    }),
    nodeData() {
      return this.currentNode.input.fronts
    },
    targetData() {
      return this.currentNode.input.target
    },
    dependData() {
      return this.currentNode.input.depend
    },
    deploy() {
      const moduleData = this.moduleMap[this.currentNode.code]
      return JSON.parse(moduleData.template).deploy
    },
    isNeedDefault() {
      const data = ['task.software.jdk', 'task.software.nginx', 'task.software.rabbitmq', 'task.software.activemq', 'task.software.nfs.client', 'task.software.nfs.server', 'task.software.role', 'task.software.iscsi.client', 'task.software.iscsi.server', 'task.software.iscsi']
      return !data.includes(this.currentNode.code)
    }
  },
  created() {
    this.module = this.deploy.default || 'standalone'
    if (this.nodeData) {
      this.module = this.nodeData.module
      this.software_config = this.nodeData.software_config
      this.cacheConfig.clusterType = this.nodeData.cluster_type
    }
    this.cacheConfig.module = this.module
  },
  methods: {
    // 当数组为空时删除该属性，否则后端处理有问题
    removeArr(data) {
      for (const a in data) {
        const item = data[a]
        if (item instanceof Array && !item.length) delete data[a]
      }
      return data
    },
    getPostData() {
      const node = this.$refs.node
      let fronts = node && node.getPostData()
      if (fronts === false) return { fronts: false }
      fronts = this.removeArr(fronts)
      let target = {}
      let depend = {}
      const targetNode = this.$refs.targetServer
      const dependNode = this.$refs.relationServer
      target = targetNode && targetNode.getPostData()
      depend = (dependNode && dependNode.getPostData()) || {
        type: 'host',
        data: []
      }
      if (this.isTaskInstance && targetNode) {
        // 集群部署时目标机器必须大于1
        const servers = [].concat(target.data, depend.data)
        if (servers.length === 0) {
          this.$message.error('请选择目标机器')
          return { fronts: false }
        }
        // 确定是否集群部署 module正常集群 cluster_install特殊集群部署
        let cluster_install = (fronts && fronts.cluster_install) || false
        if (this.deploy.cluster) {
          cluster_install = this.module === 'cluster'
        }
        if (cluster_install) {
          if (servers.length <= 1) {
            this.$message.error('集群部署时目标机器必须大于1')
            return { fronts: false }
          }
          if (this.currentNode.code === 'task.software.oracle' && fronts.manage_config.vip.length !== servers.length) {
            this.$message.error('oracle的虚拟IP必须与目标机器个数相等')
            return { fronts: false }
          }
        }
      }
      const { module, clusterType } = this.cacheConfig
      // 非角色节点 只有在部署模式改变或者集群模式改变下更新拓扑
      if (this.currentNode.code !== 'task.software.role' && (module !== this.module || clusterType !== fronts.cluster_type)) this.handleTopology(fronts.cluster_type)
      const frontsCache = {
        ...fronts,
        module: this.module,
        software_config: this.isNeedDefault ? this.$refs.paramDialog.save() : {}
      }
      if (this.deploy.cluster) {
        frontsCache.cluster_install = this.module === 'cluster'
      }
      return {
        fronts: frontsCache,
        target: target,
        depend: depend
      }
    },
    handleTopology(clusterType) {
      const parent = this.graph.getCellById(this.currentNode.id).getParent()
      if (parent && (this.module === 'standalone' || this.specialConfig.showTarget)) {
        this.generateStandaloneGraph(parent)
      }
      // 集群模式下并且存在分组，且特殊配置不展示目标机器
      if (this.module === 'cluster' && !this.specialConfig.showTarget) {
        if (parent) {
          this.generateStandaloneGraph(parent)
        }
        this.generateClusterGraph(clusterType)
      }
    },
    generateClusterGraph(clusterType) {
      const mainNode = this.graph.getCellById(this.currentNode.id)
      mainNode.updateData({
        mainNode: true
      })
      const position = mainNode.position()
      const topo = clusterType ? this.deploy.cluster[clusterType] : this.deploy.cluster.topo
      const coorIns = new ClusterCoor(topo.length)
      const group = createGroup(this.graph, {
        label: `${this.currentNode.label} ${clusterType ? clusterModeTypeMap[clusterType] : clusterTypeMap[this.currentNode.code]}`,
        x: position.x - coorIns.xOffset,
        y: position.y - coorIns.yOffset / 2,
        width: coorIns.groupWidth,
        height: 185
      })
      this.graph.addNode(group)
      group.addChild(mainNode)
      topo.forEach((item, index) => {
        const [x, y] = coorIns.getCoor(index)
        const node = createFlowNode(this.graph, {
          width: roleWidth,
          position: {
            x: position.x + x,
            y: position.y + y
          },
          data: {
            label: item.name,
            role: item.role,
            shape: 'role-node',
            parent: group.id,
            ignore: true,
            icon: 'role.png',
            pid: mainNode.id,
            code: 'task.software.role'
          }
        })
        this.graph.addNode(node)
        group.addChild(node)
        createFlowEdge(this.graph, {
          source: {
            cell: this.currentNode.id,
            port: mainNode.getPortAt(coorIns.getPort(index)).id
          },
          target: {
            cell: node.id,
            port: node.getPortAt(0).id
          },
          data: {
            ignore: true
          }
        })
      })
    },
    generateStandaloneGraph(parent) {
      const mainNode = this.graph.getCellById(this.currentNode.id)
      // 获取节点边过滤掉角色边
      const edges = this.graph.getConnectedEdges(mainNode).filter(item => !item.data?.ignore)
      this.graph.removeNode(parent)
      this.graph.addNode(mainNode)
      edges.forEach(item => this.graph.addEdge(item))
    }
  }
}
</script>
<style></style>
