<template>
  <Editor @nodeClick="nodeClick" ref="editor" :height="editHeight">
    <DetailPanel :nodeData="nodeData"></DetailPanel>
  </Editor>
</template>

<script>
import Editor from './flowEdit/detail.vue'
import DetailPanel from './DetailPanel.vue'
import { handleReadData } from './util'

export default {
  props: {
    graph: {
      type: String
    }
  },
  components: {
    Editor,
    DetailPanel
  },
  data() {
    return {
      editHeight: 0,
      nodeData: {}
    }
  },
  computed: {
    editor() {
      return this.$refs.editor
    }
  },
  created() {
    this.editHeight = window.innerHeight - 400
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.editor.flow.read(handleReadData(JSON.parse(this.graph)))
    },
    nodeClick(item) {
      this.nodeData = item.getModel()
    }
  }
}
</script>
