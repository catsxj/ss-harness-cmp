<template>
  <el-dialog title="配额设置" width="600px" :close-on-click-modal="false" :visible.sync="dialog.visible">
    <quota-item :quota-data="quotaData" ref="quota"></quota-item>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="quotaSubmit" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import QuotaItem from './QuotaItem'
import { createQuotaTenant, getQuotaTenant } from 'services/system/tenant'

export default {
  components: { QuotaItem },
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      quotaData: [],
      loading: false
    }
  },
  created() {
    this.getQuota()
  },
  methods: {
    getQuota() {
      getQuotaTenant(this.dialog.id, { params: JSON.stringify({ target: this.dialog.id, catalog: this.dialog.type }) }).then(data => {
        if (data.success) {
          this.quotaData = data.data
        }
      })
    },
    quotaSubmit() {
      const resourceQuotas = this.$refs.quota.getPostData()
      this.loading = true
      createQuotaTenant(this.dialog.id, resourceQuotas)
        .then(data => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.dialog.visible = false
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
