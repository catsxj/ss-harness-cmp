<template>
  <div class="wrapper-container">
    <common-detail :title="$route.query.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-id="detailId" :instanceId="identifier"></detail>
      </div>
    </common-detail>
  </div>
</template>
<script>
import detail from '../smart/vm_detail.vue'
export default {
  components: {
    detail
  },
  data() {
    return {
      detailData: {
        name: this.$route.query.name
      },
      detailId: Number(this.$route.query.id),
      identifier: this.$route.query.identifier,
      vendorId: this.$route.query.vendorId
    }
  },
  methods: {
    goBack() {
      if (!this.vendorId) {
        history.go(-1)
      } else {
        this.$router.push({
          name: 'MonitorDashboard',
          query: {
            vendorId: this.vendorId
          }
        })
      }
    }
  },
  created() {}
}
</script>

<style scoped></style>
