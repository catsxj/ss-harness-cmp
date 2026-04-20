<template>
  <el-card class="wrapper-container">
    <div>
      <el-form :inline="true">
        <!-- <router-link :to="{ name: 'ServiceSnapshots' }" class="m-r-md">
          <el-button type="primary">创建云快照</el-button>
        </router-link>
        <el-button style="margin-right: 10px" type="danger" :disabled="selectList.length == 0">批量删除</el-button> -->
        <el-form-item>
          <el-input class="search-item" placeholder="名称" v-model="listQuery.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="listQuery.vmId" placeholder="所属云主机" filterable>
            <el-option v-for="item in vmList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button type="ghost" icon="el-icon-search" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" @select="handleSelectItem" @select-all="handleSelectAll">
        <el-table-column type="selection"> </el-table-column>
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.name ? scope.row.name : scope.row.snapshotUuid }}
          </template>
        </el-table-column>
        <el-table-column label="所属云主机" prop="vmName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="平台名称" prop="vendorName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="平台类别" prop="vendorType" show-overflow-tooltip> </el-table-column>
        <el-table-column label="快照状态" prop="status" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | openstackServerColor">{{ scope.row.status | openstackServer }} </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="remark" show-overflow-tooltip> </el-table-column>
        <el-table-column label="创建时间" prop="createTime" show-overflow-tooltip> </el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <!-- <el-button type="text" @click="handleDelete(scope.row, 1)"><i class="el-icon-delete"></i> 删除 </el-button>
            <div class="action-divider" v-show="scope.row.vendorType == 'VMWARE' || scope.row.vendorType == 'INSPURRAIL'"></div> -->
            <el-button v-show="scope.row.vendorType == 'VMWARE' || scope.row.vendorType == 'INSPURRAIL'" :disabled="scope.row.isExpired" type="text" @click="handleDelete(scope.row, 2)"><i class="iconfont icon-zhongzuo"></i> 恢复 </el-button>
            <div class="action-divider" v-if="['TENCENT', 'ALIYUN', 'TENCENT', 'SMARTX', 'CLOUDTOWER', 'FUSIONSPHERE'].indexOf(scope.row.vendorType) > -1"></div>
            <el-button type="text" @click="revertSnapshot(scope.row.id)" v-if="['TENCENT', 'ALIYUN', 'TENCENT', 'SMARTX', 'CLOUDTOWER', 'FUSIONSPHERE'].indexOf(scope.row.vendorType) > -1"> <i class="iconfont icon-huifu"></i> 恢复 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <!--详情界面-->
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="detail" @goBack="goBacks"></common-detail>
    <!--延期-->
    <el-dialog :title="title3" :close-on-click-modal="false" v-if="dialogFormtimeVisible" :visible.sync="dialogFormtimeVisible">
      <el-form :model="addDatatime" label-width="100px" status-icon ref="addDatatime">
        <el-row>
          <basic-form-item label="使用时长：" prop="months" validate="required,positiveInteger">
            <el-input type="number" v-model="addDatatime.months" auto-complete="off">
              <template slot="append">月</template>
            </el-input>
          </basic-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormtimeVisible = false">取消</el-button>
        <el-button type="primary" @click.native="timeSubmit">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { openstackServerColor, openstackServer } from 'filters'
import { getSnapshot, removeSnapshot, patchSnapshot, conditionService, getVm } from 'services/platform/index'
const detailSetting = {
  type: 'snapshot',
  columns: [
    [
      { name: '快照名称', value: 'name' },
      { name: '快照UUID', value: 'snapshotUuid' },
      { name: '状态', value: 'status', filter: openstackServer }
    ],
    [
      { name: '大小', value: 'size', unit: 'GB' },
      { name: '描述', value: 'remark' },
      { name: '所属平台', value: 'vendorName' }
    ]
  ]
}
export default {
  mixins: [webSocket],
  data() {
    return {
      addDatatime: {},
      dialogFormtimeVisible: false,
      detailSetting,
      title3: '延期',
      list: [],
      total: 0,
      price: '',
      listQuery: {
        name: '',
        vmId: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      detailFlag: false,
      //        详情数据
      detail: {},
      title1: '申请快照',
      money: '',
      typelist: [],
      idList: [],
      selectList: [],
      vmList: []
    }
  },
  created() {
    conditionService('volume').then(data => {
      if (data.success) {
        this.typelist = data.data.filter(item => item !== 'VMWARE' || item !== 'INSPURRAIL')
        this.listQuery.vendorType = this.$route.query.vendorType
        this.handleSearch()
      }
    })
    this.getVmList()
  },
  methods: {
    revertSnapshot(id) {
      this.$confirm('是否恢复该快照？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          patchSnapshot('revert', { id: id }).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    onmessage(data) {
      this.getList()
    },
    getList() {
      getSnapshot(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
            if (item.expiredTime === null) {
              item.isExpired = false
            }
            item.size = item.size || 0
          })
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.listQuery.name,
        vmId: this.listQuery.vmId,
        snapshotType: this.listQuery.vendorType == 'SMARTX' || this.listQuery.vendorType == 'CLOUDTOWER' ? 'VOLUME' : ''
      })
      this.getList()
    },
    handleDelete(row, flag) {
      let url, msg
      switch (flag / 1) {
        case 1:
          msg = '您确定要删除该快照吗？'
          this.$confirm(msg, '提示', {
            confirmButtonText: '确定',
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          }).then(() => {
            removeSnapshot(row.id).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.handleSearch()
              }
            })
          })
          break
        case 2:
          msg = '你确定要恢复该快照吗？'
          this.$confirm(msg, '提示', {
            confirmButtonText: '确定',
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          }).then(() => {
            patchSnapshot('revert', { id: row.id }).then(data => {
              if (data.success) {
                this.$message.success({
                  message: data.message,
                  type: 'success'
                })
                this.handleSearch()
              }
            })
          })
          break
        case 3:
          this.dialogFormtimeVisible = true
          this.addDatatime = {}
          this.addDatatime.resId = row.id
          this.addDatatime.vendorId = row.vendorId
          break
        default:
      }
    },
    // 延迟
    timeSubmit() {
      this.$refs.addDatatime.validate(valid => {
        if (valid) {
          patchSnapshot('updateExpriedTime', this.addDatatime).then(data => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.dialogFormtimeVisible = false
              this.handleSearch()
            }
          })
        }
      })
    },
    // 跳转详情页
    getDetail(row) {
      this.detail = row
      if (this.detail.vendorType == 'VMWARE' || this.detail.vendorType == 'INSPURRAIL') {
        this.detailSetting = {
          type: 'snapshot',
          columns: [
            [
              { name: '快照名称', value: 'name' },
              { name: '状态', value: 'status', filter: openstackServer },
              { name: '过期时间', value: 'expiredTime' }
            ],
            [
              { name: '所属云主机', value: 'vmName' },
              { name: '描述', value: 'remark' }
            ]
          ]
        }
      } else {
        this.detailSetting = {
          type: 'snapshot',
          columns: [
            [
              { name: '快照名称', value: 'name' },
              { name: '状态', value: 'status', filter: openstackServer },
              { name: '快照UUID', value: 'snapshotUuid' }
            ],
            [
              { name: '大小', value: 'size', unit: 'GB' },
              { name: '所属硬盘', value: 'volumeName' },
              { name: '硬盘UUID', value: 'volumeUuid' }
            ],
            [
              { name: '所属平台', value: 'vendorName' },
              { name: '描述', value: 'remark' }
            ]
          ]
        }
      }
      this.detailFlag = true
    },
    goBacks() {
      this.detailFlag = false
    },
    goback() {
      history.go(-1)
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.handleSearch()
    },
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
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.list.forEach(item => {
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
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    handleReset() {
      this.listQuery = {
        name: '',
        vmId: ''
      }
      this.handleSearch()
    },
    getVmList() {
      const params = {
        page: 1,
        rows: 9999
      }
      getVm(params).then(data => {
        if (data.success) {
          this.vmList = data.data.rows
        }
      })
    }
  }
}
</script>
<style scoped>
.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
