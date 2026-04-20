<template>
  <div>
    <CardLayout title="节点参数">
      <component ref="node" :is="getCurrentComponent(currentNode.code)" :item-data="nodeData" :target-data="targetData"></component>
    </CardLayout>
    <CardLayout title="主机设置" v-if="isShowTarget && !isTemplate">
      <TargetServer ref="targetServer" :item-data="targetData" :disabled="isPreview" :hide-sudo="isHideSudo" :osCategory="nodeData.osCategory"></TargetServer>
    </CardLayout>
    <RelationServer ref="relationServer" :item-data="dependData" :id="currentNode.id" v-if="isShowTarget"></RelationServer>
  </div>
</template>
<script>
import show from '../mixins/show'
import TargetServer from '../targetServer/TargetServer.vue'
import RelationServer from '../targetServer/relationServer.vue'
import { components, getCurrentComponent } from './components/index'

export default {
  mixins: [show],
  components: {
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
      isShowTarget: false
    }
  },
  computed: {
    nodeData() {
      return this.currentNode.input.fronts
    },
    targetData() {
      return this.currentNode.input.target
    },
    dependData() {
      return this.currentNode.input.depend
    }
  },
  created() {
    this.init()
  },
  methods: {
    getCurrentComponent,
    init() {
      const codeArr = ['task.maintain.upload', 'task.maintain.script', 'task.maintain.scripts', 'task.maintain.backup', 'task.maintain.user', 'task.maintain.service', 'task.maintain.hostallow']
      this.isShowTarget = codeArr.includes(this.currentNode.code) && !this.isHistoryDetail
    },
    getPostData() {
      const input = {
        fronts: this.$refs.node.getPostData()
      }
      const targetRef = this.$refs.targetServer
      const dependRef = this.$refs.relationServer
      input.target = targetRef && targetRef.getPostData()
      input.depend = dependRef && dependRef.getPostData()
      return input
    }
  }
}
</script>
<style></style>
