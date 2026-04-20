<template>
  <div class="wrapper-container">
    <common-detail :title="detailData.name" @goBack="goBack">
      <div slot="custom_content">
        <el-card>
          <el-tabs v-model="detailActiveName" class="m-t-n-md">
            <el-tab-pane name="overview">
              <span slot="label">资源总览</span>
              <overview ref="overview" v-if="detailActiveName == 'overview'" :detail-id="detailId" :detail-ip="detailIp"></overview>
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
import overview from '../easystack/host_overview.vue'
import cpu from '../easystack/host_cpu.vue'
import mem from '../easystack/host_memory.vue'
import disk from '../easystack/host_disk.vue'
import net from '../easystack/host_network.vue'
import { getEasystackHost } from 'services/monitor'
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
      detailData: {},
      detailId: Number(this.$route.query.id),
      detailIp: this.$route.query.identifier,
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
    },
    getOverview() {
      getEasystackHost(this.detailId).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
        }
      })
    }
  },
  created() {
    this.getOverview()
  }
}
</script>

<style scoped></style>
