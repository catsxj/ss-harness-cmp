<template>
  <div>
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="detail" @goBack="goBack"> </common-detail>
    <el-form :inline="true">
      <el-form-item>
        <el-button type="primary" @click="dialog('addFlag', 1)"> 新增 </el-button>
      </el-form-item>
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="新增策略" :visible.sync="addFlag" width="40%" :before-close="handleClose">
      <el-row>
        <el-form ref="addData" :model="addData" :status-icon="true" label-width="120px">
          <basic-form-item label="平台名称" prop="vendorId" validate="required" required-message="请选择平台">
            <el-select v-model="addData.vendorId" placeholder="请选择平台" @change="getRuleList">
              <el-option v-for="(item, index) in vendorList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="名称" prop="name" validate="required" required-message="请输入名称">
            <el-input v-model="addData.name"></el-input>
          </basic-form-item>
          <el-form-item label="共享" prop="shared">
            <el-switch v-model="addData.shared" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </el-form-item>
          <el-form-item label="已审计" prop="audited">
            <el-switch v-model="addData.audited" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </el-form-item>
          <basic-form-item label="规则" prop="ruleIds" validate="required" required-message="请选择规则">
            <el-select v-model="addData.ruleIds" multiple placeholder="请选择">
              <el-option v-for="item in ruleData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input type="textarea" v-model="addData.remark"></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('addData', 'addFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(1, 'addData')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="编辑策略" :visible.sync="modifyFlag" width="40%" :before-close="handleClose">
      <el-row>
        <el-form ref="modifyData" :model="modifyData" :status-icon="true" label-width="120px">
          <basic-form-item label="名称" prop="name" validate="required" required-message="请输入名称">
            <el-input v-model="modifyData.name"></el-input>
          </basic-form-item>
          <el-form-item label="共享">
            <el-switch v-model="modifyData.shared" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </el-form-item>
          <el-form-item label="已审计">
            <el-switch v-model="modifyData.audited" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input type="textarea" v-model="modifyData.remark"></el-input>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('modifyData', 'modifyFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(2, 'modifyData')">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 插入规则 -->
    <el-dialog title="插入规则" :visible.sync="insertFlag" width="40%" v-if="insertFlag" @close="close(insertData)">
      <el-row>
        <el-form ref="insertData" :model="insertData" :status-icon="true" label-width="120px">
          <basic-form-item label="插入规则" prop="ruleId" validate="required" required-message="请选择规则">
            <el-select v-model="insertData.ruleId">
              <el-option v-for="(item, index) in insertRuleList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <el-form-item label="前一条规则">
            <el-select v-model="insertData.afterRuleId" placeholder="请选择前一条规则">
              <el-option v-for="(item, index) in nowRuleList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="后一条规则">
            <el-select v-model="insertData.beforeRuleId" placeholder="请选择后一条规则">
              <el-option v-for="(item, index) in nowRuleList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="insertFlag = false">取 消</el-button>
        <el-button @click="dialogOk(3, 'insertData')" type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 移除规则 -->
    <el-dialog title="移除规则" :visible.sync="removeFlag" width="40%" v-if="removeFlag" @close="close(removeData)">
      <el-row>
        <el-form ref="removeData" :model="removeData" :status-icon="true" label-width="90px">
          <basic-form-item label="规则" prop="ruleIds" validate="required" required-message="请选择规则">
            <el-select v-model="removeData.ruleIds" multiple>
              <el-option v-for="(item, index) in bindRuleList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="removeFlag = false">取 消</el-button>
        <el-button @click="dialogOk(4, 'removeData')" type="primary">确 定</el-button>
      </span>
    </el-dialog>

    <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
      <el-table-column label="名称" prop="name" show-overflow-tooltip> </el-table-column>
      <el-table-column prop="ruleNames" label="规则" show-overflow-tooltip></el-table-column>
      <el-table-column label="共享" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.shared | isTrue }}
        </template>
      </el-table-column>
      <el-table-column label="已审计" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.audited | isTrue }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" @click="dropdownClick({ row: scope.row, index: 1, id: scope.row.id })"><i class="el-icon-edit"></i> 编辑 </el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="dropdownClick({ row: scope.row, index: 4, id: scope.row.id })"><i class="el-icon-delete"></i> 删除 </el-button>
          <div class="action-divider"></div>
          <el-dropdown @command="dropdownClick">
            <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="{ row: scope.row, index: 2, vendorId: scope.row.vendorId, id: scope.row.id }">插入规则 </el-dropdown-item>
              <el-dropdown-item :command="{ row: scope.row, index: 3, vendorId: scope.row.vendorId, id: scope.row.id }">移除规则 </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </basic-table>
  </div>
</template>

<script>
import { isTrue } from 'filters'
import { conditionCloudVendor, conditionFirewallPolicy, policyRule, removePolicyRule, policyBindRule, getFirewallPolicy, removeFirewallPolicy, removeFirewallPolicys, detailFirewallPolicy, createFirewallPolicy, modifyFirewallPolicy } from 'services/platform/index'
export default {
  data() {
    return {
      detail: {},
      detailSetting: {
        type: 'firewall',
        columns: [
          [
            { name: '策略名称', value: 'name' },
            { name: '策略UUID', value: 'policyUuid' },
            { name: '策略描述', value: 'remark' }
          ],
          [
            { name: '是否共享', value: 'shared', filter: isTrue },
            { name: '已审计', value: 'audited', filter: isTrue },
            { name: '规则名称', value: 'ruleNames' }
          ],
          [
            { name: '所属平台', value: 'vendorName' },
            { name: '所属租户', value: 'tenantName' },
            { name: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectName' }
          ]
        ]
      },
      detailFlag: false,
      // 插入规则
      insertFlag: false,
      insertData: {},
      insertRuleList: [],
      nowRuleList: [],
      // 移除规则
      removeData: {
        ruleIds: []
      },
      removeFlag: false,
      bindRuleList: [],
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      platformObject: {},
      tableData: [],
      total: 0,
      addFlag: false,
      mountFlag: false,
      vmDataList: [],
      addData: {
        name: '',
        ruleIds: []
      },
      vendorList: [],
      ruleData: [],
      modifyFlag: false,
      modifyData: {
        name: '',
        remark: '',
        shared: false,
        audited: false
      },
      host: ''
    }
  },
  methods: {
    close(data) {
      data = {}
    },
    goBack() {
      this.detailFlag = false
    },
    // 详情
    getDetail(id) {
      detailFirewallPolicy(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detailFlag = true
        }
      })
    },
    // 模态框关闭
    colose(data) {
      this[data] = {}
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
      getFirewallPolicy(this.params).then(data => {
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
    dropdownClick(command) {
      this.platformObject = command.row
      switch (command.index) {
        case 1:
          this.dialog('modifyFlag', 2, command.row.id)
          break
        case 2:
          this.dialog('insertFlag', 3, command.id, command.vendorId)
          break
        case 3:
          this.dialog('removeFlag', 4, command.id, command.vendorId)
          break
        case 4:
          this.remove(command.row.id)
          break
      }
    },
    remove(id) {
      this.$confirm('此操作将永久删除该策略, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFirewallPolicy(id).then(data => {
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
    getRuleList() {
      conditionFirewallPolicy({
        condition: JSON.stringify({
          condition: 'listRule',
          vendorId: this.addData.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.ruleData = data.data
        }
      })
    },
    dialog(flag, index, id, vendorId) {
      switch (index) {
        case 1:
          this.getVendorList()
          this[flag] = true
          break
        case 2:
          detailFirewallPolicy(id).then(data => {
            if (data.success) {
              const vmDetail = data.data
              const updateItem = ['id', 'name', 'remark', 'shared', 'audited']
              for (let i = 0; i < updateItem.length; i++) {
                const item = updateItem[i]
                this.modifyData[item] = vmDetail[item]
              }
              this[flag] = true
            }
          })
          break
        case 3:
          this.insertData = {
            id: id,
            vendorId: vendorId
          }
          this[flag] = true
          // 获取未绑定规则
          conditionFirewallPolicy({
            condition: JSON.stringify({
              condition: 'listRule',
              vendorId: vendorId
            })
          }).then(data => {
            if (data.success) {
              this.insertRuleList = data.data
            }
          })
          // 获取已绑定规则
          policyBindRule({ policyId: id }).then(data => {
            if (data.success) {
              this.nowRuleList = data.data
            }
          })
          break
        case 4:
          this.removeData = {
            id: id,
            vendorId: vendorId,
            ruleIds: []
          }
          policyBindRule({
            policyId: id,
            vendorId: vendorId
          }).then(data => {
            if (data.success) {
              this.bindRuleList = data.data
            }
          })
          this[flag] = true
          break
      }
    },
    dialogOk(index, formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          switch (index) {
            case 1:
              const datas = {
                flag: false,
                value: ''
              }
              this.ruleData.forEach(data => {
                this.addData.ruleIds.forEach(item => {
                  if (item == data.id && this.addData.shared && !data.shared) {
                    datas.flag = true
                    datas.value = data.name
                  }
                })
              })
              if (datas.flag) {
                this.$notify({
                  title: '提示',
                  message: datas.value + '不是共享规则'
                })
                return
              }
              createFirewallPolicy(this.addData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.handleSearch()
                  this.addData = {
                    name: '',
                    ruleIds: [],
                    remark: ''
                  }
                  this.cancel('addData', 'addFlag')
                }
              })
              break
            case 2:
              modifyFirewallPolicy(this.modifyData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.cancel('modifyData', 'modifyFlag')
                  this.handleSearch()
                }
              })
              break
            case 3:
              policyRule(this.insertData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.handleSearch()
                  this.cancel('insertData', 'insertFlag')
                }
              })
              break
            case 4:
              removePolicyRule(this.removeData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.handleSearch()
                  this.cancel('removeData', 'removeFlag')
                }
              })
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
    handleClose(done) {
      const list = ['addFlag', 'modifyFlag']
      for (let i = 0; i < list.length; i++) {
        if (this[list[i]]) {
          switch (list[i]) {
            case 'addFlag':
              this.cancel('addData', 'addFlag')
              break
            case 'modifyFlag':
              this.cancel('modifyData', 'modifyFlag')
              break
            case 'insertFlag':
              this.cancel('insertData', 'insertFlag')
              break
            case 'removeData':
              this.cancel('removeData', 'removeFlag')
              break
          }
        }
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

.vm-region {
  height: 42px;
  width: 110px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 0 10px 0 0;
  border: 1px solid #ddd;
  line-height: 42px;
  font-size: 12px;
  text-align: center;
  color: #666;
  cursor: pointer;
  border-radius: 0;
  display: inline-block;
}

.vm-region:hover {
  border-color: #43bfe3 !important;
}

.vm-region-text {
  border-color: #43bfe3 !important;
}

.region-active {
  background-color: deepskyblue;
  color: #fff;
}
</style>
