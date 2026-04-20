<template>
  <div>
    <CardLayout title="节点参数">
      <component ref="node" :is="getCurrentComponent(currentNode.code)" :item-data="nodeData" :node-id="currentNode.id"></component>
    </CardLayout>
  </div>
</template>
<script>
import { components, getCurrentComponent } from './components/index'

export default {
  components,
  props: {
    currentNode: {
      type: Object
    }
  },
  data() {
    return {}
  },
  setup() {
    return {
      getCurrentComponent
    }
  },
  computed: {
    nodeData() {
      return this.currentNode.input.fronts
    }
  },
  methods: {
    getPostData() {
      const obj = this.$refs.node.getPostData()
      if (!obj) return { fronts: false }
      if (obj.osTenantName) {
        obj.extension = {
          osTenantName: obj.osTenantName
        }
      }
      let returnObj = {}
      if (obj.origin === 'reuse') {
        const { origin, id, location } = obj
        returnObj = {
          origin,
          id,
          location
        }
      } else {
        delete obj.id
        returnObj = obj
      }
      return { fronts: returnObj }
    }
  }
}
</script>
<style></style>
