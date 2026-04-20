<template>
  <el-dialog title="服务授权" width="800px" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <ServiceGrant :noConfigs="true" :tenant-id="dialog.id" :tenant-quota="dialog.quotaAble" ref="service"></ServiceGrant>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="save" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import ServiceGrant from './components/ServiceItem.vue'
import { authsAllTenant } from 'services/services/catelog'
export default {
  components: {
    ServiceGrant
  },
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      tenantServicesList: []
    }
  },

  methods: {
    quotaAbleServer(val) {
      this.quotaAble = val
    },

    save() {
      const selections = this.$refs.service.selections
      for (let index = 0; index < selections.length; index++) {
        const element = selections[index]
        if (element.quota == 0) {
          return this.$message.error('选中服务配额不能为0')
        }
      }
      const services = this.$refs.service.getPostData()
      this.loading = true
      authsAllTenant(this.dialog.id, {
        ...services
      })
        .then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.dialog.visible = false
            this.$emit('serviceSuccess')
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
