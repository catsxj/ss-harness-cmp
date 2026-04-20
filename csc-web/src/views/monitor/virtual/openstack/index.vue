<template>
  <div>
    <el-tabs v-model="activeName" class="m-t-n-md">
      <el-tab-pane name="overview">
        <span slot="label">资源总览</span>
        <detail v-if="activeName == 'overview'" :detail-id="detailId" :identifier="identifier" :is-show="isShow"></detail>
      </el-tab-pane>
      <el-tab-pane name="network">
        <span slot="label">网络安全组</span>
        <network ref="network" @getNetDetail="getNetDetail" :detail-id="detailId"></network>
      </el-tab-pane>
    </el-tabs>
    <common-detail v-if="detailNetFlag" :title="detailNet.name" @goBack="goBackNet">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailNet.name }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailNet.gmtCreate }}</common-detail-item>
        <common-detail-item label="描述">{{ detailNet.remark }}</common-detail-item>
        <common-detail-item label="所属平台">{{ detailNet.vendorName }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detailNet.tenantName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel">{{ detailNet.projectName }}</common-detail-item>
        <common-detail-item label="安全组UUID">{{ detailNet.groupUuid }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="规则列表" name="second">
          <basic-table :data="ruleDetailData" :params="paramd" :get-list="getDetailHost" :total="ruleDetailTotal">
            <el-table-column prop="name" label="IP协议" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.protocol | secruityProtocol }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="方向" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.direction | securityGroupFilter }}
              </template>
            </el-table-column>
            <el-table-column prop="tenantName" label="以太网类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.etherType | etherType }}
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
// import overview from './overview.vue'
import detail from './detail.vue'
import network from './network.vue'
import { getGroupRule } from 'services/platform/index'
export default {
  components: { detail, network },
  props: {
    detailData: {
      type: Object
    },
    detailId: {
      type: Number
    },
    identifier: {
      type: String
    },
    isShow: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      activeName: 'overview',
      detailFlag: true,
      detailNetFlag: false,
      ruleDetailData: [],
      ruleDetailTotal: 0,
      paramd: {
        page: 1,
        rows: 10
      },
      detailNet: {}
    }
  },
  methods: {
    goBack() {
      this.$emit('goBack')
    },
    getNetDetail(data) {
      this.detailFlag = false
      this.detailNet = data
      console.log(this.detailNet)
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
      getGroupRule(this.paramd).then(data => {
        if (data.success) {
          this.ruleDetailData = data.data.rows
          this.ruleDetailTotal = data.data.total
        }
      })
    },
    goBackNet() {
      this.detailNetFlag = false
      this.detailFlag = true
      this.activeName = 'network'
    }
  },
  created() {},
  beforeDestroy() {}
}
</script>
