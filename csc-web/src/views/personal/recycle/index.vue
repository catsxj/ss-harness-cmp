<template>
  <el-card class="wrapper-container">
    <div v-show="!detaildialogVisible">
      <div class="search-content m-b">
        <el-input class="search-item" placeholder="主机名称" v-model="listQuery.name"> </el-input>
        <el-button class="m-l-md" style="margin-left: 15px" type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button class="m-l-md" type="ghost" @click="handleAllUnsubscribe" :disabled="!selectList.length">批量退订</el-button>
        <!-- <el-button class="m-l-md" type="ghost" icon="el-icon-delete" @click="deleteRecycle">清空回收站</el-button> -->
      </div>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column type="selection"> </el-table-column>
        <el-table-column label="名称" show-overflow-tooltip prop="name"> </el-table-column>
        <el-table-column label="IP" prop="address" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-if="scope.row.vendorType == 'OPENSTACK' || scope.row.vendorType == 'EASYSTACK' || scope.row.vendorType == 'MANAGEONE' || scope.row.vendorType == 'FUSIONCLOUD'">
              <span v-for="item in scope.row.privateIpsList" :key="item.networkId">
                <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
              </span>
            </div>
            <div v-else-if="scope.row.vendorType == 'VMWARE' || scope.row.vendorType == 'INSPURRAIL' || scope.row.vendorType == 'CNWARE' || scope.row.vendorType == 'ZSTACK' || scope.row.vendorType == 'CECSTACK' || scope.row.vendorType == 'H3C'">
              <div v-for="item in scope.row.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'HUAWEI' || scope.row.vendorType == 'HCSO'">
              <div v-for="item in scope.row.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'QCLOUD'">
              <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item.address }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'AZURE' || scope.row.vendorType == 'AWS'">
              <div v-for="item in scope.row.privateIpsList" :key="item">(内网){{ item }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'JDCLOUD'">
              <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'VOLCENGINE'">
              <!-- <div v-for="(item, index) in scope.row.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
              <div v-if="JSON.parse(scope.row.privateIps)[0].primaryIpAddress">{{ JSON.parse(scope.row.privateIps)[0].primaryIpAddress }}(内网)</div>
              <div v-if="JSON.parse(scope.row.privateIps)[0].eipAddress">{{ JSON.parse(scope.row.privateIps)[0].eipAddress }}(公网)</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'SMARTX' || scope.row.vendorType == 'CLOUDTOWER'">
              <div>{{ scope.row.managerIp ? '(内网)' + scope.row.managerIp : '--' }}</div>
            </div>
            <div v-else-if="scope.row.vendorType == 'SANGFOR'">
              <div>{{ scope.row.privateIps }}</div>
            </div>
            <div v-else>
              <div v-for="item in scope.row.privateIpsList" :key="item">(内网){{ item }}</div>
            </div>
            <div v-if="scope.row.floatingIp">(公网){{ scope.row.floatingIp }}</div>
            <div v-if="scope.row.vendorType == 'CNWARE' || scope.row.vendorType == 'CECSTACK'">
              <div v-for="(item, index) in scope.row.publicIps" :key="index">(公网){{ item.address }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="UUID" show-overflow-tooltip prop="sn"> </el-table-column>
        <el-table-column label="配置" show-overflow-tooltip prop="spec"> </el-table-column>
        <el-table-column label="订购产品" prop="type" show-overflow-tooltip> </el-table-column>
        <el-table-column label="移入时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <el-button type="text" :disabled="scope.row.isExpired" @click="handleOperate(scope.row)"> 还原 </el-button>
            <div class="action-divider"></div>
            <el-button :disabled="scope.row.isDelete" type="text" @click="remove(scope.row)"> 退订 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { detailVm, getSnapshot, getRes } from 'services/platform/index'
import { getRecycle, deleteRecycle, patchRecycle, checkUnderway } from 'services/system/recycle'
import { unsubscribeService, unsubscribeServiceEFC, newunsubscribeServices } from 'services/services/product'

export default {
  mixins: [webSocket],
  data() {
    return {
      list: null,
      total: null,
      listQuery: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10,
        params: JSON.stringify([{ param: { isRecycle: 1 }, sign: 'EQ' }])
      },
      vmDetail: null,
      detaildialogVisible: false,
      snapParam: {
        page: 1,
        rows: 10
      },
      snapList: null,
      snapTotal: null,
      operateParam: {
        page: 1,
        rows: 10
      },
      operateList: null,
      operateTotal: null,
      idList: [],
      selectList: []
    }
  },
  created() {
    this.handleSearch()
  },
  updated() {},
  methods: {
    // onmessage(data) {
    //   this.handleSearch()
    // },
    goBack() {
      this.detaildialogVisible = false
    },
    getList() {
      getRecycle(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          const nowTime = new Date()
          this.list.forEach(item => {
            if (item.vendorType === 'SANGFOR' && item.privateIps) {
              item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map(item => ({ address: Object.keys(item)[0] })))
            }
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIpsList = JSON.parse(item.publicIps)
            this.judgeOperate(item)
            this.$set(item, 'isDelete', false)
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowTime.getTime()) {
              item.isExpired = true
            }
          })
        }
      })
    },
    // 组合云主机配置
    judgeOperate(data) {
      data.hostConfig = data.cpu + 'C/' + data.memory + 'GB/' + data.disk + 'GB'
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.listQuery.name
      })
      this.getList()
    },
    // 单个处理IP
    getIps(record) {
      const { vendorType, privateIps, managerIp } = record
      if (!privateIps) return []
      switch (vendorType) {
        case 'VMWARE':
        case 'INSPURRAIL':
        case 'HUAWEI':
        case 'H3C':
        case 'QCLOUD':
          return JSON.parse(privateIps).map(item => item.address)
        case 'OPENSTACK':
        case 'EASYSTACK':
        case 'MANAGEONE':
          const ary = []
          JSON.parse(privateIps).map(item => {
            item.addresses.map(item1 => {
              ary.push(item1.address)
            })
          })
          return ary
        case 'SANGFOR':
          return privateIps.split(',')
        case 'ARCHEROS':
        case 'CLOUDTOWER':
        case 'SMARTX':
          return [managerIp] // 后续要改
        default:
          return JSON.parse(privateIps).map(item => item)
      }
    },
    // 单个处理
    formatClearData(record) {
      const { name, spec, accessIp, sn: instance } = record
      if (!instance) {
        this.$message.error('缺少订单信息，请联系管理员处理')
        throw new Error('缺少订单信息')
      }
      if (accessIp) {
        return {
          workOrderTypeCode: 'CloudServerCancelation',
          instance,
          instanceName: name,
          preview: [
            { label: '名称', value: name },
            { label: '规格', value: spec },
            { label: 'IP地址', value: accessIp }
          ],
          resourceConfig: record
        }
      }
      const ips = this.getIps(record)
      return {
        workOrderTypeCode: 'CloudServerCancelation',
        instance,
        instanceName: name,
        preview: [
          { label: '云主机名称', value: name },
          { label: '云主机规格', value: spec },
          { label: 'IP地址', value: ips }
        ],
        resourceConfig: record
      }
    },
    // 批量处理
    formatAllClearData(record) {
      const arr = record.map(item => {
        if (!item.sn) {
          this.$message.error('缺少订单信息，请联系管理员处理')
          throw new Error('缺少订单信息')
        }
        if (item.accessIp) {
          return {
            workOrderTypeCode: 'CloudServerCancelation',
            instance: item.sn,
            instanceName: item.name,
            preview: [
              { label: '名称', value: item.name },
              { label: '规格', value: item.spec },
              { label: 'IP地址', value: item.accessIp }
            ],
            resourceConfig: item
          }
        }
        const ips = this.getIps(item)
        return {
          workOrderTypeCode: 'CloudServerCancelation',
          instance: item.sn,
          instanceName: item.name,
          preview: [
            { label: '云主机名称', value: item.name },
            { label: '云主机规格', value: item.spec },
            { label: 'IP地址', value: ips }
          ],
          resourceConfig: item
        }
      })
      return arr
    },
    remove(data) {
      this.$set(data, 'isDelete', true)
      this.$confirm('您确定要退订该数据吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const isVm = data.type.includes('Computer')
        const http = isVm ? newunsubscribeServices : unsubscribeService
        const clearData = this.formatClearData(data)
        const params = isVm ? {
          ...clearData,
          workOrderTypeCode: 'CloudServerCancelation'
        } : {
          cancelationParams: [clearData],
          workOrderTypeCode: 'CloudServerCancelation'
        }
        http(params).then(data => {
          if (data.success) {
            this.$message.success({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    deleteRecycle(data) {
      this.$confirm('您确定要清空回收站吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const res = await getRecycle({ page: 1, rows: 9999 })
        if (res.success) {
          const params = res.data.rows.map(item => this.formatClearData(item))
          const result = await deleteRecycle(params)
          if (result.success) {
            this.$message.success(result.message)
            this.handleSearch()
          }
        }
      })
    },
    handleOperate(data) {
      this.$confirm('您确定要恢复该数据吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { success } = await checkUnderway({ sn: data.sn })
        if (success) {
          patchRecycle({ id: data.id, type: data.type, resourceId: data.resourceId }).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.handleSearch()
            }
          })
        }
      })
    },
    getSnapshots() {
      this.snapParam.params = JSON.stringify([{ param: { vmId: this.vmDetail.id }, sign: 'EQ' }])
      getSnapshot(this.snapParam).then(data => {
        if (data.success) {
          this.snapList = data.data.rows
          this.snapTotal = data.data.total
        }
      })
    },
    getOperate() {
      this.operateParam.params = JSON.stringify([
        {
          param: {
            resourceId: this.vmDetail.id,
            vendorId: this.vmDetail.vendorId,
            object: 'VM'
          },
          sign: 'EQ'
        }
      ])
      getRes(this.operateParam).then(data => {
        if (data.success) {
          this.operateList = data.data.rows
          this.operateTotal = data.data.total
        }
      })
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    handleAllUnsubscribe() {
      this.$confirm('您确定要批量退订数据吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const clearDataList = this.formatAllClearData(this.selectList)
        const requests = clearDataList.map(clearData => {
          const params = {
            ...clearData,
            workOrderTypeCode: 'CloudServerCancelation'
          }
          return newunsubscribeServices(params)
        })
        Promise.all(requests).then(results => {
          const allSuccess = results.every(data => data.success)
          if (allSuccess) {
            this.$message.success({
              message: '批量退订成功',
              type: 'success'
            })
            this.getList()
          }
        })
      })
    }
  }
}
</script>
