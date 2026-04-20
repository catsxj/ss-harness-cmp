<template>
  <div class="m-l">
    <label class="project-title">当前{{ $store.getters.systemConfig.projectConfigLabel }}：</label>
    <el-select class="project-width" v-model="projectId" :placeholder="'请选择' + $store.getters.systemConfig.projectConfigLabel" @change="selectProject(1)" size="mini">
      <el-option label="全部" :value="0" :disabled="$route.path.includes('/resource_order')"> </el-option>
      <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
    </el-select>
  </div>
</template>
<script>
import { switchProject } from 'services/system/project'

export default {
  data() {
    return {
      projectId: 0
    }
  },
  computed: {
    currentProjectId() {
      return this.$store.state.project.projectId
    },
    projectList() {
      return this.$store.getters.projectList
    }
  },
  async created() {
    await this.$store.dispatch('project/GetProject')
    this.projectId = this.currentProjectId
  },
  methods: {
    selectProject(flag) {
      this.$store.commit('project/SET_PROJECTID', this.projectId)
      switchProject(this.projectId || 0).then(data => {
        if (data.success && flag) {
          // flag = true为手动切换应用系统时做所有数据做刷新
          this.$router.push({ name: 'Redirect', query: { path: this.$route.path, query: this.$route.query, params: this.$route.params } })
        }
      })
    }
  }
}
</script>
<style scoped>
.project-title {
  font-size: 14px;
  color: #fff;
}

.project-width {
  width: calc(100% - 77px) !important;
}
::v-deep .el-input__inner {
  background: hsla(0, 0%, 100%, 0.15);
  color: #fff;
  border: 1px solid hsla(0, 0%, 100%, 0.25);
}
</style>
