<template>
  <div>
    <el-tabs value="second">
      <el-tab-pane label="子网列表" name="second">
        <el-form :inline="true" class="m-b-sm">
          <el-button type="primary" @click="addSubnet">
            <Icon type="icon-add"></Icon>
            新增
          </el-button>
          <el-button class="redBtn" @click="childrenHandleDelete" :disabled="childrenSelectList.length == 0">
            <Icon type="icon-delete"></Icon>
            删除
          </el-button>
        </el-form>
        <basic-table :data="childrenData" :params="paramd" :get-list="getSubnet" :total="childrenDataTotal" ref="childrenMultipleTable" @select="childrenHandleSelectItem" @select-all="childrenHandleSelectAll">
          <el-table-column type="selection"> </el-table-column>
          <el-table-column prop="name" label="名称"> </el-table-column>
          <el-table-column prop="gateway" label="网关"></el-table-column>
          <el-table-column prop="cidr" label="网络地址"></el-table-column>
          <el-table-column prop="ipVersion" label="IP版本"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="subnetModify(scope.row)"> <i class="el-icon-edit"></i> 编辑 </el-button>
              <div class="action-divider"></div>
              <el-button type="text" @click="subnetRemove(scope.row.id, 1)"> <i class="el-icon-delete"></i> 删除 </el-button>
            </template>
          </el-table-column>
        </basic-table>
      </el-tab-pane>
    </el-tabs>
    <add-subnet @back="getSubnet" :add-data="addSubnetData" v-if="addSubnetData.dialog"></add-subnet>
  </div>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import addSubnet from './addSubnet.vue'
import { removePort, removePorts, getPort, getSubnet, createSubnet, removeSubnet, detailSubnet, removeSubnets, getNetwork, removeNetwork, detailNetwork, removeNetworks } from 'services/platform/index'
export default {
  components: {
    addSubnet
  },
  mixins: [webSocket],
  props: {
    detail: {
      type: Object,
      default: function () {
        return {
          vendorId: -1
        }
      }
    }
  },
  data() {
    return {
      paramd: {
        page: 1,
        rows: 10
      },
      params: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        tenantUuid: ''
      },
      networkData: [],
      total: 0,
      addData: {
        dialog: false,
        data: {
          name: '',
          type: 'VLAN',
          adminStateup: true,
          isRouterExternal: false,
          shared: false,
          phyNetwork: '',
          segmentationId: ''
        }
      },
      modifyData: {
        dialog: false,
        data: {
          adminStateup: false,
          name: '',
          shared: true
        }
      },
      addPortData: {
        dialog: false,
        data: {
          name: '',
          balancer: {
            networkId: ''
          }
        }
      },
      childrenData: [],
      childrenDataTotal: 0,
      id: '',
      // 端口
      portListData: null,
      portListDataTotal: null,
      paramd2: {
        page: 1,
        rows: 10
      },
      idList: [],
      selectList: [],
      childrenIdList: [],
      childrenSelectList: [],
      portIdList: [],
      portSelectList: [],
      tenantObj: {
        dialog: false,
        data: {}
      },
      modifyPortData: {
        dialog: false,
        data: {}
      },
      addSubnetData: {
        dialog: false,
        url: '',
        title: '',
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
    onmessage(data) {
      if (data.operate.indexOf('subnet') > -1) {
        this.getSubnet()
      }
    },
    childrenRefreshId() {
      this.childrenIdList = []
      this.childrenSelectList.forEach(item => {
        this.childrenIdList.push(item.id)
      })
    },
    // 单选
    childrenHandleSelectItem(selection, row) {
      this.childrenRefreshId()
      if (this.childrenIdList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.childrenSelectList.length; j++) {
          const item = this.childrenSelectList[j]
          if (item.id == row.id) {
            this.childrenSelectList.splice(j, 1)
            break
          }
        }
      } else {
        this.childrenSelectList.push(row)
      }
    },
    // 全选
    childrenHandleSelectAll(selection) {
      this.childrenRefreshId()
      if (selection.length) {
        // 全选情况下
        this.childrenData.forEach(item => {
          if (this.childrenIdList.indexOf(item.id) == -1) {
            this.childrenSelectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.childrenData.forEach(item => {
          if (this.childrenIdList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.childrenSelectList.length; j++) {
              const row = this.childrenSelectList[j]
              if (item.id == row.id) {
                this.childrenSelectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    portRefreshId() {
      this.portIdList = []
      this.portSelectList.forEach(item => {
        this.portIdList.push(item.id)
      })
    },
    // 单选
    portHandleSelectItem(selection, row) {
      this.portRefreshId()
      if (this.portIdList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.portSelectList.length; j++) {
          const item = this.portSelectList[j]
          if (item.id == row.id) {
            this.portSelectList.splice(j, 1)
            break
          }
        }
      } else {
        this.portSelectList.push(row)
      }
    },
    // 全选
    portHandleSelectAll(selection) {
      this.portRefreshId()
      if (selection.length) {
        // 全选情况下
        this.portListData.forEach(item => {
          if (this.portIdList.indexOf(item.id) == -1) {
            this.portSelectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.portListData.forEach(item => {
          if (this.portIdList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.portSelectList.length; j++) {
              const row = this.portSelectList[j]
              if (item.id == row.id) {
                this.portSelectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    // 获取子网列表
    getSubnet(page) {
      this.paramd.page = page || this.paramd.page
      this.paramd.params = JSON.stringify([
        {
          param: {
            vpcId: this.detail.id,
            vendorId: this.detail.vendorId
          },
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
    childrenHandleDelete() {
      this.childrenRefreshId()
      this.$confirm('此操作将删除所选子网, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeSubnets(this.childrenIdList).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getSubnet()
            this.childrenSelectList = []
          }
        })
      })
    },
    portHandleDelete() {
      this.portRefreshId()
      if (this.portIdList.length == 0) return this.$message.error('请选择端口')
      this.$confirm('此操作将删除所选端口, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removePorts(this.portIdList).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getPort()
            this.portSelectList = []
          }
        })
      })
    },
    addSubnet() {
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
          vpcId: this.detail.id,
          networkUuid: this.detail.uuid,
          routerId: this.detail.routerId,
          vendorId: this.detail.vendorId
        }
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
      })
        .then(() => {
          if (flag === 1) {
            removeSubnet(id).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.getSubnet()
              }
            })
          } else {
            removePort(id).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.getPort()
              }
            })
          }
        })
        .catch(() => {})
    },
    // 端口列表
    getPort(page) {
      this.paramd2.page = page || this.paramd.page
      this.paramd2.params = JSON.stringify([
        {
          param: {
            networkId: this.detail.networkId,
            vendorId: this.detail.vendorId
          },
          sign: 'EQ'
        }
      ])
      getPort(this.paramd2).then(data => {
        if (data.success) {
          this.portListData = data.data.rows
          this.portListDataTotal = data.data.total
        }
      })
    },
    // 修改端口
    portModify(row) {
      this.modifyPortData = {
        dialog: true,
        data: Object.assign({}, row)
      }
    }
  },
  created() {
    this.getSubnet()
    this.getPort()
  }
}
</script>

<style scoped>
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
