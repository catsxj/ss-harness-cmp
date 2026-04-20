<template>
  <div>
    <el-card class="wrapper">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add()"> 新增 </el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.enabled ? '启用' : '停用' }}
          </template>
        </el-table-column>
        <el-table-column label="动作" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.action | action }}
          </template>
        </el-table-column>
        <el-table-column prop="protocol" label="协议" show-overflow-tooltip></el-table-column>
        <el-table-column prop="sourceIp" label="源IP" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.sourceIp">
              <div v-for="(item, index) in JSON.parse(scope.row.sourceIp)" :key="index">
                {{ item }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sourcePort" label="源端口" show-overflow-tooltip></el-table-column>
        <el-table-column prop="destIp" label="目的IP" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.destIp">
              <div v-for="(item, index) in JSON.parse(scope.row.destIp)" :key="index">
                {{ item }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="destPort" label="目的端口" show-overflow-tooltip></el-table-column>
        <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="220px" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="modify(scope.row)"> <i class="el-icon-edit"></i> 编辑 </el-button>
            <div class="action-divider"></div>
            <el-button :disabled="scope.row.disabled" type="text" @click="remove(scope.row)"> <i class="el-icon-delete"></i> 删除 </el-button>
            <div class="action-divider"></div>
            <el-dropdown @command="dropdownClick">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ row: scope.row, index: 1 }"> 向前插规则 </el-dropdown-item>
                <el-dropdown-item :command="{ row: scope.row, index: 2 }"> 向后插规则 </el-dropdown-item>
                <el-dropdown-item :command="{ row: scope.row, index: 3 }">
                  {{ scope.row.enabled ? '停用' : '启用' }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
    </el-card>
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
  </div>
</template>

<script>
import { getFirewallRule, removeFirewallRule, detailFirewallRule, modifyFirewallRule } from 'services/platform/index'
import add from './add.vue'
import webSocket from '@/common/mixins/getGlobalSocket'

export default {
  mixins: [webSocket],
  components: { add },
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      searchData: {
        keyName: '',
        value: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      tableData: [],
      total: 0,
      addData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('firewallRule') > -1) this.getData()
    },
    remove(data) {
      this.$confirm('此操作将删除所选ACL, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFirewallRule(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    add(data) {
      this.addData = {
        dialog: true,
        data: {
          name: '',
          protocol: 'ANY',
          action: 'ALLOW',
          sourceIp: '',
          destIp: '',
          sourcePort: '',
          destPort: '',
          remark: '',
          vendorId: this.detail.vendorId,
          firewallId: this.detail.id,
          firewallUuid: this.detail.firewallUuid
        },
        title: '新增ACL'
      }
    },
    modify(data1) {
      detailFirewallRule(data1.id).then(data => {
        if (data.success) {
          const destIp = data.data.destIp ? JSON.parse(data.data.destIp)[0] : ''
          const sourceIp = data.data.sourceIp ? JSON.parse(data.data.sourceIp)[0] : ''
          this.addData = {
            dialog: true,
            title: '编辑ACL',
            data: {
              id: data.data.id,
              protocol: data.data.protocol,
              action: data.data.action,
              sourceIp: sourceIp,
              destIp: destIp,
              sourcePort: data.data.sourcePort,
              destPort: data.data.destPort,
              name: data.data.name,
              remark: data.data.remark,
              vendorId: this.detail.vendorId,
              firewallId: this.detail.id,
              firewallUuid: this.detail.firewallUuid
            }
          }
        }
      })
    },
    dropdownClick(command) {
      switch (command.index) {
        case 1:
          this.addData = {
            dialog: true,
            data: {
              name: '',
              protocol: 'ANY',
              action: 'ALLOW',
              sourceIp: '',
              destIp: '',
              sourcePort: '',
              destPort: '',
              remark: '',
              vendorId: this.detail.vendorId,
              firewallId: this.detail.id,
              firewallUuid: this.detail.firewallUuid,
              type: 'BEFORE',
              referRuleId: command.row.ruleUuid
            },
            title: '新增ACL'
          }
          break
        case 2:
          this.addData = {
            dialog: true,
            data: {
              name: '',
              protocol: 'ANY',
              action: 'ALLOW',
              sourceIp: '',
              destIp: '',
              sourcePort: '',
              destPort: '',
              remark: '',
              vendorId: this.detail.vendorId,
              firewallId: this.detail.id,
              firewallUuid: this.detail.firewallUuid,
              type: 'AFTER',
              referRuleId: command.row.ruleUuid
            },
            title: '新增ACL'
          }
          break
        case 3:
          this.$confirm(`此操作将${command.row.enabled ? '停用' : '启用'}所选ACL, 是否继续?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            modifyFirewallRule({
              id: command.row.id,
              enabled: !command.row.enabled
            }).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.handleSearch()
              }
            })
          })
          break
      }
    },
    getData() {
      getFirewallRule(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(type) {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.detail.vendorId,
        firewallId: this.detail.id
      })
      this.getData()
    }
  },
  created() {
    this.handleSearch()
  },
  mounted() {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}

.title-header {
  margin-top: 10px;
  margin-bottom: 15px;
  text-indent: 8px;
  border-left: 3px solid #88b7e0;
  font-size: 14px;
  font-weight: 600;
}
</style>
