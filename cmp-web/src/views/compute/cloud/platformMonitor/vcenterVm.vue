<template>
  <div class="wrapper-container">
    <common-detail :title="$route.query.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-id="detailId" :identifier="identifier" :host-name="hostName" :bios-uuid="biosUuid"></detail>
      </div>
    </common-detail>
  </div>
</template>
<script>
import detail from '../vcenter/vm_detail.vue'
import { getVmOverview } from 'services/monitor'
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
      vendorId: this.$route.query.vendorId,
      hostName: this.$route.query.hostName,
      biosUuid: this.$route.query.biosUuid
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
