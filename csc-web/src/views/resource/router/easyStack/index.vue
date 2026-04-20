<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="add">新增</el-button>
      </el-form-item>
    </el-form>
    <div>
      <basic-table :data="routerData" :params="params" :get-list="getData" :total="total">
        <el-table-column label="路由名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="路由状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
          </template>
        </el-table-column>
        <el-table-column prop="networkName" label="外部网络" show-overflow-tooltip></el-table-column>
        <el-table-column label="管理状态" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.adminStateup | isTrue }}
          </template>
        </el-table-column>
        <el-table-column prop="vendorName" label="所属平台" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <el-button type="text" @click="dropdownClick({ row: scope.row, index: 5 })"><i class="el-icon-edit"></i> 编辑 </el-button>
            <div class="action-divider"></div>
            <el-button type="text" @click="dropdownClick({ row: scope.row, index: 6 })"><i class="el-icon-delete"></i> 删除 </el-button>
            <div class="action-divider"></div>
            <el-dropdown @command="dropdownClick">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="{ row: scope.row, index: 1 }">连接子网 </el-dropdown-item>
                <el-dropdown-item :command="{ row: scope.row, index: 2 }">断开子网 </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.networkId" :command="{ row: scope.row, index: 3 }">清除网关 </el-dropdown-item>
                <el-dropdown-item v-if="!scope.row.networkId" :command="{ row: scope.row, index: 4 }">设置网关 </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog title="编辑路由" :visible.sync="modifyFlag" width="50%" :before-close="handleClose">
      <div>
        <el-form ref="modifyData" :model="modifyData" :status-icon="true" label-width="80px">
          <basic-form-item label="路由名称" prop="name" validate="required">
            <el-input v-model="modifyData.name"></el-input>
          </basic-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('modifyData', 'modifyFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(2, 'modifyData')">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="连接子网" :visible.sync="connectFlag" width="50%" :before-close="handleClose">
      <span>
        <el-form ref="connectData" :model="connectData" :status-icon="true" label-width="120px">
          <basic-form-item label="路由名称：" prop="name" validate="required">
            <el-input v-model="connectData.name" :disabled="true"></el-input>
          </basic-form-item>
          <basic-form-item label="网络名称：" prop="networkId" validate="required">
            <el-select v-model="connectData.networkId" placeholder="请选择网络" @change="getSubnetList(connectData.networkId)">
              <el-option v-for="(item, index) in GetnetworkList" :key="index" :label="item.name" :value="item.networkId"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="子网名称：" prop="subnetId" validate="required">
            <el-select v-model="connectData.subnetId" @change="setVersion" filterable>
              <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="指定IP：" v-if="connectData.subnetId">
            <el-switch v-model="connectData.switch" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="version == 'V4' && connectData.switch && connectData.subnetId" prop="address" validate="required,ip">
            <el-input v-model="connectData.address" placeholder="1.1.1.1"></el-input>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="version == 'V6' && connectData.switch && connectData.subnetId" prop="address" validate="required,ipV6">
            <el-input v-model="connectData.address" placeholder="2222::"></el-input>
          </basic-form-item>
          <basic-form-item label="IP范围：" v-if="connectData.subnetId && connectData.switch && ippools">
            <div v-for="(item, index) in ippools" :key="index">
              {{ item }}
            </div>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('connectData', 'connectFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(3, 'connectData')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="断开子网" :visible.sync="closeFlag" width="50%" :before-close="handleClose">
      <span>
        <basic-form ref="closeData" :model="closeData" :status-icon="true" label-width="80px">
          <basic-form-item label="路由名称" prop="name" validate="required">
            <el-input v-model="closeData.name" :disabled="true"></el-input>
          </basic-form-item>
          <basic-form-item label="子网" prop="subnetId" validate="required">
            <el-select v-model="closeData.subnetId">
              <el-option v-for="item in closeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </basic-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('closeData', 'closeFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(4, 'closeData')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="设置网关" :visible.sync="setFlag" width="50%" :before-close="handleClose">
      <span>
        <el-form ref="setData" :model="setData" :status-icon="true" label-width="80px">
          <el-form-item label="外部网络">
            <el-select v-model="setData.networkId">
              <el-option v-for="item in setList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('setData', 'setFlag')">取 消</el-button>
        <el-button type="primary" @click="dialogOk(5, 'setData')">确 定</el-button>
      </span>
    </el-dialog>
    <common-detail v-if="detaildialogVisible" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="路由uuid">{{ detail.routerUuid }}</common-detail-item>
        <common-detail-item label="管理状态">{{ detail.adminStateup | adminStateupFilter }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="detail.status | openstackServerColor">{{ detail.status | openstackServer }} </status-icon>
        </common-detail-item>
        <common-detail-item label="外部网络">{{ detail.networkName }}</common-detail-item>
        <common-detail-item label="SNAT">{{ detail.enableSnat | isTrue }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="子网列表" name="second">
          <basic-table :data="networkData" :params="paramd" :get-list="getDetailHost" :total="networkTotal">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="gateway" label="网关" show-overflow-tooltip></el-table-column>
            <el-table-column prop="cidr" label="网络地址" show-overflow-tooltip></el-table-column>
            <el-table-column prop="ipVersion" label="IP版本" show-overflow-tooltip></el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <add :add-data="addData" v-if="addData.dialog" @back="getData"></add>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { openstackServerColor, openstackServer, isTrue, adminStateupFilter } from 'filters'
import { getSubnet, detailSubnet, getRouterSubnet, conditionCloudVendor, getVpc, conditionNetwork, getRouter, removeRouter, detailRouter, createRouter, modifyRouter, patchRouter, attachRouterSubents, detachRouterSubents } from 'services/platform/index'
import add from './add.vue'
export default {
  components: { add },
  mixins: [webSocket],
  data() {
    return {
      detaildialogVisible: false,
      detail: '',
      networkTotal: 0,
      networkData: [],
      title3: '延期',
      paramd: {
        page: 1,
        rows: 10
      },
      dialogFormtimeVisible: false,
      addDatatime: {},
      id: '',
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      DataRow: {},
      routerData: [],
      total: 0,
      networkList: [],
      modifyData: {
        adminStateup: true,
        name: ''
      },
      modifyFlag: false,
      connectData: {
        networkId: ''
      },
      connectFlag: false,
      GetnetworkList: [],
      subnetList: [],
      closeList: [],
      vendorList: [],
      closeData: {
        subnetId: ''
      },
      closeFlag: false,
      setData: {
        networkId: ''
      },
      setFlag: false,
      setList: [],
      networkId: '',
      ipFirst: '',
      ipSecond: '',
      ipThird: '',
      ipFourth: '',
      ipArr: [],
      Arr: [],
      version: 'V4',
      ipPools: [],
      addData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    add() {
      this.addData = {
        dialog: true,
        data: {
          name: '',
          vendorId: '',
          region: '',
          availablitiyZone: '',
          adminStateup: true
        }
      }
    },
    setVersion() {
      this.subnetList.forEach(item => {
        if (item.id == this.connectData.subnetId) {
          this.version = item.ipVersion
          this.ippools = item.ipPools ? JSON.parse(item.ipPools) : []
          this.$set(this.connectData, 'switch', false)
          this.$set(this.connectData, 'address', '')
        }
      })
    },
    goBack() {
      this.detaildialogVisible = false
    },
    getDetail(id) {
      this.id = id
      this.detaildialogVisible = true
      detailRouter(id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.getDetailHost(1)
        }
      })
    },
    handleSizeChanges(val) {
      this.paramd.rows = val
      this.getDetailHost()
    },
    getDetailHost(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([{ param: { routerId: this.id }, sign: 'EQ' }])
      getSubnet(this.paramd).then(data => {
        if (data.success) {
          this.networkData = data.data.rows
          this.networkTotal = data.data.total
        }
      })
    },
    getData() {
      getRouter(this.params).then(data => {
        if (data.success) {
          this.routerData = data.data.rows
          this.total = data.data.total
          this.routerData.forEach(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
          })
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.searchData.name,
        type: 'EASYSTACK'
      })
      this.getData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    getnetworkList(id) {
      conditionNetwork({
        condition: 'externals',
        vendorId: id
      }).then(data => {
        if (data.success) {
          this.setList = data.data
          this.$set(this.setData, 'networkId', data.data[0].id)
        }
      })
    },
    getVendorList() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'poolProviders',
          types: ['OPENSTACK', 'FUSIONCLOUD', 'TENCENT', 'HUAWEI', 'EASYSTACK']
        })
      }).then(data => {
        if (data.success) {
          this.vendorList = data.data
        }
      })
    },
    dialog(flag, index, id) {
      this[flag] = true
      switch (index) {
        case 2: // 编辑
          detailRouter(id).then(data => {
            if (data.success) {
              const vmDetail = data.data
              const updateItem = ['id', 'name', 'adminStateup']
              for (let i = 0; i < updateItem.length; i++) {
                const item = updateItem[i]
                this.modifyData[item] = vmDetail[item]
              }
            }
          })
          break
        case 3: // 链接子网
          this.connectData.id = id
          this.connectData.name = this.DataRow.name
          // 获取网络
          getVpc({
            simple: true,
            params: JSON.stringify([{ param: { vendorId: this.DataRow.vendorId }, sign: 'EQ' }])
          }).then(data => {
            if (data.success) {
              this.GetnetworkList = data.data.rows
              this.subnetList = []
            }
          })
          break
        case 4:
          this.closeData.id = id
          this.closeData.name = this.DataRow.name
          this.closeData.subnetId = this.DataRow.subnetId
          getRouterSubnet({
            condition: JSON.stringify({
              condition: 'listattachbyrouter',
              vendorId: this.DataRow.vendorId,
              routerId: id
            })
          }).then(data => {
            if (data.success) {
              this.closeList = data.data
            }
          })
          break
        case 5: // 设置网关
          this.setData.id = id
          this.getnetworkList(this.DataRow.vendorId)
          break
      }
    },
    getSubnetList(id) {
      const params = {
        page: 1,
        rows: 9999
      }
      const searchParam = [
        { param: { routerId: '' }, sign: 'NUL' },
        {
          param: {
            vendorId: this.DataRow.vendorId,
            networkId: id
          },
          sign: 'EQ'
        }
      ]
      params.params = JSON.stringify(searchParam)
      // 获取外部网络列表
      getSubnet(params).then(data => {
        if (data.success) {
          this.subnetList = data.data.rows
        }
      })
    },
    handleClose(done) {
      const list = ['modifyFlag', 'setFlag', 'connectFlag', 'coloseFlag', 'setFlag']
      for (let i = 0; i < list.length; i++) {
        if (this[list[i]]) {
          switch (list[i]) {
            case 'modifyFlag':
              this.cancel('modifyData', 'modifyFlag')
              break
            case 'connectFlag':
              this.cancel('connectData', 'connectFlag')
              break
            case 'coloseFlag':
              this.cancel('coloseData', 'coloseFlag')
              break
            case 'setFlag':
              this.cancel('setData', 'setFlag')
              break
          }
        }
      }
    },
    dialogOk(index, formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          switch (index) {
            case 2:
              modifyRouter(this.modifyData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.cancel('modifyData', 'modifyFlag')
                  this.getData()
                }
              })
              break
            case 3: // 链接子网
              attachRouterSubents(this.connectData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.getData()
                  this.cancel('connectData', 'connectFlag')
                }
              })
              break
            case 4: // 短裤子网
              detachRouterSubents(this.closeData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.getData()
                  this.cancel('closeData', 'closeFlag')
                }
              })
              break
            case 5: // 设置网关
              patchRouter('config', this.setData).then(data => {
                if (data.success) {
                  this.$message({
                    type: 'success',
                    message: data.message
                  })
                  this.cancel('setData', 'setFlag')
                  this.handleSearch()
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
    // 延迟
    timeSubmit() {
      this.$refs.addDatatime.validate(valid => {
        if (valid) {
          patchRouter('updateExpriedTime', this.addDatatime).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.dialogFormtimeVisible = false
              this.getData()
            }
          })
        }
      })
    },
    dropdownClick(command) {
      this.DataRow = command.row
      switch (command.index) {
        case 1: // 链接子网
          this.dialog('connectFlag', 3, command.row.id)
          break
        case 2: // 断开子网
          this.dialog('closeFlag', 4, command.row.id)
          break
        case 3:
          this.$confirm('此操作将清除网关, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            patchRouter('clear', { id: command.row.id }).then(data => {
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
        case 4: // 设置网络
          this.dialog('setFlag', 5, command.row.id)

          break
        case 5:
          this.dialog('modifyFlag', 2, command.row.id)
          break
        case 6:
          this.$confirm('此操作将永久删除该路由, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeRouter(command.row.id).then(data => {
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
        case 14:
          this.dialogFormtimeVisible = true
          this.addDatatime.resId = command.row.id
          this.addDatatime.vendorId = command.row.vendorId
          break
      }
    },
    selectSubnet(key, item) {
      this.ipFirst = ''
      this.ipSecond = ''
      this.ipThird = ''
      this.ipFourth = ''
      this.ipArr = []
      this.Arr = []
      let data = ''
      this.connectData.subnetId = item.id
      this.getSubnetDetail(item.id)
      this.subnetList.forEach((item, index) => {
        item.Flag = false
        item.ipFlag = false
        if (index == key) {
          item.Flag = true
          data = item
        }
      })
      this.$set(this.subnetList, key, data)
    },
    ipFlagCli(list, key) {
      this.subnetList[key].ipFlag = !list.ipFlag
      this.$set(this.subnetList, key, this.subnetList[key])
    },
    getSubnetDetail(id) {
      detailSubnet(id).then(data => {
        if (data.success) {
          this.handleCidr(data.data)
        }
      })
    },
    handleCidr(item) {
      // let arr = cidr.split('/');
      const arr = item.cidr.split('/')
      const arr1 = arr[0].split('.')
      if (arr[1] >= 8) {
        item.tag = 1
        this.ipFirst = arr1[0]
      }
      if (arr[1] >= 16) {
        item.tag = 2
        this.ipSecond = arr1[1]
      }
      if (arr[1] >= 24) {
        item.tag = 3
        this.ipThird = arr1[2]
      }
      const ipPools = item.ipPools || []
      let str = ''
      if (ipPools.length) str = ipPools.substring(1, ipPools.length - 1)
      const ipArr = str.split('"')
      this.Arr = []
      for (let i = 0; i < ipArr.length; i++) {
        if (i % 2 != 0) {
          this.Arr.push(ipArr[i])
        }
      }
      this.ipArr = []
      this.Arr.forEach((data, index) => {
        const items = data.split('-')
        this.ipArr.push(items)
      })
    },
    inputBlur(val, item) {
      const num = parseInt(val)
      if (num < 0 || num > 255) {
        item.ipflag = true
        this.$notify({
          title: '提示',
          message: item.name + '的输入有误，请输入0-255之间的数',
          type: 'error'
        })
      }
    },
    onmessage(data) {
      this.handleSearch()
    }
  },
  created() {
    this.getData()
  }
}
</script>

<style>
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
