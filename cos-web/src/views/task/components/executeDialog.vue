<template>
  <div></div>
</template>
<script>
export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      startMode: 'AUTO',
      loading: false
    }
  },
  created() {
    this.$confirm('您确定要执行吗?', '提示', {
      type: 'warning'
    }).then(() => {
      this.applyClick()
    })
  },
  methods: {
    // 申请执行
    applyClick() {
      this.loading = true
      const { service, id, action } = this.dialog
      service(id, action, {
        startMode: this.startMode
      }).then((data) => {
        if (data.success) {
          this.dialog.visible = false
          this.$message.success(data.message)
          this.$emit('getData')
        }
        this.loading = false
      })
    }
  }
}
</script>
