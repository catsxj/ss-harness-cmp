<template>
  <el-dialog :title="'创建' + $store.getters.systemConfig.projectConfigLabel" width="900px" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <el-row>
      <el-col :span="24">
        <BasicInfo ref="basicInfo" />
        <el-button class="pull-right" type="primary" @click="create()" :loading="loading">完成</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
import BasicInfo from './components/basicInfo.vue'
import { createProject } from 'services/system/project'

export default {
  components: { BasicInfo },
  props: {
    dialog: {
      type: Object
    },
    updateProject: {
      type: Function
    }
  },
  data() {
    return {
      loading: false,
      postData: {}
    }
  },
  computed: {
    tenantId() {
      return this.$store.getters.userData.id
    }
  },
  methods: {
    create() {
      const data = this.$refs.basicInfo.getPostData()
      if (data) {
        this.postData = data
        this.loading = true
        createProject({
          ...this.postData
        })
          .then((data) => {
            if (data.success) {
              this.dialog.visible = false
              this.$message.success(data.message)
              this.$emit('updateProject')
              this.$emit('getData')
            }
          })
          .finally(() => {
            this.loading = false
          })
      }
    }
  }
}
</script>
