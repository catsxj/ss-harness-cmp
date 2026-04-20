<template>
  <div>
    <div>
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" @click="add">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-input class="search-item" placeholder="名称" v-model="searchData.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getData" :total="total">
        <el-table-column prop="name" label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="policyName" label="策略" show-overflow-tooltip></el-table-column>
        <el-table-column prop="routerNames" label="关联路由" show-overflow-tooltip></el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | firewallColor">
              {{ scope.row.status | firewallStatus }}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column prop="vendorName" label="所属平台" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <el-button type="text" @click="dropdownClick({ row: scope.row, index: 1 })"><i class="el-icon-edit"></i> 编辑 </el-button>
            <div class="action-divider"></div>
            <el-button type="text" @click="dropdownClick({ row: scope.row, index: 3 })"><i class="el-icon-delete"></i> 删除 </el-button>
            <div class="action-divider" v-if="scope.row.vendorType != 'MANAGEONE'"></div>
            <el-dropdown @command="dropdownClick" v-if="scope.row.vendorType != 'MANAGEONE'">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ row: scope.row, index: 2 }">关联路由</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog title="关联路由" :visible.sync="relevanceFlag" width="40%" :before-close="handleClose">
      <el-row>
        <el-form ref="relevanceData" :model="relevanceData" :status-icon="true" label-width="120px">
          <el-form-item label="路由" prop="routerIds">
            <el-select v-model="relevanceData.routerIds" multiple placeholder="请选择">
              <el-option v-for="item in routeData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('relevanceData', 'relevanceFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(3, 'relevanceData')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="编辑防火墙" :visible.sync="modifyFlag" width="40%" :before-close="handleClose">
      <el-row>
        <el-form ref="modifyData" :model="modifyData" :status-icon="true" label-width="120px">
          <basic-form-item label="名称" prop="name" validate="required">
            <el-input v-model="modifyData.name"></el-input>
          </basic-form-item>
          <el-form-item label="策略" prop="policyId" v-if="modifyData.vendorType == 'OPENSTACK'">
            <el-select v-model="modifyData.policyId">
              <el-option v-for="item in policyData" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
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
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
    <common-detail-right v-if="detailFlag" :title="detail.name" :data="detail" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="状态">{{ detail.status | firewallStatus }}</common-detail-item>
        <common-detail-item label="防火墙UUID">{{ detail.firewallUuid }}</common-detail-item>
        <common-detail-item label="防火墙策略">{{ detail.policyName }}</common-detail-item>
        <common-detail-item label="策略UUID">{{ detail.policyUuid }}</common-detail-item>
        <common-detail-item label="管理状态">{{ detail.adminStateUp | adminStateupFilter }}</common-detail-item>
        <common-detail-item label="是否共享">{{ detail.shared | isTrue }}</common-detail-item>
        <common-detail-item label="路由名称">{{ detail.routerNames }}</common-detail-item>
        <common-detail-item label="所属平台">{{ detail.vendorName }}</common-detail-item>
        <common-detail-item label="策略UUID">{{ detail.policyUuid }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detail.tenantName }}</common-detail-item>
        <common-detail-item label="防火墙描述">{{ detail.remark }}</common-detail-item>
      </template>
    </common-detail-right>
  </div>
</template>

<script>
import { firewallStatus, firewallColor, isTrue, adminStateupFilter } from 'filters'
import { conditionCloudVendor, getFirewallPolicy, getFirewall, removeFirewall, detailFirewall, createFirewall, modifyFirewall, removeFirewalls, firewallRouter, getFirewallRouter, getFirewallRule } from 'services/platform/index'
import add from './add.vue'
export default {
  components: { add },
  data() {
    return {
      detailFlag: false,
      detail: {},
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      tableData: [],
      total: 0,
      addData: {
        dialog: false,
        data: {}
      },
      platformObject: {},
      policyData: [],
      routeData: [],
      regionData: [],
      modifyFlag: false,
      modifyData: {
        name: '',
        policy: '',
        remark: '',
        policyId: ''
      },
      host: '',
      relevanceData: {
        routerIds: []
      },
      relevanceFlag: false
    }
  },
  methods: {
    getDetail(id) {
      detailFirewall(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detailFlag = true
        }
      })
    },
    add() {
      this.addData = {
        dialog: true,
        data: {
          vendorId: '',
          region: '',
          availablitiyZone: ''
        }
      }
    },
    goBack() {
      this.detailFlag = false
    },
    getData() {
      getFirewall(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.searchData.name,
        vendorType: 'OPENSTACK'
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
          this.modifyData.vendorType = command.row.vendorType
          break
        case 2:
          this.dialog('relevanceFlag', 3, command.row.id)
          break
        case 3:
          this.remove(command.row.id)
          break
      }
    },
    remove(id) {
      this.$confirm('此操作将永久删除该防火墙, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          removeFirewall(id).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.handleSearch()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    dialog(flag, index, id) {
      switch (index) {
        case 2:
          this.modifyData.vendorId = this.platformObject.vendorId
          const params = {
            simple: true
          }
          const searchParam = [{ param: { vendorId: this.platformObject.vendorId }, sign: 'EQ' }]
          params.params = JSON.stringify(searchParam)
          getFirewallPolicy(params).then(data => {
            this.policyData = data.data.rows
          })
          detailFirewall(id).then(data => {
            if (data.success) {
              const vmDetail = data.data
              const updateItem = ['id', 'name', 'remark', 'policyId']
              for (let i = 0; i < updateItem.length; i++) {
                const item = updateItem[i]
                this.modifyData[item] = vmDetail[item]
              }
              this.modifyData.policy = vmDetail.policyId
            }
          })
          this[flag] = true
          break
        case 3:
          this.relevanceData.vendorId = this.platformObject.vendorId
          this.relevanceData.id = id
          getFirewallRouter({
            vendorId: this.platformObject.vendorId,
            id: id
          }).then(data => {
            this.routeData = data.data.routers
            data.data.fwRouters.forEach(item => {
              this.routeData.push(item)
              this.relevanceData.routerIds.push(item.id)
            })
          })
          this[flag] = true
          break
      }
    },
    dialogOk(index, formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          switch (index) {
            case 2:
              modifyFirewall(this.modifyData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.getData()
                  this.cancel('modifyData', 'modifyFlag')
                }
              })
              break
            case 3:
              firewallRouter(this.relevanceData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.getData()
                  this.cancel('relevanceData', 'relevanceFlag')
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
      const list = ['modifyFlag', 'relevanceFlag']
      for (let i = 0; i < list.length; i++) {
        if (this[list[i]]) {
          switch (list[i]) {
            case 'modifyFlag':
              this.cancel('modifyData', 'modifyFlag')
              break
            case 'relevanceFlag':
              this.cancel('relevanceData', 'relevanceFlag')
              break
          }
        }
      }
    }
  },
  created() {},
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
