<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="dialog('addFlag', 1)" v-if="admin"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="新增网络" :visible.sync="addFlag" width="50%" :before-close="handleClose">
      <span>
        <el-form ref="addData" :model="addData" :status-icon="true" label-width="80px">
          <basic-form-item label="平台名称" prop="vendorId" validate="required">
            <el-select v-model="addData.vendorId" placeholder="请选择平台">
              <el-option v-for="(item, index) in vendorList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="网络名称" prop="name" validate="required">
            <el-input v-model="addData.name"></el-input>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('addData', 'addFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(1, 'addData')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="编辑网络" :visible.sync="modifyFlag" width="50%" :before-close="handleClose">
      <span>
        <el-form ref="modifyData" :model="modifyData" :status-icon="true" label-width="80px">
          <basic-form-item label="网络名称" validate="required">
            <el-input v-model="modifyData.name"></el-input>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('modifyData', 'modifyFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(2, 'modifyData')">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改端口-->
    <el-dialog title="修改端口" :visible.sync="modifyPortFlag" width="50%" v-if="modifyPortFlag">
      <span>
        <el-form ref="modifyPortData" :model="modifyPortData" :status-icon="true" label-width="80px">
          <basic-form-item label="端口名称" prop="name" validate="required">
            <el-input v-model="modifyPortData.name"></el-input>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('modifyPortData', 'modifyPortFlag')">取 消</el-button>
        <el-button type="primary" @click="modifyPortSave">确 定</el-button>
      </span>
    </el-dialog>
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="detail" @goBack="goBack">
      <el-tabs value="second">
        <el-tab-pane label="子网列表" name="second">
          <basic-table :data="childrenData" :params="paramd" :get-list="getDetailHost" :total="childrenDataTotal">
            <el-table-column prop="name" label="名称" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="gateway" label="网关" show-overflow-tooltip></el-table-column>
            <el-table-column prop="cidr" label="网络地址" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ipVersion" label="IP版本" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" :disabled="detail.isRouterExternal" @click="subnetModify(scope.row)"><i class="el-icon-edit"></i> 编辑 </el-button>
                <div class="action-divider"></div>
                <el-button type="text" :disabled="detail.isRouterExternal" @click="subnetRemove(scope.row.id, 1)"><i class="el-icon-delete"></i> 删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="端口列表" name="port">
          <basic-table :data="portListData" :params="paramd2" :get-list="getPortList" :total="portListDataTotal">
            <el-table-column prop="name" label="名称" show-overflow-tooltip> </el-table-column>
            <el-table-column label="状态" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | portStatus('status') }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column label="固定IP" show-overflow-tooltip>
              <template slot-scope="scope">
                <div v-for="(item, index) in scope.row.portFixedIps" :key="index">{{ item.ipAddress }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="deviceOwner||'分离'" label="连接设备" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.deviceOwner ? scope.row.deviceOwner : '分离' }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" :disabled="detail.isRouterExternal" @click="portModify(scope.row)"><i class="el-icon-edit"></i> 编辑 </el-button>
                <div class="action-divider"></div>
                <el-button type="text" :disabled="detail.isRouterExternal" @click="subnetRemove(scope.row.id, 2)"><i class="el-icon-delete"></i> 删除 </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <basic-table :data="networkData" :params="params" :get-list="getData" :total="total">
      <el-table-column label="网络名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="网络类型" show-overflow-tooltip></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip></el-table-column>
      <el-table-column label="所属平台" prop="vendorName" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" @click="dropdownClick({ index: 3, id: scope.row.id })"><i class="el-icon-edit"></i> 编辑 </el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="dropdownClick({ index: 4, id: scope.row.id })"><i class="el-icon-delete"></i> 删除 </el-button>
          <div class="action-divider"></div>
          <el-dropdown @command="dropdownClick">
            <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :disabled="scope.row.isRouterExternal" :command="{ id: scope.row.id, index: 1, uuid: scope.row.networkUuid }">创建子网 </el-dropdown-item>
              <el-dropdown-item :disabled="!scope.row.subnetNum || scope.row.isRouterExternal" :command="{ row: scope.row, index: 2 }">创建端口 </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </basic-table>
    <add-subnet v-if="addSubnetData.dialog" :add-data="addSubnetData" @back="getDetailHost"></add-subnet>
    <add-port v-if="addPortData.dialog" :add-data="addPortData" @back="getDetailHost"></add-port>
  </el-card>
</template>

<script>
import { openstackServerColor, openstackServer, portStatus, adminStateupFilter, isTrue, booleanFilter } from 'filters'
import { getSubnet, detailSubnet, removeSubnet, modifySubnet, createSubnet, conditionCloudVendor, getNetwork, removeNetwork, detailNetwork, modifyNetwork, createNetwork, getPort, removePort, modifyPort, createPort } from 'services/platform/index'
import addSubnet from './addSubnet.vue'
import addPort from './addPort.vue'
const detailSetting = {
  type: 'network',
  columns: [
    [
      { name: '网络名称', value: 'name' },
      { name: '网络UUID', value: 'networkUuid' },
      { name: '状态', value: 'status', filter: openstackServer, icon: openstackServerColor }
    ],
    [
      { name: '网络类型', value: 'type' },
      { name: '物理网络', value: 'phyNetwork' },
      { name: '段ID', value: 'segmentationId' }
    ],
    [
      { name: '管理状态', value: 'adminStateup', filter: adminStateupFilter },
      { name: '云平台', value: 'vendorName' },
      { name: '是否共享', value: 'shared', filter: booleanFilter }
    ],
    [
      { name: '是否外部网络', value: 'isRouterExternal', filter: booleanFilter },
      { name: '授权租户', value: 'tenantName' }
    ]
  ]
}

export default {
  components: { addSubnet, addPort },
  data() {
    return {
      ruleDetailTotal: 0,
      detailFlag: false,
      detailSetting,
      detail: {},
      paramd: {
        page: 1,
        rows: 10
      },
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      networkData: [],
      total: 0,
      addFlag: false,
      addData: {
        name: ''
      },
      modifyData: {
        name: ''
      },
      modifyFlag: false,
      isPhyNetwork: false,
      isSementationId: false,
      vendorList: [],
      networkId: '',
      uuid: '',
      platformObject: {},
      childrenData: [],
      childrenDataTotal: 0,
      // 端口
      portListData: null,
      portListDataTotal: null,
      paramd2: {
        page: 1,
        rows: 10
      },
      modifyPortFlag: false,
      modifyPortData: null,
      admin: false,
      addSubnetData: {
        dialog: false,
        data: {}
      },
      addPortData: {
        dialog: false,
        data: {}
      }
    }
  },
  filters: {
    portStatus(status) {
      const statusMap = {
        RUNNING: '已连接',
        STOPPED: '分离',
        EXCEPTION: '异常'
      }
      return statusMap[status]
    }
  },
  methods: {
    getDetail(id) {
      detailNetwork(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.getDetailHost()
          this.getPortList()
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    handleSizeChanges(val) {
      this.paramd.rows = val
      this.getDetailHost()
    },
    // 获取子网列表
    getDetailHost(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: { vendorId: this.detail.vendorId, networkId: this.detail.id },
          sign: 'EQ'
        }
      ])
      getSubnet(this.paramd).then(data => {
        if (data.success) {
          this.childrenData = data.data.rows
          this.childrenDataTotal = data.data.total
        }
      })
    },
    getVendorList() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'poolProviders',
          types: ['OPENSTACK', 'FUSIONCLOUD', 'EASYSTACK']
        })
      }).then(data => {
        if (data.success) {
          this.vendorList = data.data
        }
      })
    },
    getData() {
      getNetwork(this.params).then(data => {
        if (data.success) {
          this.networkData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
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
    dialog(flag, index, id, uuid) {
      switch (index) {
        case 1:
          this.getVendorList()
          this[flag] = true
          break
        case 2:
          detailNetwork(id).then(data => {
            if (data.success) {
              this.modifyData = data.data
              this[flag] = true
            }
          })
          break
      }
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
          }
        }
      }
    },
    dialogOk(index, formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          switch (index) {
            case 1:
              createNetwork(this.addData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.getData()
                  this.cancel('addData', 'addFlag')
                }
              })
              break
            case 2:
              modifyNetwork(this.modifyData).then(data => {
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
          this.addSubnetData = {
            dialog: true,
            title: '新增子网',
            data: {
              name: '',
              hostRoute: '',
              ipVersion: 'V4',
              dnsName: '',
              ipPool: '',
              gateway: '',
              dhcpEnabled: true,
              cidr: '',
              networkId: command.id,
              networkUuid: command.uuid
            }
          }
          break
        case 2:
          this.addPortData = {
            dialog: true,
            data: {
              networkId: command.row.id,
              vendorId: command.row.vendorId
            }
          }
          break
        case 3:
          this.dialog('modifyFlag', 2, command.id)
          break
        case 4:
          this.$confirm('此操作将永久删除该网络, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeNetwork(command.id).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.getData()
              }
            })
          })
          break
      }
    },
    // 修改子网
    subnetModify(row) {
      detailSubnet(row.id).then(data => {
        if (data.success) {
          this.addSubnetData = {
            dialog: true,
            title: '编辑子网',
            url: 'modify',
            data: data.data
          }
          const callBack = function (data) {
            if (!data) return ''
            let str
            const list = JSON.parse(data)
            if (list.length > 1) str = list.join('\n')
            else str = list.join()
            return str
          }
          this.$set(this.addSubnetData.data, 'ipPool', callBack(this.addSubnetData.data.ipPools))
          this.$set(this.addSubnetData.data, 'dnsName', callBack(this.addSubnetData.data.dnsNames))
          this.$set(this.addSubnetData.data, 'hostRoute', callBack(this.addSubnetData.data.hostRoutes))
        }
      })
    },
    // 删除子网/端口
    subnetRemove(id, flag) {
      let tip, url
      switch (flag) {
        case 1:
          tip = '您是否确认删除该子网？'
          break
        case 2:
          tip = '您是否确认删除该端口？'
          break
      }
      this.$confirm(tip, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        if (flag === 1) {
          removeSubnet(id).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getDetailHost()
            }
          })
        } else {
          removePort(id).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getPortList()
            }
          })
        }
      })
    },
    // 端口列表
    getPortList() {
      this.paramd2.params = JSON.stringify([{ param: { networkId: this.detail.id }, sign: 'EQ' }])
      getPort(this.paramd2).then(data => {
        if (data.success) {
          this.portListData = data.data.rows
          this.portListDataTotal = data.data.total
        }
      })
    },
    // 修改端口
    portModify(row) {
      this.modifyPortData = Object.assign({}, row)
      this.modifyPortFlag = true
    },
    modifyPortSave() {
      const param = {
        vendorId: this.modifyPortData.vendorId,
        name: this.modifyPortData.name,
        id: this.modifyPortData.id
      }
      modifyPort(param).then(data => {
        if (data.success) {
          this.$message.success({
            message: data.message,
            type: 'success'
          })
          this.modifyPortFlag = false
          this.getPortList()
        }
      })
    }
  },
  created() {
    this.getData()
    const data = JSON.parse(localStorage.getItem('userData'))
    if (data.admin) this.admin = true
  },
  mounted() {},
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 10px;
}

.btn-checkbox:hover {
  background-color: #5ac1f5;
  color: #fff;
}

.btn {
  border: 1px solid #5ac1f5;
  color: #5ac1f5;
  margin-bottom: 5px;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-ok {
  background: #5ac1f5 !important;
  color: #fff !important;
}

.ip-input {
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
</style>
