<template>
  <div class="wrapper-container">
    <el-dialog title="新增监听器" :visible.sync="addFlag" width="80%" :before-close="close">
      <div>
        <el-steps :active="active" finish-status="success" class="m-b-lg">
          <el-step title="监听器"></el-step>
          <el-step title="成员"></el-step>
        </el-steps>
        <el-form v-show="active == 0" ref="listener" :model="createData.listener" label-width="180px">
          <basic-form-item label="监听器名称" prop="name" validate="required" required-message="请输入名称">
            <el-input v-model="createData.listener.name"></el-input>
          </basic-form-item>
          <basic-form-item label="监听器协议" prop="protocol" validate="required" required-message="请选择协议">
            <el-select v-model="createData.listener.protocol">
              <el-option label="HTTP" value="HTTP"></el-option>
              <el-option label="HTTPS" value="HTTPS"></el-option>
              <el-option label="TCP" value="TCP"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="监听器端口" prop="port" validate="required" required-message="请输入端口">
            <el-input-number v-model="createData.listener.port" :min="1" :max="65535" style="width: 100%"></el-input-number>
          </basic-form-item>
          <el-form-item label="负载均衡方法" required>
            <el-select v-model="createData.pool.lbMethod">
              <el-option v-for="item in lbMethods" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="健康检查类型" required>
            <el-select v-model="createData.monitor.type">
              <el-option v-for="item in monitortypes" :key="item" :value="item" :label="item"></el-option>
            </el-select>
          </el-form-item>
          <div v-if="expertFlag">
            <el-form-item label="会话保持">
              <el-switch v-model="isOn" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
            </el-form-item>
            <el-form-item label="会话保持类型" v-if="isOn">
              <el-select v-model="createData.pool.type">
                <el-option v-for="item in pooltypes" :label="item.name" :value="item.value" :key="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="App.cookie" v-if="createData.pool.type == 'APP_COOKIE'">
              <el-input v-model="createData.pool.cookieName"></el-input>
            </el-form-item>
            <el-form-item label="健康检查间隔时间（秒）">
              <el-input v-model="createData.monitor.timeout"></el-input>
            </el-form-item>
            <el-form-item label="健康检查超时时间（秒）">
              <el-input v-model="createData.monitor.delay"></el-input>
            </el-form-item>
            <el-form-item label="健康检查最大尝试次数">
              <el-input v-model="createData.monitor.maxRetries"></el-input>
            </el-form-item>
            <el-form-item label="HTTP方法" v-if="createData.monitor.type == 'HTTP'">
              <el-select v-model="createData.monitor.httpMethod">
                <el-option v-for="item in monitorHttpMethod" :label="item" :value="item" :key="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="URL路径" v-if="createData.monitor.type == 'HTTP'">
              <el-input v-model="createData.monitor.urlPath"></el-input>
            </el-form-item>
            <el-form-item label="期望的状态码" v-if="createData.monitor.type == 'HTTP'">
              <el-input v-model="createData.monitor.expectedCodes"></el-input>
            </el-form-item>
          </div>
          <div class="text-center">
            <span @click="expert">{{ name }}</span>
          </div>
        </el-form>
        <div v-show="active == 1">
          <el-row>
            <el-col :span="24">
              已分配成员列表
              <el-table :data="usedTableData" style="width: 100%">
                <el-table-column label="ip地址" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.member.address">
                      <el-option v-for="row1 in scope.row.Ips" :key="row1.value" :label="row1.address" :value="row1.address"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column prop="subnetName" label="子网" show-overflow-tooltip></el-table-column>
                <el-table-column label="端口" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-input-number :disabled="scope.row.flag" :controls="false" v-model="scope.row.member.port" :min="1" :max="65535" label="端口"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column prop="address" label="权重" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <el-input-number :disabled="scope.row.flag" :controls="false" v-model="scope.row.member.weight" :min="0" :max="256" label="权重"></el-input-number>
                  </template>
                </el-table-column>
                <el-table-column prop="address" label="操作">
                  <template slot-scope="scope">
                    <el-button type="danger" @click="networkRemove(scope.row.id)">移除</el-button>
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
                <el-table-column prop="address" label="操作">
                  <template slot-scope="scope">
                    <el-button :disabled="scope.row.Ips.length == 0" type="danger" @click="networkAdd(scope.row.id)"> 添加 </el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination @size-change="handleSizeChangeS" @current-change="getHostData" :current-page.sync="paramd.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="paramd.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="active > 0" @click="next(2)">上一步</el-button>
        <el-button type="primary" v-if="active < 1" @click="next(1)">下一步</el-button>
        <el-button type="primary" v-if="active > 0" @click="ok">确定</el-button>
      </span>
    </el-dialog>
    <el-row>
      <el-col :span="24" class="m-b-md">
        <el-card>
          <div class="pull-left">负载均衡详情</div>
          <div class="pull-right">
            <el-button type="primary" @click="goBack">返回</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="9">
        <el-card>
          <div slot="header">基本信息</div>
          <div>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">UuiD：</el-col>
              <el-col :span="14">{{ lbDetail.lbUuid }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">名称：</el-col>
              <el-col :span="14">{{ lbDetail.name }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">状态：</el-col>
              <el-col :span="14">{{ lbDetail.provisioningStatus | openstackServer }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">虚拟IP：</el-col>
              <el-col :span="14">{{ lbDetail.vipAddress }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">端口ID：</el-col>
              <el-col :span="14">{{ lbDetail.vipPortUuid }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">子网ID：</el-col>
              <el-col :span="14">{{ lbDetail.subnetUuid }}</el-col>
            </el-col>
            <el-col :span="24" class="m-b-xs">
              <el-col :span="10">浮动IP：</el-col>
              <el-col :span="14">{{ lbDetail.floatingIpAddress }}</el-col>
            </el-col>
          </div>
        </el-card>
      </el-col>
      <el-col :span="14" :offset="1">
        <el-card>
          <div slot="header">监听器</div>
          <div class="search-content no-searchBox">
            <el-col :span="6">
              <el-input placeholder="名称" v-model="searchData.name"> </el-input>
            </el-col>
            <el-button class="m-l-sm" type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button type="primary" @click="add"> 新增 </el-button>
          </div>
          <basic-table :data="balancerData" :params="params" :get-list="getData" :total="total">
            <el-table-column label="名称">
              <template slot-scope="scope">
                <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="protocol" label="协议"></el-table-column>
            <el-table-column prop="port" label="端口"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="remove(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { openstackServer } from 'filters'
import { getVm, detailLb, getLbListen, removeLbListen, removeLbListens, createLbListen } from 'services/platform/index'
export default {
  mixins: [webSocket],
  data() {
    return {
      id: this.$route.params.id,
      name: '显示高级选项',
      expertFlag: false,
      isOn: false,
      active: 0,
      addFlag: false,
      bandFlag: false,
      bandData: {
        id: ''
      },
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
      balancerData: [],
      total: 0,
      floatIPList: [],
      createData: {
        listener: {
          name: '',
          protocol: '',
          port: ''
        },
        pool: {
          lbMethod: ''
        },
        monitor: {
          type: ''
        },
        members: []
      },
      subnetList: [],
      lbMethods: [
        { name: '轮询', value: 'ROUND_ROBIN' },
        { name: '最少连接', value: 'LEAST_CONNECTIONS' },
        { name: '源IP', value: 'SOURCE_IP' }
      ],
      monitortypes: ['PING', 'TCP', 'HTTP'],
      monitorHttpMethod: ['GET', 'HEAD'],
      usedTableData: [],
      usableTableData: [],
      pooltypes: [
        { name: 'App Cookie', value: 'APP_COOKIE' },
        { name: 'Http Cookie', value: 'HTTP_COOKIE' },
        { name: '源IP', value: 'SOURCE_IP' }
      ],
      lbDetail: {
        name: '',
        lbUuid: '',
        provisioningStatus: '',
        vipAddress: '',
        vipPortUuid: '',
        subnetUuid: '',
        floatingIpAddress: ''
      },
      vendorId: '',
      tenantId: false
    }
  },
  methods: {
    goBack() {
      this.$router.back(-1)
    },
    getDetail(id) {
      this.$router.push({ name: 'balancer_listen_detail', params: { id: id, subnetId: this.subnetId } })
    },
    getLbDetail() {
      detailLb(this.id).then(data => {
        this.lbDetail = data.data
        this.vendorId = this.lbDetail.vendorId
        this.subnetId = this.lbDetail.subnetId
        if (this.lbDetail.tenantId) {
          this.tenantId = true
        } else this.tenantId = false
      })
    },
    expert() {
      this.expertFlag = !this.expertFlag
      if (this.expertFlag) {
        this.name = '隐藏高级选项'
      } else this.name = '显示高级选项'
    },
    inputBlur(val, item) {
      const num = parseInt(val)
      if (num < 0 || num > 255) {
        item.ipflag = true
        const h = this.$createElement
        this.$notify({
          title: '提示',
          message: h('i', { style: 'color: danger' }, item.name + '的输入有误，请输入0-255之间的数')
        })
      }
    },
    selectSubnet(key, item) {
      let data = ''
      this.createData.balancer.subnetId = item.id
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
    next(index) {
      switch (index) {
        case 1:
          const name = 'listener'
          this.$refs[name].validate(valid => {
            if (valid) {
              if (this.active++ > 1) this.active = 1
            } else {
              return false
            }
          })
          break
        case 2:
          if (this.active-- < 0) this.active = 0
          break
      }
    },
    ok() {
      this.createData.pool.protocol = this.createData.listener.protocol
      this.createData.listener.vendorId = this.vendorId
      this.createData.listener.lbId = this.id
      let flag = false
      this.usedTableData.forEach((data, index) => {
        data.Ips.forEach(function (item) {
          if (item.address == data.member.address) {
            data.member.subnetId = item.subnetId
            data.member.subnetUuid = item.subnetUuid
          }
        })
        if (!data.member.port || !data.member.weight) flag = true
        this.createData.members.push(data.member)
      })
      if (flag) return this.$message.error('请填写端口和权重')
      if (this.createData.monitor.type != 'HTTP') {
        delete this.createData.monitor.httpMethod
        delete this.createData.monitor.urlPath
        delete this.createData.monitor.expectedCodes
      }
      createLbListen(this.createData).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.close()
        }
      })
    },
    getHostData(page) {
      this.paramd.page = page || this.paramd.page
      const params = {
        page: this.paramd.page,
        rows: this.paramd.rows
      }
      const searchParam = [
        {
          param: { vendorId: this.vendorId, isRecycle: 0, subnetId: this.lbDetail.subnetId },
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
    networkRemove(id) {
      this.usedTableData.forEach((data, index) => {
        if (data.id == id) {
          this.usedTableData.splice(index, 1)
          this.usableTableData.push(data)
        }
      })
    },
    close() {
      this.$refs.listener.resetFields()
      this.addFlag = false
    },
    // 选择成员分页
    handleSizeChangeS(val) {
      this.paramd.rows = val
      this.getHostData()
    },
    add() {
      this.createData = {
        listener: {
          name: '',
          protocol: '',
          port: ''
        },
        pool: {
          protocol: 'HTTP',
          lbMethod: 'ROUND_ROBIN'
        },
        monitor: {
          type: 'PING',
          httpMethod: 'GET',
          timeout: 5,
          delay: 5,
          maxRetries: 3,
          urlPath: '/',
          expectedCodes: 200
        },
        members: []
      }
      this.usableTableData = []
      this.usedTableData = []
      this.active = 0
      this.addFlag = true
      this.getHostData(1)
    },
    remove(id) {
      this.$confirm('此操作将永久删除该监听器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          removeLbListen(id).then(data => {
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
    getData() {
      getLbListen(this.params).then(data => {
        if (data.success) {
          this.balancerData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        lbId: this.id,
        'name:LK': this.searchData.name
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
    onmessage(data) {
      if (data.operate === 'openstack.listener') {
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
