<template>
  <el-tabs ref="resourceMonitorTab" @tab-click="handleClick" v-model="activeName" type="border-card">
    <el-tab-pane name="top" label="性能TOP5总览">
      <overview ref="tops"></overview>
    </el-tab-pane>
    <el-tab-pane name="template" label="标准内置模板">
      <el-form :inline="true" :model="templateData" ref="searchData">
        <el-form-item prop="network">
          <el-input v-model="templateData.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="searchTemplateList">搜索</el-button>
        <el-button type="primary" @click="configMultiTemplate">配置模板</el-button>
      </el-form>
      <basic-table :data="list" ref="multipleTable" :get-list="getList" :params="params" :total="total" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" show-overflow-tooltip label="云主机名称" min-width="200px">
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row, 'vm')">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="云主机类型" prop="vendorType" min-width="200px"> </el-table-column>
        <el-table-column label="IP地址" show-overflow-tooltip min-width="200px">
          <template slot-scope="scope" style="width: 100%">
            <div v-if="scope.row.vendorType == 'OPENSTACK' || scope.row.vendorType == 'MANAGEONE' || scope.row.vendorType == 'FUSIONCLOUD'">
              <span v-for="item in scope.row.privateIps" :key="item.networkId">
                <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
              </span>
            </div>
            <div v-else-if="scope.row.vendorType == 'VMWARE' || scope.row.vendorType == 'POWERVC' || scope.row.vendorType == 'HUAWEI'">
              <div v-for="item in scope.row.privateIps" :key="item.address">
                {{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}
              </div>
            </div>
            <div v-else-if="scope.row.vendorType == 'QCLOUD'">
              <div v-for="item in scope.row.privateIps" :key="item">(内网){{ item.address }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'JDCLOUD'">
              <div v-for="(item, index) in scope.row.privateIps" :key="index">{{ item }}</div>
            </div>
            <div v-else>(内网){{ JSON.parse(scope.row.privateIps)[0] }}</div>
            <div v-if="scope.row.floatingIp">(公网){{ scope.row.floatingIp }}</div>
            <div v-if="scope.row.vendorType == 'TENCENT'">
              <div v-for="(item, index) in scope.row.publicIps" :key="index">(公网){{ item }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="配置信息" prop="source" min-width="200px">
          <template slot-scope="scope">
            <span>cpu:{{ scope.row.cpu }}C 磁盘: {{ scope.row.disk }}GB 内存: {{ scope.row.memory }}GB</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="模板状态" prop="reportStatus" min-width="200px">
          <template slot-scope="scope">
            <span>{{ scope.row.reportStatus ? '开启' : '关闭' }}</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="操作" min-width="240px">
          <template slot-scope="scope">
            <el-button type="text" @click="configTemplate(scope.row, 'config')"> 配置模板 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-tab-pane>
    <el-tab-pane name="self-defined" label="自定义模板">
      <el-form :inline="true" :model="selfSearchData" ref="searchData">
        <el-form-item prop="network">
          <el-input v-model="selfSearchData.name" placeholder="名称"></el-input>
        </el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="searchList">搜索</el-button>
        <el-button type="primary" @click="add">新增</el-button>
      </el-form>
      <basic-table :data="selfList" :get-list="getSelfList" :params="selfParams" :total="selfTotal">
        <el-table-column prop="name" show-overflow-tooltip label="名称" min-width="200px">
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row, 'self')">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="云主机资源" prop="vmIdList" min-width="200px"> </el-table-column>
        <el-table-column show-overflow-tooltip label="周期" prop="periodItem" min-width="200px"> </el-table-column>
        <el-table-column show-overflow-tooltip label="启动模板" prop="status" min-width="200px">
          <template slot-scope="scope">
            <span>{{ scope.row.status ? '开启' : '关闭' }}</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="开启发送策略" prop="sendStatus" min-width="200px">
          <template slot-scope="scope">
            <span>{{ scope.row.sendStatus ? '开启' : '关闭' }}</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="接收人" prop="receivedsList" min-width="200px"> </el-table-column>
        <el-table-column show-overflow-tooltip label="操作" min-width="240px">
          <template slot-scope="scope">
            <el-button type="text" @click="editTemplate(scope.row)"> 编辑 </el-button>
            <el-button type="text" @click="delTemplate(scope.row.id)"> 删除 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </el-tab-pane>
    <common-detail v-if="detailFlag" :setting="{ type: 'host' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="云主机资源">{{ detailData.vmIdList }}</common-detail-item>
        <common-detail-item label="周期">{{ detailData.periodItem }}</common-detail-item>
        <common-detail-item label="启动模板">{{ detailData.status ? '开启' : '关闭' }}</common-detail-item>
        <common-detail-item label="开启发送策略">{{ detailData.sendStatus ? '开启' : '关闭' }}</common-detail-item>
        <common-detail-item label="接收人">{{ detailData.receivedsList }}</common-detail-item>
      </template>
      <basic-table :data="historyData" :get-list="getHistoryData" :params="historyParams" :total="historyTotal">
        <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="采集结果" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.status ? '成功' : '失败' }}
          </template>
        </el-table-column>
        <el-table-column prop="triggerTime" label="时间" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createName" label="创建人" show-overflow-tooltip></el-table-column>
        <el-table-column show-overflow-tooltip label="操作" min-width="240px">
          <template slot-scope="scope">
            <el-button type="text" @click="delHistory(scope.row.id, scope.row.historyType)"> 删除 </el-button>
            <!-- <el-button type="text" @click="handleMonitor(scope.row.id)">
            查看监控
          </el-button> -->
          </template>
        </el-table-column>
        <div slot="pagination"></div>
      </basic-table>
    </common-detail>
    <configTemplateDialog v-if="config.dialog" :config="config"></configTemplateDialog>
    <self-defined-add v-if="self.dialog" :self="self"></self-defined-add>
  </el-tabs>
</template>

<script>
import configTemplateDialog from './configTemplateDialog'
import selfDefinedAdd from './selfDefinedAdd'
import overview from './overview'
import { statementList, removeTemplate, selfTemplateList, getHistory, configTemplateDetail, delHistory, historyMonitor } from 'services/platform/index'
import { getUser } from 'services/system/user'
const detailSetting = {
  type: 'host',
  columns: [
    [
      { name: '云主机资源', value: 'vmIdList' },
      { name: '周期', value: 'periodItem' },
      { name: '启动模板', value: 'status' }
    ],
    [
      { name: '开启发送策略', value: 'sendStatus' },
      { name: '接收人', value: 'receivedsList' }
    ]
  ]
}
export default {
  components: {
    configTemplateDialog,
    selfDefinedAdd,
    overview
  },
  data() {
    return {
      historyData: [],
      detailFlag: false,
      detailData: {},
      detailSetting,
      activeName: 'top',
      config: {
        dialog: false
      },
      params: {
        page: 1,
        rows: 10
      },
      historyParams: {
        page: 1,
        rows: 10
      },
      tenantParams: {
        page: 1,
        rows: 99999
      },
      total: 0,
      searchData: {
        network: '',
        ip: ''
      },
      templateData: {},
      list: [],
      selfSearchData: {},
      selfList: [],
      selfParams: {
        page: 1,
        rows: 10
      },
      statementParams: {
        page: 1,
        rows: 99999
      },
      self: {
        dialog: false
      },
      historyTotal: 0,
      flag: true,
      selfTotal: 0,
      selectList: [],
      userList: [],
      statementlist: [],
      vmDetailData: {},
      vmDetailFlag: false,
      historySearchData: [],
      vmTemplateId: '',
      period: [
        {
          name: '日',
          value: 'ByDay'
        },
        {
          name: '周',
          value: 'ByWeek'
        },
        {
          name: '月',
          value: 'ByMonth'
        }
      ]
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    handleMonitor() {
      historyMonitor(this.historyParams).then((data) => {
        if (data.success) {
          console.log('11')
        }
      })
    },
    searchHistory() {
      this.handleHistory('vm')
    },
    handleHistory(type) {
      this.historyParams.page = 1
      if (type == 'vm') {
        this.historyParams.params = this.$tools.formatSearchParam({
          eqParam: {
            vmId: this.vmTemplateId,
            isPublic: false
          },
          lkParam: {
            name: this.historySearchData.name
          }
        })
      } else {
        this.historyParams.params = this.$tools.formatSearchParam({
          eqParam: {
            configTemplateId: this.detailData.id
          }
        })
      }
      this.getHistoryData(type)
    },
    getHistoryData(type) {
      getHistory(this.historyParams).then((data) => {
        if (data.success) {
          this.historyData = data.data.rows
          this.historyData.forEach((item) => {
            this.$set(item, 'historyType', type)
          })
          this.historyTotal = data.data.total
        }
      })
    },
    detail() {
      const params = {
        type: 'standard',
        isPublic: false
      }
      configTemplateDetail(this.vmTemplateId, params).then((data) => {
        if (data.success && data.data) {
          this.detailData = data.data
          if (this.detailData.period.length > 0) {
            this.detailData.periodItem = []
            if (this.detailData.period.length > 0) {
              JSON.parse(this.detailData.period).forEach((ele) => {
                this.period.forEach((x) => {
                  if (ele == x.value) {
                    this.detailData.periodItem.push(x.name)
                  }
                })
              })
              this.detailData.periodItem = this.detailData.periodItem.join()
            }
          }
          this.detailData.vmIdList = []
          if (JSON.parse(this.detailData.vmIds).length > 0) {
            JSON.parse(this.detailData.vmIds).forEach((ele) => {
              this.statementlist.forEach((x) => {
                if (ele == x.id) {
                  this.detailData.vmIdList.push(x.name)
                }
              })
            })
            this.detailData.vmIdList = this.detailData.vmIdList.join()
          }
          this.detailData.receivedsList = []
          if (JSON.parse(this.detailData.receiveds).length > 0) {
            JSON.parse(this.detailData.receiveds).forEach((ele) => {
              this.userList.forEach((x) => {
                if (ele == x.id) {
                  this.detailData.receivedsList.push(x.name)
                }
              })
            })
            this.detailData.receivedsList = this.detailData.receivedsList.join()
          }
        }
      })
    },
    getDetail(rows, type) {
      this.detailFlag = true
      this.detailData = {}
      if (type == 'vm') {
        this.getTenantData('detail')
        this.vmTemplateId = rows.id
        this.handleHistory('vm')
      } else {
        this.detailData = rows
        this.handleHistory('self')
      }
    },
    goBack() {
      this.detailFlag = false
    },
    vmGoBack() {
      this.vmDetailFlag = false
    },
    getTenantData(val) {
      const params = JSON.stringify([{ param: { tenantId: 0 }, sign: 'GT' }])
      this.tenantParams.params = params
      getUser(this.tenantParams).then((data) => {
        if (data.success) {
          this.userList = data.data.rows
          this.getStatementList(val)
        }
      })
    },
    getStatementList(val) {
      this.statementParams.params = this.$tools.formatSearchParam({
        eqParam: {
          isPublic: false
        }
      })
      statementList(this.statementParams).then((data) => {
        if (data.success) {
          this.statementlist = data.data.rows
          if (val) {
            this.detail()
          } else {
            this.handleSelfSearch()
          }
        }
      })
    },
    handleSelectionChange(val) {
      this.selectList = val
    },
    add() {
      this.self.dialog = true
      this.self.type = 'add'
    },
    editTemplate(rows) {
      this.self.data = rows
      this.self.type = 'edit'
      this.self.dialog = true
    },
    delHistory(id, type) {
      this.$confirm('此操作将删除所选数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delHistory(id).then((data) => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleHistory(type)
            this.selectList = []
          }
        })
      })
    },
    delTemplate(id) {
      this.$confirm('此操作将删除所选数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeTemplate(id).then((data) => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSelfSearch()
            this.selectList = []
          }
        })
      })
    },
    handleClick() {
      switch (this.activeName) {
        case 'template':
          this.handleSearch()
          break
        case 'self-defined':
          this.getTenantData()
          break
        case 'top':
          this.$refs.tops.handleSearch()
      }
    },
    getSelfList() {
      selfTemplateList(this.params).then((data) => {
        if (data.success) {
          this.selfList = data.data.rows
          this.selfPeriodItem = []
          this.selfList.forEach((item) => {
            item.periodItem = []
            if (item.period.length > 0) {
              JSON.parse(item.period).forEach((ele) => {
                this.period.forEach((x) => {
                  if (ele == x.value) {
                    item.periodItem.push(x.name)
                  }
                })
              })
              item.periodItem = item.periodItem.join()
            }
            item.vmIdList = []
            if (JSON.parse(item.vmIds).length > 0) {
              JSON.parse(item.vmIds).forEach((ele) => {
                this.statementlist.forEach((x) => {
                  if (ele == x.id) {
                    item.vmIdList.push(x.name)
                  }
                })
              })
              item.vmIdList = item.vmIdList.join()
            }
            item.receivedsList = []
            if (JSON.parse(item.receiveds).length > 0) {
              JSON.parse(item.receiveds).forEach((ele) => {
                this.userList.forEach((x) => {
                  if (ele == x.id) {
                    item.receivedsList.push(x.name)
                  }
                })
              })
              item.receivedsList = item.receivedsList.join()
            }
          })
          this.selfTotal = data.data.total
        }
      })
    },
    handleSelfSearch() {
      this.params.page = 1
      this.params.params = this.$tools.formatSearchParam({
        eqParam: {
          isPublic: false,
          type: 'definition',
          name: this.selfSearchData.name
        }
      })
      this.getSelfList()
    },
    getList() {
      statementList(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    searchTemplateList() {
      this.handleSearch()
    },
    searchList() {
      this.handleSelfSearch()
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.formatSearchParam({
        eqParam: {
          isPublic: false
        },
        lkParam: {
          name: this.templateData.name
        }
      })
      this.getList()
    },
    configMultiTemplate() {
      this.flag = true
      if (this.selectList.length > 0) {
        this.config.vmId = this.selectList.map((item) => {
          return item.id
        })
        this.selectList.forEach((item) => {
          if (item.reportStatus) {
            this.$message.warning('当前所选虚机中存在已配置模板设备')
            this.flag = false
          }
        })
        if (this.flag) {
          this.config.dialog = true
        }
      } else {
        this.$message.warning('请选择要配置的云主机')
      }
    },
    configTemplate(rows) {
      this.config.vmId = []
      this.config.vmId.push(rows.id)
      this.config.dialog = true
    }
  }
}
</script>

<style></style>
