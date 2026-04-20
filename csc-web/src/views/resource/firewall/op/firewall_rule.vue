<template>
  <div>
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="detail" @goBack="goBack"> </common-detail>
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="dialog('flag', 1)"> 新增 </el-button>
      </el-form-item>
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-dialog :title="name" :visible.sync="flag" width="60%" :before-close="handleClose" v-if="flag">
      <span>
        <el-form ref="Data" :model="Data" :status-icon="true" label-width="130px">
          <basic-form-item label="平台名称" prop="vendorId" v-if="name == '新增规则'" validate="required" required-message="请选择平台">
            <el-select v-model="Data.vendorId" placeholder="请选择平台">
              <el-option v-for="(item, index) in vendorList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="名称" prop="name" validate="required" required-message="请输入名称">
            <el-input v-model="Data.name"></el-input>
          </basic-form-item>
          <basic-form-item label="协议" prop="protocol" validate="required" required-message="请选择协议">
            <el-select v-model="Data.protocol">
              <el-option label="TCP" value="TCP"></el-option>
              <el-option label="UDP" value="UDP"></el-option>
              <el-option label="ICMP" value="ICMP"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="动作" prop="action" validate="required" required-message="请选择动作">
            <el-select v-model="Data.action">
              <el-option value="ALLOW" label="允许"></el-option>
              <el-option value="DENY" label="丢弃"></el-option>
            </el-select>
          </basic-form-item>
          <el-form-item label="IP版本">
            <el-select v-model="Data.ipVersion">
              <el-option label="4" value="V4">4</el-option>
              <el-option label="6" value="V6">6</el-option>
            </el-select>
          </el-form-item>
          <basic-form-item label="源IP地址/子网" prop="sourceIp" validate="ipORcidr" v-if="Data.ipVersion == 'V4'" :key="1">
            <el-input v-model="Data.sourceIp" placeholder="10.20.1.1"></el-input>
          </basic-form-item>
          <basic-form-item label="起始IP：" prop="sourceIp" validate="ipV6" v-else :key="2">
            <el-input v-model="Data.sourceIp" auto-complete="off" placeholder="请输入2222::类型格式"></el-input>
          </basic-form-item>
          <basic-form-item label="目的IP地址/子网" prop="destIp" validate="ipORcidr" v-if="Data.ipVersion == 'V4'" :key="3">
            <el-input v-model="Data.destIp" placeholder="10.20.1.1"></el-input>
          </basic-form-item>
          <basic-form-item label="终止IP：" prop="destIp" validate="ipV6" v-else :key="4">
            <el-input v-model="Data.destIp" auto-complete="off" placeholder="请输入2222::类型格式"></el-input>
          </basic-form-item>
          <el-form-item v-if="Data.protocol != 'ICMP'" label="源端口/端口范围" prop="sourcePort">
            <el-input v-model="Data.sourcePort" placeholder="8080:9090"></el-input>
          </el-form-item>
          <el-form-item v-if="Data.protocol != 'ICMP'" label="目的端口/端口范围" prop="destPort">
            <el-input v-model="Data.destPort" placeholder="8080:9090"></el-input>
          </el-form-item>
          <el-form-item label="启用">
            <el-switch v-model="Data.enabled" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </el-form-item>
          <el-form-item label="共享">
            <el-switch v-model="Data.shared" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input type="textarea" v-model="Data.remark"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('Data', 'flag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(1, 'Data')">确 定</el-button>
      </span>
    </el-dialog>
    <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
      <el-table-column label="名称" show-overflow-tooltip prop="name"> </el-table-column>
      <el-table-column prop="protocol" label="协议" show-overflow-tooltip></el-table-column>
      <el-table-column prop="sourceIp" label="源IP" show-overflow-tooltip></el-table-column>
      <el-table-column prop="sourcePort" label="源端口" show-overflow-tooltip></el-table-column>
      <el-table-column prop="destIp" label="目的IP" show-overflow-tooltip></el-table-column>
      <el-table-column prop="destPort" label="目的端口" show-overflow-tooltip></el-table-column>
      <el-table-column prop="action" label="动作" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ actionFilter[scope.row.action] }}
        </template>
      </el-table-column>
      <el-table-column label="共享">
        <template slot-scope="scope">
          {{ scope.row.shared | isTrue }}
        </template>
      </el-table-column>
      <el-table-column label="启用">
        <template slot-scope="scope">
          {{ scope.row.enabled | isTrue }}
        </template>
      </el-table-column>
      <el-table-column prop="policyName" label="策略" show-overflow-tooltip></el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="160px">
        <template slot-scope="scope">
          <el-button type="text" @click="dropdownClick({ row: scope.row, index: 1 })"><i class="el-icon-edit"></i> 编辑 </el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="dropdownClick({ row: scope.row, index: 2 })"><i class="el-icon-delete"></i> 删除 </el-button>
        </template>
      </el-table-column>
    </basic-table>
  </div>
</template>

<script>
import { isTrue, action } from 'filters'
import { conditionCloudVendor, getFirewallRule, removeFirewallRule, removeFirewallRules, detailFirewallRule, createFirewallRule, modifyFirewallRule, detailFirewall } from 'services/platform/index'
export default {
  data() {
    return {
      actionFilter: {
        ALLOW: '允许',
        DENY: '丢弃'
      },
      detailFlag: false,
      detailSetting: {
        type: 'firewall',
        columns: [
          [
            { name: '规则名称', value: 'name' },
            { name: '规则UUID', value: 'ruleUuid' },
            { name: '规则描述', value: 'remark' }
          ],
          [
            { name: '动作', value: 'action', filter: action },
            { name: '协议', value: 'protocol' },
            { name: 'IP版本', value: 'ipVersion' }
          ],
          [
            { name: '已使用策略', value: 'policyName' },
            { name: '源IP地址', value: 'sourceIp' },
            { name: '源端口', value: 'sourcePort' }
          ],
          [
            { name: '目的IP地址', value: 'destIp' },
            { name: '目的端口', value: 'destPort' },
            { name: '是否共享', value: 'shared', filter: isTrue }
          ],
          [
            { name: '已激活', value: 'enabled', filter: isTrue },
            { name: '策略中位置', value: 'position' },
            { name: '所属平台', value: 'vendorName' }
          ],
          [
            { name: '所属租户', value: 'tenantName' },
            { name: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectName' }
          ]
        ]
      },
      detail: {},
      name: '新增规则',
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      platformObject: {},
      vendorList: [],
      tableData: [],
      total: 0,
      flag: false,
      Data: {
        name: '',
        protocol: 'TCP',
        action: 'ALLOW',
        ipVersion: 'V4',
        sourceIp: '',
        destIp: '',
        sourcePort: '',
        destPort: '',
        enabled: false,
        shared: false,
        remark: ''
      }
    }
  },
  methods: {
    // 详情
    getDetail(id) {
      detailFirewallRule(id).then(data => {
        if (data.success) {
          this.detail = data.data
          if (this.detail.status == 'QUEUED') {
            this.detail.status1 = '排队中'
            this.detail.statusColor = '#f7ba2a'
          } else if (this.detail.status == 'ACTIVE') {
            this.detail.status1 = '运行中'
            this.detail.statusColor = '#20a0ff'
          } else if (this.detail.status == 'DELETED') {
            this.detail.status1 = '已删除'
            this.detail.statusColor = '#ff4949'
          } else {
            this.detail.status1 = '运行中'
            this.detail.statusColor = '#20a0ff'
          }
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getVendorList() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'poolProviders',
          types: ['OPENSTACK']
        })
      }).then(data => {
        if (data.success) {
          this.vendorList = data.data
        }
      })
    },
    getData() {
      getFirewallRule(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'vendorType:NUL': 'OPENSTACK',
        'name:LK': this.searchData.name
      })
      this.getData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    checkType() {
      switch (this.addData.type) {
        case 'LOCAL':
          this.isPhyNetwork = false
          this.isSementationId = false
          break
        case 'FLAT':
          this.isPhyNetwork = true
          this.isSementationId = false
          this.addData.phyNetwork = 'default'
          break
        case 'VLAN':
          this.isPhyNetwork = true
          this.isSementationId = true
          this.addData.phyNetwork = 'DVS01'
          break
        case 'GRE':
          this.isPhyNetwork = false
          this.isSementationId = true
          break
        case 'VXLAN':
          this.isPhyNetwork = false
          this.isSementationId = true
          break
      }
    },
    dialog(flag, index, id) {
      switch (index) {
        case 1:
          this.getVendorList()
          this.Data = {
            name: '',
            protocol: 'TCP',
            action: 'ALLOW',
            ipVersion: 'V4',
            sourceIp: '',
            destIp: '',
            sourcePort: '',
            destPort: '',
            enabled: false,
            shared: false,
            remark: ''
          }
          this.name = '新增规则'
          this[flag] = true
          break
        case 2:
          this.name = '编辑规则'
          detailFirewallRule(id).then(data => {
            if (data.success) {
              this.Data = {
                id: id,
                enabled: data.data.enabled,
                shared: data.data.shared,
                protocol: data.data.protocol,
                action: data.data.action,
                ipVersion: data.data.ipVersion,
                sourceIp: data.data.sourceIp,
                destIp: data.data.destIp,
                sourcePort: data.data.sourcePort,
                destPort: data.data.destPort,
                name: data.data.name,
                remark: data.data.remark,
                vendorId: this.platformObject.vendorId
              }
            }
          })
          this[flag] = true
          break
      }
    },
    handleClose(done) {
      const list = ['flag']
      for (let i = 0; i < list.length; i++) {
        if (this[list[i]]) {
          switch (list[i]) {
            case 'flag':
              this.cancel('Data', 'flag')
              break
          }
        }
      }
    },
    dialogOk(index, formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          switch (index) {
            case 1:
              if (this.name == '新增规则') {
                createFirewallRule(this.Data).then(data => {
                  if (data.success) {
                    this.$message({
                      type: 'success',
                      message: data.message
                    })
                    this.handleSearch()
                    this.cancel('Data', 'flag')
                  }
                })
              } else {
                modifyFirewallRule(this.Data).then(data => {
                  if (data.success) {
                    this.$message({
                      type: 'success',
                      message: data.message
                    })
                    this.handleSearch()
                    this.cancel('Data', 'flag')
                  }
                })
              }
              break
          }
        } else {
          return false
        }
      })
    },
    cancel(formName, flag) {
      this[flag] = false
      this.$refs[formName].resetFields()
    },
    dropdownClick(command) {
      this.platformObject = command.row
      switch (command.index) {
        case 1:
          this.dialog('flag', 2, command.row.id)
          break
        case 2:
          this.$confirm('此操作将永久删除该规则, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeFirewallRule(command.row.id).then(data => {
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
    }
  },
  mounted() {},
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}
</style>
