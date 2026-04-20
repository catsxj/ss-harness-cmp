<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input class="search-item" placeholder="名称" v-model="searchData.name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" @click="add"> 新增 </el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="新增云负载" :visible.sync="addFlag" width="80%" v-if="addFlag" @close="modalClose(addFlag)">
      <span>
        <el-steps :active="active" finish-status="success" class="m-b-lg">
          <el-step title="负载均衡器"></el-step>
          <el-step title="监听器"></el-step>
          <el-step title="成员"></el-step>
        </el-steps>
        <el-form v-show="active == 0" ref="balancer" :model="createData.balancer" label-width="110px">
          <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
            <el-input v-model="createData.balancer.name"></el-input>
          </basic-form-item>
          <!-- <basic-form-item label="平台名称：" prop="vendorId" validate="required" required-message="请选择平台">
            <el-select v-model="createData.balancer.vendorId" placeholder="请选择平台" @change='getNetworkList()'>
              <el-option v-for="(item,index) in vendorList" :key="index" :label="item.name"
                         :value="item.id"></el-option>
            </el-select>
          </basic-form-item> -->
          <vendor :add-data="createData.balancer" :types="['OPENSTACK', 'EASYSTACK']" @back="getNetworkList"></vendor>
          <basic-form-item label="网络名称：" prop="networkId" validate="required" required-message="请选择网络">
            <el-select v-model="createData.balancer.networkId" placeholder="请选择网络" @change="getSubnetList()">
              <el-option v-for="(item, index) in networkList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="子网：" prop="subnetId" validate="required">
            <el-select v-model="createData.balancer.subnetId" @change="setVersion" filterable>
              <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="指定IP：" v-if="createData.balancer.subnetId">
            <el-switch v-model="createData.balancer.switch" active-color="#13ce66" inactive-color="#ff4949"> </el-switch>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="version == 'V4' && createData.balancer.switch && createData.balancer.subnetId" prop="vipAddress" validate="required,ip">
            <el-input v-model="createData.balancer.vipAddress" placeholder="1.1.1.1"></el-input>
          </basic-form-item>
          <basic-form-item label="IP：" v-if="version == 'V6' && createData.balancer.switch && createData.balancer.subnetId" prop="vipAddress" validate="required,ipV6">
            <el-input v-model="createData.balancer.vipAddress" placeholder="2222::"></el-input>
          </basic-form-item>
          <basic-form-item label="IP范围：" v-if="createData.balancer.subnetId && createData.balancer.switch && ippools">
            <div v-for="(item, index) in ippools" :key="index">
              {{ item }}
            </div>
          </basic-form-item>
        </el-form>
        <el-form v-show="active == 1" ref="listener" :model="createData.listener" label-width="180px">
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
              <el-switch v-model="isOn" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
            </el-form-item>
            <el-form-item label="会话保持类型" v-if="isOn">
              <el-select v-model="createData.pool.type">
                <el-option v-for="item in pooltypes" :key="item.value" :label="item.name" :value="item.value"></el-option>
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
        <div v-show="active == 2">
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
                <el-table-column label="权重" show-overflow-tooltip>
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
                    <el-button :disabled="scope.row.flag" type="danger" @click="networkAdd(scope.row.id)">添加</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination-container">
                <el-pagination @size-change="handleSizeChangeS" @current-change="getHostData" :current-page.sync="paramd.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="paramd.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
              </div>
            </el-col>
          </el-row>
        </div>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="active >= 1" @click="next(2)">上一步</el-button>
        <el-button type="primary" v-if="active <= 1" @click="next(1)">下一步</el-button>
        <el-button type="primary" @click="ok" v-if="active == 2">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="绑定IP" :visible.sync="bandFlag" width="40%">
      <span>
        <el-form ref="bandData" :model="bandData" :status-icon="true" label-width="80px">
          <basic-form-item label="浮动IP" prop="id" validate="required" required-message="请选择IP">
            <el-select v-model="bandData.id">
              <el-option :label="item.floatingIpAddress" :value="item.id" v-for="item in floatIPList" :key="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel('bandData', 'bandFlag')">取 消</el-button>
        <el-button type="primary" @click="bandOk('bandData')">确 定</el-button>
      </span>
    </el-dialog>
    <basic-table :data="balancerData" :params="params" :get-list="getData" :total="total">
      <el-table-column label="名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.provisioningStatus | openstackServerColor">{{ scope.row.provisioningStatus | openstackServer }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column prop="vipAddress" label="虚拟IP" show-overflow-tooltip></el-table-column>
      <el-table-column prop="floatingIpAddress" label="浮动IP" show-overflow-tooltip></el-table-column>
      <el-table-column prop="listenerNum" label="监听器" show-overflow-tooltip></el-table-column>
      <el-table-column prop="vendorName" label="所属平台" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-button type="text" @click="dropdownClick({ index: 1, id: scope.row.id })"><i class="el-icon-delete"></i> 删除 </el-button>
          <div class="action-divider"></div>
          <el-button v-if="!scope.row.floatingIpAddress" type="text" @click="dropdownClick({ index: 2, portId: scope.row.portId, vendorId: scope.row.vendorId })"><i class="el-icon-delete"></i> 绑定IP </el-button>
          <el-button v-else type="text" @click="dropdownClick({ fipId: scope.row.fipId, index: 3 })"><i class="el-icon-delete"></i> 解绑IP </el-button>
        </template>
      </el-table-column>
    </basic-table>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { openstackServerColor, openstackServer } from 'filters'
import { getVm, getSubnet, conditionCloudVendor, getFloatIp, floatIpPorts, removeFloatIpPorts, getLb, removeLb, createLb, getVpc } from 'services/platform/index'
import vendor from '@/components/setVendor/index.vue'
export default {
  components: { vendor },
  mixins: [webSocket],
  data() {
    return {
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
      vendorList: [],
      networkList: [],
      createData: {
        balancer: {
          subnetId: ''
        },
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
      version: 'V4',
      ipPools: []
    }
  },
  methods: {
    setVersion() {
      this.subnetList.forEach(item => {
        if (item.id == this.createData.balancer.subnetId) {
          this.version = item.ipVersion
          this.ippools = item.ipPools ? JSON.parse(item.ipPools) : []
          this.$set(this.createData.balancer, 'switch', false)
          this.$set(this.createData.balancer, 'address', '')
          this.getHostData(1)
        }
      })
    },
    modalClose() {
      this.addFlag = false
      this.createData = {}
    },
    // 获取平台
    getVendorList() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'poolProviders',
          types: ['OPENSTACK', 'EASYSTACK']
        })
      }).then(data => {
        if (data.success) {
          this.vendorList = data.data
        }
      })
    },
    // 获取网络列表
    getNetworkList() {
      const params = { simple: true },
        searchParam = [{ param: { vendorId: this.createData.balancer.vendorId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getVpc(params).then(data => {
        if (data.success) {
          this.networkList = data.data.rows
        }
      })
    },
    getDetail(id) {
      this.$router.push({ name: 'balancer_detail', params: { id: id } })
    },
    expert() {
      this.expertFlag = !this.expertFlag
      if (this.expertFlag) {
        this.name = '隐藏高级选项'
      } else this.name = '显示高级选项'
    },
    clear(data) {
      this.createData.balancer.subnetId = data.id
      this.getHostData(1)
      this.usedTableData = []
      this.subnetList.forEach((item, index) => {
        const ref = 'setIp' + index
        if (data.id != item.id) this.$refs[ref][0].clear()
      })
    },
    next(index) {
      switch (index) {
        case 1:
          let name = 'balancer'
          if (this.active == 0) {
            if (!this.createData.balancer.subnetId) {
              this.$notify({
                title: '提示',
                message: '请选择子网'
              })
              return
            }
            name = 'balancer'
          } else if (this.active == 1) {
            name = 'listener'
          }
          this.$refs[name].validate(valid => {
            if (valid) {
              if (this.active++ > 2) this.active = 2
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
    // 保存新增负载均衡
    ok() {
      this.createData.pool.protocol = this.createData.listener.protocol
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
      createLb(this.createData).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.addFlag = false
        }
      })
    },
    handleSizeChangeS(val) {
      this.paramd.rows = val
      this.getHostData()
    },
    // 获取云主机列表
    getHostData(page) {
      this.paramd.page = page || this.paramd.page
      const params = {
        page: this.paramd.page,
        rows: this.paramd.rows
      }
      const searchParam = [
        {
          param: {
            vendorId: this.createData.balancer.vendorId,
            subnetId: this.createData.balancer.subnetId,
            isRecycle: 0
          },
          sign: 'EQ'
        }
      ]
      params.params = JSON.stringify(searchParam)
      getVm(params).then(data => {
        if (data.success) {
          this.usableTableData = data.data.rows
          const that = this
          const idList = []
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
    add() {
      this.createData = {
        balancer: {
          subnetId: '',
          name: ''
        },
        listener: {
          name: '',
          protocol: '',
          port: '',
          lbMethod: 'ROUND_ROBIN'
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
      this.subnetList = []
      // this.getVendorList()
      this.addFlag = true
      this.active = 0
      this.createData.pool.protocol = this.createData.listener.protocol = 'HTTP'
      this.createData.monitor.type = 'PING'
      this.createData.pool.lbMethod = 'ROUND_ROBIN'
      this.createData.monitor.timeout = this.createData.monitor.delay = 5
      this.createData.monitor.maxRetries = 3
      this.createData.monitor.httpMethod = 'GET'
      this.createData.monitor.urlPath = '/'
      this.createData.monitor.expectedCodes = 200
    },
    getSubnetList() {
      this.$set(this.createData.balancer, 'subnetId', '')
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.createData.balancer.vendorId, vpcId: this.createData.balancer.networkId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.subnetList = data.data.rows
        }
      })
    },
    dropdownClick(command) {
      switch (command.index) {
        case 1:
          this.remove(command.id)
          break
        case 2:
          this.bandIp(command.portId, command.vendorId)
          break
        case 3:
          this.unbandIp(command.fipId)
          break
      }
    },
    remove(id) {
      this.$confirm('此操作将永久删除该负载均衡, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeLb(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getData()
          }
        })
      })
    },
    bandIp(portId, vendorId) {
      this.portId = portId
      this.bandFlag = true
      this.bandData.portId = portId
      const params = {
        simple: true
      }
      const paramd = [
        { param: { vendorId: vendorId }, sign: 'EQ' },
        { param: { routerId: '', portId: '' }, sign: 'NUL' }
      ]
      params.params = JSON.stringify(paramd)
      getFloatIp(params).then(data => {
        if (data.success) {
          this.floatIPList = data.data.rows
        }
      })
    },
    bandOk() {
      this.$refs.bandData.validate(valid => {
        if (valid) {
          floatIpPorts(this.bandData).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.cancel('bandData', 'bandFlag')
              this.handleSearch()
            }
          })
        } else {
          return false
        }
      })
    },
    unbandIp(fipId) {
      this.$confirm('确定解绑浮动IP？', '提示', {
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFloatIpPorts({ id: fipId }).then(data => {
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
    getData() {
      getLb(this.params).then(data => {
        if (data.success) {
          this.balancerData = data.data.rows
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
    cancel(formName, flag) {
      this[flag] = false
      this.$refs[formName].resetFields()
    },
    onmessage(data) {
      if (location.hash === '#/resource/balancer' && data.operate === 'openstack.lb') {
        this.getData()
      }
    }
  },
  created() {
    this.getData()
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
