<template>
  <div>
    <el-tabs v-model="active" @tab-click="getData(1)">
      <el-tab-pane label="入站规则" name="Inbound">
        <basic-table :data="ruleData" :params="params" :get-list="getData" :total="ruleTotal">
          <el-table-column prop="priority" label="优先级" show-overflow-tooltip></el-table-column>
          <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="name" label="协议" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.protocol }}
            </template>
          </el-table-column>
          <el-table-column prop="sourceAddressPrefix" label="源" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sourcePortRange" label="源端口" show-overflow-tooltip></el-table-column>
          <el-table-column prop="destinationAddressPrefix" label="目标" show-overflow-tooltip></el-table-column>
          <el-table-column prop="destinationPortRange" label="目标端口" show-overflow-tooltip></el-table-column>
          <el-table-column prop="remark" label="规则策略" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.action == 'Allow' ? '允许' : '拒绝' }}
            </template>
          </el-table-column>
        </basic-table>
      </el-tab-pane>
      <el-tab-pane label="出站规则" name="Outbound">
        <basic-table :data="ruleData" :params="params" :get-list="getData" :total="ruleTotal">
          <el-table-column prop="priority" label="优先级" show-overflow-tooltip></el-table-column>
          <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="name" label="协议" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.protocol }}
            </template>
          </el-table-column>
          <el-table-column prop="sourceAddressPrefix" label="源" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sourcePortRange" label="源端口" show-overflow-tooltip></el-table-column>
          <el-table-column prop="destinationAddressPrefix" label="目标" show-overflow-tooltip></el-table-column>
          <el-table-column prop="destinationPortRange" label="目标端口" show-overflow-tooltip></el-table-column>
          <el-table-column prop="remark" label="规则策略" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ scope.row.action == 'Allow' ? '允许' : '拒绝' }}
            </template>
          </el-table-column>
        </basic-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getGroupRule } from 'services/platform/index'
import webSocket from '@/common/mixins/webSocket'
export default {
  mixins: [webSocket],
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      ruleData: [],
      ruleTotal: 0,
      params: {
        page: 1,
        rows: 10
      },
      active: 'Inbound'
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) this.getData()
    },
    getData(page) {
      this.params.page = page || this.params.page
      this.params.params = JSON.stringify([{ param: { groupId: this.detail.securityGroupId, direction: this.active }, sign: 'EQ' }])
      getGroupRule(this.params).then(data => {
        if (data.success) {
          this.ruleData = data.data.rows
          this.ruleTotal = data.data.total
        }
      })
    }
  },
  created() {
    this.getData()
  }
}
</script>

<style></style>
