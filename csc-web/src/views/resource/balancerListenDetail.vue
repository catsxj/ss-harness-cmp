<template>
  <div class="wrapper-container">
    <el-dialog title="新增成员" :visible.sync="addFlag" width="80%" :before-close="close">
      <el-row>
        <el-col :span="24">
          已分配成员列表
          <el-table :data="usedTableData" style="width: 100%">
            <el-table-column label="ip地址" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-select :disabled="scope.row.flag" v-model="scope.row.address">
                  <el-option v-for="row1 in scope.row.Ips" :key="row1.value" :label="row1.address" :value="row1.address"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="subnetName" label="子网" show-overflow-tooltip></el-table-column>
            <el-table-column label="端口" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-input-number :disabled="scope.row.flag" :controls="false" v-model="scope.row.port" :min="1" :max="65535" label="端口"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="权重" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-input-number :disabled="scope.row.flag" :controls="false" v-model="scope.row.weight" :min="0" :max="256" label="权重"></el-input-number>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="操作" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-button type="danger" @click="networkRemove(scope.row.id, scope.row.flag)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
        <el-col :span="24">
          可用的云主机
          <el-table :data="usableTableData" style="width: 100%">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column label="IP地址" show-overflow-tooltip>
              <template slot-scope="scope">
                <div v-for="row1 in scope.row.Ips" :key="row1.address">{{ row1.address }}({{ row1.subnetName }})</div>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button :disabled="scope.row.flag" type="danger" @click="networkAdd(scope.row.id)">添加</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination @size-change="handleSizeChangeS" @current-change="getHostData" :current-page.sync="paramd.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="paramd.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
          </div>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="ok">确定</el-button>
        <!--<el-button @click="cancel('bandData','bandFlag')">取 消</el-button>-->
      </span>
    </el-dialog>
    <el-dialog title="编辑权重" :visible.sync="weightFlag" width="30%" v-if="weightFlag">
      <span>
        <el-input-number style="width: 100%" v-model="weight" :min="0" :max="256"></el-input-number>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="weightFlag = falsef">取 消</el-button>
        <el-button type="primary" @click="dialogOk">确定</el-button>
      </span>
    </el-dialog>
    <el-row>
      <el-col :span="24" class="m-b-lg">
        <el-card>
          <div class="panel-heading">
            <div class="pull-left">负载均衡详情</div>
            <div class="pull-right">
              <el-button type="ghost" @click="goBack">返回</el-button>
            </div>
            <div style="clear: both"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card>
          <div>基本信息</div>
          <div style="padding: 5px">
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">UuiD：</el-col>
              <el-col :span="14">{{ listennerDetail.listenerUuid }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">名称：</el-col>
              <el-col :span="14">{{ listennerDetail.name }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">协议：</el-col>
              <el-col :span="14">{{ listennerDetail.protocol }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">端口：</el-col>
              <el-col :span="14">{{ listennerDetail.port }}</el-col>
            </el-col>
          </div>
          <div style="clear: both"></div>
          <div>属性</div>
          <div style="padding: 5px">
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">负载均衡方法：</el-col>
              <el-col :span="14">{{ listennerDetail.pool.lbMethod }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">会话保持：</el-col>
              <el-col :span="14">{{ listennerDetail.pool.type | balancerFilter }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs" v-if="listennerDetail.pool.type == 'APP_COOKIE'">
              <el-col :span="10">App Cookie名称：</el-col>
              <el-col :span="14">{{ listennerDetail.pool.cookieName }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">健康检查类型：</el-col>
              <el-col :span="14">{{ listennerDetail.monitor.type }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">检查间隔(秒)：</el-col>
              <el-col :span="14">{{ listennerDetail.monitor.timeout }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">检查超时时间(秒)：</el-col>
              <el-col :span="14">{{ listennerDetail.monitor.delay }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">检查最大尝试数：</el-col>
              <el-col :span="14">{{ listennerDetail.monitor.maxRetries }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs" v-if="listennerDetail.monitor.type == 'HTTP'">
              <el-col :span="10">HTTP方法：</el-col>
              <el-col :span="14">{{ listennerDetail.monitor.httpMethod }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs" v-if="listennerDetail.monitor.type == 'HTTP'">
              <el-col :span="10">URL路径：</el-col>
              <el-col :span="14">{{ listennerDetail.monitor.urlPath }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs" v-if="listennerDetail.monitor.type == 'HTTP'">
              <el-col :span="10">期望的状态码：</el-col>
              <el-col :span="14">{{ listennerDetail.monitor.expectedCodes }}</el-col>
            </el-col>
          </div>
        </el-card>
      </el-col>
      <el-col :span="14" :offset="1">
        <el-card>
          <div slot="header">成员</div>
          <div class="search-content no-searchBox">
            <el-col :span="6">
              <el-input class="search-item" placeholder="IP地址" v-model="searchData.name"> </el-input>
            </el-col>
            <el-button style="margin-left: 10px" type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button type="primary" @click="add">添加/移除成员</el-button>
          </div>
          <div class="table-container m-t-xs">
            <el-table :data="balancerData" stripe border fit style="width: 100%">
              <el-table-column label="名称" prop="name"> </el-table-column>
              <el-table-column prop="port" label="端口"></el-table-column>
              <el-table-column prop="weight" label="权重"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="text" icon="el-icon-edit" @click="modify(scope.row.id, scope.row.weight)">编辑权重 </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-container">
              <el-pagination @size-change="handleSizeChange" @current-change="getData" :current-page.sync="params.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="params.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { balancerFilter } from 'filters'
import { detailLbListen, getLbListenUser, modifyLbListenUser, manageLbListenUser, getVm } from 'services/platform/index'
export default {
  mixins: [webSocket],
  data() {
    return {
      weightFlag: false,
      id: this.$router.currentRoute.params.id,
      subnetId: this.$router.currentRoute.params.subnetId,
      addFlag: false,
      params: {
        page: 1,
        rows: 10
      },
      paramd: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: ''
      },
      total: 0,
      usedTableData: [],
      usableTableData: [],
      listennerDetail: {
        pool: {},
        monitor: {}
      },
      balancerData: [],
      poolId: '',
      weight: 0,
      weightId: 0,
      vendorId: ''
    }
  },
  methods: {
    goBack() {
      this.$router.back(-1)
    },
    // 获取监听器详情
    getLbDetail() {
      detailLbListen(this.id).then(data => {
        this.listennerDetail = data.data
        this.poolId = this.listennerDetail.pool.id
        this.vendorId = data.data.vendorId
      })
    },
    ok() {
      const object = {
        vendorId: this.vendorId,
        poolId: this.poolId,
        ADD: [],
        DEL: this.createData.DEL
      }
      let flag = false
      this.usedTableData.forEach((data, index) => {
        if (data.flag) {
        } else {
          data.Ips.forEach(function (item) {
            if (item.address == data.member.address) {
              data.member.subnetId = item.subnetId
              data.member.subnetUuid = item.subnetUuid
            }
          })
          data.member.port = data.port
          data.member.weight = data.weight
          if (!data.port || !data.weight) flag = true
          object.ADD.push(data.member)
        }
      })
      if (flag) return this.$message.error('请填写端口和权重')
      manageLbListenUser(object).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.close()
        }
      })
    },
    networkAdd(id) {
      this.usableTableData.forEach((data, index) => {
        if (data.id == id) {
          this.usableTableData.splice(index, 1)
          data.member = {}
          data.member.weight = 1
          data.member.address = data.Ips[0].address
          data.subnetName = data.Ips[0].subnetName
          this.usedTableData.push(data)
        }
      })
    },
    networkRemove(id, flag) {
      this.usedTableData.forEach((data, index) => {
        if (data.id == id) {
          if (data.flag) {
            this.usedTableData.splice(index, 1)
            this.createData.DEL.push(data)
          } else {
            this.usedTableData.splice(index, 1)
            this.usableTableData.push(data)
          }
        }
      })
    },
    close() {
      this.addFlag = false
      this.handleSearch()
    },
    add() {
      this.createData = {
        poolId: this.poolId,
        vendorId: this.openstackId,
        ADD: [],
        DEL: []
      }
      this.usedTableData = []
      this.usableTableData = []
      this.addFlag = true
      this.getHostData(1)
      getLbListenUser({
        page: 1,
        rows: 10,
        params: JSON.stringify([{ param: { listenerId: this.id }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.usedTableData = data.data.rows
          this.usedTableData.forEach(data2 => {
            data2.flag = true
            data2.Ips = []
            if (data2.privateIps != null) {
              const privateIps = JSON.parse(data2.privateIps)
              privateIps.forEach(function (data3, index) {
                data3.addresses.forEach((data4, index) => {
                  data2.Ips.push(data4)
                })
              })
            }
          })
        }
      })
    },
    // 选择成员分页
    handleSizeChangeS(val) {
      this.paramd.rows = val
      this.getHostData()
    },
    getHostData(page) {
      this.paramd.page = page || this.paramd.page
      const params = {
        page: this.paramd.page,
        rows: this.paramd.rows
      }
      const searchParam = [
        {
          param: { vendorId: this.openstackId, isRecycle: 0, subnetId: this.subnetId },
          sign: 'EQ'
        }
      ]
      params.params = JSON.stringify(searchParam)
      getVm(params).then(data => {
        if (data.success) {
          this.usableTableData = data.data.rows
          const idList = []
          const that = this
          this.usedTableData.forEach(item => {
            idList.push(item.id)
          })
          for (let i = that.usableTableData.length - 1; i >= 0; i--) {
            if (idList.indexOf(that.usableTableData[i].id) != -1) {
              that.usableTableData.splice(i, 1)
            }
          }
          this.usableTableData.forEach((data2, index) => {
            data2.Ips = []
            data2.flag = false
            if (data2.privateIps) {
              const privateIps = JSON.parse(data2.privateIps)
              privateIps.forEach(function (data3, index) {
                data3.addresses.forEach((data4, index) => {
                  data4.networkName = data3.networkName
                  data2.Ips.push(data4)
                })
              })
            }
            if (data2.Ips.length == 0) {
              data.flag = true
            }
          })
          this.total = data.data.total
        }
      })
    },
    // 获取成员列表
    getData() {
      getLbListenUser(this.params).then(data => {
        if (data.success) {
          this.balancerData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        listenerId: this.id,
        'address:LK': this.searchData.name
      })
      this.getData()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getData()
    },
    cancel(formName, flag) {
      this[flag] = false
      this.$refs[formName].resetFields()
    },
    // 编辑权重
    modify(id, weight) {
      this.weightFlag = true
      this.weight = weight
      this.weightId = id
    },
    dialogOk() {
      modifyLbListenUser({
        id: this.weightId,
        weight: this.weight
      }).then(data => {
        if (data.success) {
          this.$message.success(data.message)
          this.weightFlag = false
          this.handleSearch()
        }
      })
    },
    onmessage(data) {
      if (data.operate === 'openstack.member') {
        this.handleSearch()
      }
    }
  },
  created() {
    this.getLbDetail()
    this.handleSearch()
  }
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
