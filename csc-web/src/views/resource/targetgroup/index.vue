<template>
  <div class="wrapper">
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="back">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="协议">{{ detail.protocol }}</common-detail-item>
        <common-detail-item label="协议版本">{{ detail.protocolVersion }}</common-detail-item>
        <common-detail-item label="端口">{{ detail.port }}</common-detail-item>
        <common-detail-item label="健康检查协议">{{ detail.healthCheckProtocol }}</common-detail-item>
        <common-detail-item label="健康检查路径">{{ detail.healthCheckPath }}</common-detail-item>
        <common-detail-item label="健康阈值">{{ detail.healthyThresholdCount }}</common-detail-item>
        <common-detail-item label="不健康阈值">{{ detail.unhealthyThresholdCount }}</common-detail-item>
        <common-detail-item label="超时">{{ detail.healthCheckTimeoutSeconds }}秒</common-detail-item>
        <common-detail-item label="间隔">{{ detail.healthCheckIntervalSeconds }}秒</common-detail-item>
        <common-detail-item label="成功码">{{ detail.httpCode || detail.grpcCode }}</common-detail-item>
        <common-detail-item label="目标类型">{{ detail.type }}</common-detail-item>
        <common-detail-item label="VPC ID">{{ detail.vpcUuid }}</common-detail-item>
        <common-detail-item label="所属地域">{{ detail.regionName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs v-model="activeDetail">
        <el-tab-pane name="targets" label="目标" v-if="activeDetail === 'targets'">
          <el-form :inline="true">
            <el-form-item>
              <el-select v-model="selectedData" clearable @change="handleDetailSearch">
                <el-option v-for="(item, index) in zoneList" :key="index" :label="item.name" :value="item.zoneId"></el-option>
              </el-select>
            </el-form-item>
            <!--            <el-form-item>-->
            <!--              <el-input placeholder="名称" v-model="nameValue"></el-input>-->
            <!--            </el-form-item>-->
            <el-form-item>
              <el-button type="ghost" icon="el-icon-search" @click="handleDetailSearch">搜索</el-button>
              <el-button type="ghost" class="el-icon-add" @click="addTarget">添加目标</el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="detailTableData" :params="paramd" :get-list="getDetailData" :total="totald">
            <el-table-column prop="uuid" label="实例" show-overflow-tooltip v-if="activeRow.type === 'instance'"></el-table-column>
            <el-table-column prop="uuid" label="IP" show-overflow-tooltip v-else></el-table-column>
            <!--            <el-table-column prop="targetName" label="名称" show-overflow-tooltip></el-table-column>-->
            <el-table-column prop="state" label="状态" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ filter[scope.row.state] || '' }}
              </template>
            </el-table-column>
            <el-table-column prop="port" label="端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="availabilityZone" label="所在区域" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="openDeletedTarget(scope.row.tgId, scope.row.id)"
                  ><i class="el-icon-delete"></i>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreateTargetGroup"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" class="el-icon-delete" @click="handleDeleteTargetGroup(record.id)"> 删除</el-button>
      </template>
    </AdvanceTable>
    <el-dialog title="添加目标" v-if="targetType === 'ip' && dialogVisible" :visible.sync="dialogVisible" width="40%">
      <basic-form ref="dada" :model="ipData">
        <basic-form-item label="网络：">
          <el-select v-model="selectValue" disabled>
            <el-option :label="selectValue" :value="selectValue"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="IP：" prop="ipValue" validate="required,ip" required-message="请输入正确的IP">
          <el-input type="text" v-model="ipData.ipValue"></el-input>
        </basic-form-item>
        <basic-form-item label="端口：" prop="portValue" validate="required" required-message="请输入端口号">
          <el-input type="text" v-model="ipData.portValue" placeholder="请输入范围在1-65535间的端口"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addIpTarget">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加目标" v-if="targetType === 'instance' && dialogVisible" :visible.sync="dialogVisible" width="70%">
      <el-form :inline="true">
        <el-form-item>
          <el-input v-model="searchValue" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="getInstanceDataList">搜索</el-button>
          <el-button type="ghost" icon="el-icon-refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="dataList" :total="targetTotal" ref="multipleTable" @selection-change="handleSelectionChange" :get-list="getInstanceDataList" :params="targetParams">
        <el-table-column type="selection"></el-table-column>
        <el-table-column label="实例ID" prop="instanceId" sortable show-overflow-tooltip></el-table-column>
        <el-table-column label="名称" prop="name" sortable show-overflow-tooltip></el-table-column>
        <el-table-column label="状态" prop="status" sortable show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }}</status-icon>
          </template>
        </el-table-column>
        <el-table-column label="IP" prop="securityGroupId" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.privateIpsList" :key="index">
              {{ item }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="安全性群组" prop="securityGroupId" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-for="(item, index) in scope.row.securityGroupIds" :key="index">
              {{ item }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="地域" prop="zone" sortable show-overflow-tooltip></el-table-column>
        <el-table-column label="子网ID" prop="subnetUuid" show-overflow-tooltip></el-table-column>
      </basic-table>
      <basic-form>
        <basic-form-item label="为已选实例设置端口：" label-width="160px" label-positon="left">
          <el-input v-model="port" @change="changePort"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer">
        <el-button type="ghost" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="registerTargets">确定</el-button>
      </div>
    </el-dialog>
    <create-target-group :add-data="addData" v-if="addData.createVisible" @back="getData"></create-target-group>
  </div>
</template>
<script>
import { getRegion, getTargetgroups, getTargets, detailTargetgroups, deleteTargetObject, getInstanceDataList, registerTargets, getVpc, getZone, deleteTargetGroup, createTargetGroup } from 'services/platform/aws'
import { createPathsViewsById } from 'services/platform/xsky'
import { templateItems } from 'services/services/catelog'
import { detailDaemonSet } from 'services/platform/k8s'
import CreateTargetGroup from './CreateTargetGroup.vue'
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '协议',
    prop: 'protocol'
  },
  {
    label: '端口',
    prop: 'port'
  },
  {
    label: '目标类型',
    prop: 'type'
  },
  {
    label: '所属地域',
    prop: 'regionName'
  },
  {
    label: '操作',
    width: '220px',
    scopedSlots: { customRender: 'operate' },
    disabled: true
  }
]
export default {
  components: {
    CreateTargetGroup
  },
  data() {
    return {
      columns,
      loading: false,
      addData: {
        data: {},
        createVisible: false
      },
      vpcList: null,
      selectValue: null,
      targetType: null,
      ipData: {
        ipValue: null,
        portValue: 81
      },
      port: 80,
      searchValue: '',
      dialogVisible: false,
      detailFlag: false,
      activeDetail: 'targets',
      tableData: [],
      detailTableData: [],
      detail: {},
      regionList: [],
      activeRow: {},
      searchData: {
        name: '',
        regionId: ''
      },
      params: {
        page: 1,
        rows: 20
      },
      paramd: {
        page: 1,
        rows: 20
      },
      total: 0,
      totald: 0,
      activeGroupId: null,
      dataList: null,
      selectedData: null,
      targetParams: {
        page: 1,
        row: 10
      },
      targetTotal: null,
      registerParams: {
        action: 'registerTargets'
      },
      postParams: { targetIdPorts: null },
      tempObject: {},
      vpcParam: null,
      zoneList: null,
      nameValue: null,
      targetGroupVisible: false,
      searchConfigs: [{ type: 'Input', label: '名称', value: 'name' }],
      filter: {
        healthy: '健康',
        unhealthy: '不健康',
        unused: '未使用',
        initial: '初始化',
        draining: '已废弃'
      }
    }
  },
  methods: {
    handleCreateTargetGroup() {
      this.addData = {
        data: {
          name: '',
          regionId: '',
          vendorId: '',
          protocolVersion: 'HTTP1',
          healthCheckIntervalSeconds: 30,
          healthyThresholdCount: 5,
          healthCheckPath: '/',
          healthCheckPort: 'traffic-port',
          healthCheckProtocol: 'HTTP',
          unhealthyThresholdCount: 2,
          healthCheckTimeoutSeconds: 5,
          vpcUuid: '',
          protocol: 'HTTP',
          port: '80',
          type: 'instance',
          httpCode: 200,
          grpcCode: undefined,
          vpcId: null
        },
        createVisible: true
      }
    },
    // 删除目标群组
    handleDeleteTargetGroup(id) {
      this.$confirm('此操作将永久删除该目标群组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteTargetGroup(id).then(data => {
            if (data.success) {
              this.$message.success({ message: data.message })
              this.getData()
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
    // instance类的table 列表重置
    handleReset() {
      this.searchValue = null
      this.getInstanceDataList()
    },
    getZone() {
      const params = { regionId: this.activeRow.regionId, vendorId: this.activeRow.vendorId }
      getZone(params).then(data => {
        if (data.success) {
          this.zoneList = data.data
        }
      })
    },
    addIpTarget() {
      const params = {
        action: 'registerTargets',
        targetIdPorts: {}
      }
      params.targetIdPorts[this.ipData.ipValue] = Number(this.ipData.portValue)
      registerTargets(this.activeGroupId, params).then(data => {
        if (data.success) {
          this.$message.success({ message: data.message })
          this.dialogVisible = false
          detailTargetgroups(this.activeGroupId).then(data => {
            this.detail = data.data
            this.handleDetailSearch()
          })
        }
      })
    },
    changePort() {
      for (const i in this.tempObject) {
        this.tempObject[i] = Number(this.port)
      }
      this.postParams.targetIdPorts = this.tempObject
    },
    handleSelectionChange(rows) {
      const params = {
        targetIdPorts: {}
      }
      this.tempObject = {}
      for (const i in rows) {
        this.tempObject[rows[i].instanceId] = Number(this.port)
      }
      this.postParams.targetIdPorts = this.tempObject
    },
    registerTargets() {
      const obj = {
        ...this.registerParams,
        ...this.postParams
      }
      registerTargets(this.activeGroupId, obj).then(data => {
        if (data.success) {
          this.dialogVisible = false
          this.$message.success({ message: data.message })
          detailTargetgroups(this.activeGroupId).then(data => {
            this.detail = data.data
            this.handleDetailSearch()
          })
        }
      })
    },
    getInstanceDataList() {
      const params = [
        {
          param: {
            vendorId: this.activeRow.vendorId,
            regionId: this.activeRow.regionId,
            vpcUuid: this.activeRow.vpcUuid,
            status: 'RUNNING'
          },
          sign: 'EQ'
        }
      ]
      if (this.searchValue) {
        params.push({ param: { name: this.searchValue }, sign: 'LK' })
      }
      this.targetParams.params = JSON.stringify(params)
      getInstanceDataList(this.targetParams).then(data => {
        if (data.success) {
          this.dataList = data.data.rows.map(item => {
            return {
              ...item,
              securityGroupIds: item.securityGroupId ? JSON.parse(item.securityGroupId) : [],
              privateIpsList: item.privateIps ? JSON.parse(item.privateIps) : []
            }
          })
          this.targetTotal = data.data.total
        }
      })
    },
    addTarget() {
      this.portValue = 81
      this.ipValue = null
      this.dialogVisible = true
      this.getInstanceDataList()
      this.getVpc()
    },
    // 删除目标群组中的目标
    openDeletedTarget(targetGroundId, targetId) {
      this.$confirm('此操作将永久删除该目标, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteTarget(targetGroundId, targetId)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    deleteTarget(targetGroupId, targetId) {
      const params = {
        action: 'deregisterTargets',
        targetIds: [targetId]
      }
      deleteTargetObject(targetGroupId, params).then(data => {
        if (data.success) {
          this.$message.success({ message: data.message })
          // 刷新页面
          detailTargetgroups(targetGroupId).then(data => {
            this.detail = data.data
            this.handleDetailSearch()
          })
        }
      })
    },
    getDetail(row) {
      this.detailTableData = []
      this.targetType = row.type
      this.activeRow = row
      this.activeGroupId = row.id
      const params = [
        { param: { vpcId: row.vpcUuid }, sign: 'LK' },
        { param: { vendorId: row.vendorId }, sign: 'EQ' }
      ]
      this.vpcParam = JSON.stringify(params)
      detailTargetgroups(row.id).then(data => {
        this.detail = data.data
        this.handleDetailSearch()
        this.detailFlag = true
      })
      this.getZone()
    },
    getData() {
      this.loading = true
      getTargetgroups(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleDetailSearch() {
      const params = [{ param: { tgId: this.activeRow.id, regionId: this.activeRow.region }, sign: 'EQ' }]
      if (this.selectedData) {
        params.push({ param: { availabilityZone: this.selectedData }, sign: 'EQ' })
      }
      if (this.nameValue) {
        params.push({ param: { name: this.nameValue }, sign: 'LK' })
      }
      this.paramd.params = JSON.stringify(params)
      this.getDetailData()
    },
    getDetailData() {
      getTargets(this.paramd).then(data => {
        if (data.success) {
          this.detailTableData = data.data.rows
          this.totald = data.data.total
        }
      })
    },
    back() {
      this.detailFlag = false
      this.activeRow = null
      this.selectedData = null
      this.nameValue = null
    },
    getVpc() {
      const params = { page: 1, row: 10 }
      params.params = this.vpcParam
      getVpc(params).then(data => {
        if (data.success) {
          const tempStore = data.data.rows[0]
          this.selectValue = `${tempStore.name}${tempStore.cidr}`
        }
      })
    }
  }
}
</script>
