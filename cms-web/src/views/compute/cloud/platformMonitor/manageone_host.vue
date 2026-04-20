<template>
  <div class="wrapper-container">
    <common-detail :title="$route.query.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <el-tabs v-model="detailActiveName" class="m-t-n-md">
            <el-tab-pane name="overview">
              <span slot="label">资源总览</span>
              <overview ref="overview" v-if="detailActiveName == 'overview'" :detail-id="detailId" :detail-data="detailData"></overview>
            </el-tab-pane>
            <el-tab-pane name="cpu">
              <span slot="label">CPU</span>
              <cpu ref="cpu" v-if="detailActiveName == 'cpu'" :detail-id="detailId"></cpu>
            </el-tab-pane>
            <el-tab-pane name="mem">
              <span slot="label">内存</span>
              <mem ref="mem" v-if="detailActiveName == 'mem'" :detail-id="detailId"></mem>
            </el-tab-pane>
            <el-tab-pane name="net">
              <span slot="label">网络</span>
              <net ref="net" v-if="detailActiveName == 'net'" :detail-id="detailId"></net>
            </el-tab-pane>
            <el-tab-pane name="disk">
              <span slot="label">磁盘</span>
              <disk ref="disk" v-if="detailActiveName == 'disk'" :detail-id="detailId"></disk>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </common-detail>
  </div>
</template>
<script>
import overview from '../FusionCloud/host_overview.vue'
import cpu from '../FusionCloud/host_cpu.vue'
import mem from '../FusionCloud/host_memory.vue'
import disk from '../FusionCloud/host_disk.vue'
import net from '../FusionCloud/host_net.vue'
export default {
  components: {
    overview,
    cpu,
    mem,
    disk,
    net
  },
  data() {
    return {
      detailActiveName: 'overview',
      detailData: {
        name: this.$route.query.name
      },
      detailId: this.$route.query.identifier,
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
