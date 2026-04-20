<template>
  <div class="wrapper-container">
    <common-detail :title="$route.query.name" @goBack="goBack">
      <div slot="custom_content">
        <detail :detail-id="detailId" :instance-id="instanceId"></detail>
        <!--<el-tabs v-model="detailActiveName" class="m-t-n-md">-->
        <!--<el-tab-pane name="overview">-->
        <!--<span slot="label">资源总览</span>-->
        <!--<overview ref="overview" v-if="detailActiveName=='overview'" :detail-id="detailId" :instance-id="instanceId"></overview>-->
        <!--</el-tab-pane>-->
        <!--<el-tab-pane name="network">-->
        <!--<span slot="label">网络安全组</span>-->
        <!--<network ref="network" v-if="detailActiveName=='network'" @getNetDetail="getNetDetail" :detail-id="detailId"></network>-->
        <!--</el-tab-pane>-->
        <!--</el-tabs>-->
      </div>
    </common-detail>
    <common-detail v-if="detailNetFlag" :title="detailNet.name" @goBack="goBackNet">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.createTime }}</common-detail-item>
        <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
        <common-detail-item label="所属平台">{{ detailData.vendorName }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detailData.tenantName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel">{{ detailData.projectName }}</common-detail-item>
        <common-detail-item label="安全组UUID">{{ detailData.groupUuid }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="规则列表" name="second">
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal">
            <el-table-column prop="name" label="IP协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ secruityProtocolFilter(scope.row.protocol) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="方向" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ securityGroupFilter(scope.row.direction) }}
              </template>
            </el-table-column>
            <el-table-column prop="tenantName" label="以太网类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ etherTypeFilter(scope.row.etherType) }}
              </template>
            </el-table-column>
            <el-table-column prop="portMin" label="起始端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="portMax" label="结束端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="tenantName" label="远端IP前缀" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.remoteIpPrefix || (scope.row.etherType == 'IPv6' ? '::/0' : '0.0.0.0/0') }}
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </div>
</template>
<script>
import { etherTypeFilter, securityGroupFilter, secruityProtocolFilter } from '@/filters/index'
import detail from '../openstack/vm_detail.vue'
import { getGroupRule } from 'services/platform/index'

export default {
  components: {
    // overview, network
    detail
  },
  data() {
    return {
      etherTypeFilter,
      securityGroupFilter,
      secruityProtocolFilter,
      detailActiveName: 'overview',
      detailData: {
        name: this.$route.query.name
      },
      detailFlag: true,
      detailId: Number(this.$route.query.id),
      instanceId: this.$route.query.identifier,
      vendorId: this.$route.query.vendorId,
      detailNetFlag: false,
      ruleDetailData: [],
      ruleDetailTotal: 0,
      paramd: {
        page: 1,
        rows: 10
      },
      detailNet: '',
      hostData: []
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
    getNetDetail(data) {
      this.detailFlag = false
      this.detailNet = data
      this.getDetailHost(1)
      this.detailNetFlag = true
    },
    getDetailHost(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: {
            groupId: this.detailNet.id,
            vendorId: this.detailNet.vendorId
          },
          sign: 'EQ'
        }
      ])
      getGroupRule(this.paramd).then((data) => {
        if (data.success) {
          this.ruleDetailData = data.data.rows
          this.ruleDetailTotal = data.data.total
        }
      })
    },
    goBackNet() {
      this.detailNetFlag = false
      this.detailFlag = true
      this.detailActiveName = 'network'
    }
  },
  created() {}
}
</script>

<style scoped></style>
