<template>
  <PageLayout title-name="作业执行" @goBack="goBack">
    <template slot="operate">
      <el-button class="pull-right" type="primary" @click="execute" :loading="loading"> <i class="el-icon-help"></i> 执行 </el-button>
    </template>
    <GraphItem :template-id="Number($route.query.templateId)" ref="graph"></GraphItem>
  </PageLayout>
</template>
<script>
import GraphItem from 'views/task/graph/graph.vue'
import { executeCosTask, executeRosTask } from 'services/task/csc_task'

export default {
  components: {
    GraphItem
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    async execute() {
      const graph = this.$refs.graph.handlePostData()
      if (graph) {
        this.loading = true
        const {
          params: { id },
          query: { templateId, key }
        } = this.$route
        try {
          const http = key === 'cosId' ? executeCosTask : executeRosTask
          const result = await http({
            [key]: this.$route.params.id,
            task: {
              templateId,
              graph
            }
          })
          if (result.success) {
            this.$message.success(result.message)
            this.goBack()
          }
        } catch (e) {}
        this.loading = false
      }
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
