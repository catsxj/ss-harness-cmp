<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="installDetail" @goBack="goBack">
      <el-tabs value="1">
        <el-tab-pane label="Blob" name="1">
          <blob :detail="installDetail"></blob>
        </el-tab-pane>
        <el-tab-pane label="元数据" name="0">
          <smart-table :data="installDetail.metaDatas">
            <el-table-column prop="key" label="KEY"></el-table-column>
            <el-table-column prop="value" label="VALUE"></el-table-column>
          </smart-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchData.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <!-- <el-form-item>
        <el-select v-model="searchData.storageAccountId" clearable placeholder="请选择存储账号">
          <el-option v-for="(item, index) in accountList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="getList">搜索</el-button>
        <el-button
          type="ghost"
          icon="el-icon-refresh-left"
          @click="
            () => {
              searchData = {}
              getList()
            }
          "
          >刷新</el-button
        >
        <el-button type="primary" @click="add">
          <Icon type="icon-add"></Icon>
          新增
        </el-button>
        <!-- <el-button type="ghost" @click="handleDeletes" :disabled="selectList.length == 0">
            删除
          </el-button> -->
      </el-form-item>
    </el-form>
    <!-- list -->
    <basic-table :data="list" :params="params" :get-list="getList" :total="total" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
      <!-- <el-table-column type="selection">
      </el-table-column> -->
      <el-table-column prop="name" label="名称">
        <template slot-scope="scope">
          <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastModified" label="上次修改时间"></el-table-column>
      <el-table-column prop="publicAccess" label="公共访问级别">
        <template slot-scope="scope">
          {{ scope.row.publicAccess | publicAccess }}
        </template>
      </el-table-column>
      <el-table-column prop="leaseState" label="租约可用状态">
        <template slot-scope="scope">
          {{ scope.row.leaseState | leaseState }}
        </template>
      </el-table-column>
      <el-table-column label="存储账户" prop="storageAccountName" show-overflow-tooltip></el-table-column>
      <el-table-column width="249px" label="操作">
        <template slot-scope="scope">
          <lock :data="scope.row" type="Container" @back="getList">
            <el-button type="text" @click="handleOperate({ flag: 5, imageUuid: scope.row.imageUuid, id: scope.row.id, azureResourceGroupName: scope.row.azureResourceGroupName })"> 删除 </el-button>
            <el-button type="text" @click.native="meta(scope.row)"> 更新元数据 </el-button>
            <el-button type="text" @click.native="publicAccessDialog(scope.row)"> 更新访问级别 </el-button>
          </lock>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" @back="getList"></add>
    <metas :add-data="metaData" v-if="metaData.dialog" @back="getList"></metas>
    <publics :add-data="publicData" v-if="publicData.dialog" @back="getList"></publics>
  </el-card>
</template>
<script>
import { getContainers, removeContainers, detailContainers, removeContainerss, getAccount } from 'services/platform/azure'
import { publicAccess, leaseState } from 'filters'
import webSocket from '@/common/mixins/getGlobalSocket'
import blob from '../blob/index'
import lock from '@/components/lock.vue'

import add from './add.vue'
import metas from './meta'
import publics from './publicAccess'
export default {
  mixins: [webSocket],
  components: { add, metas, publics, blob, lock },
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      // 自定义镜像分页
      params: {
        page: 1,
        rows: 10
      },
      detailSetting: {
        type: 'image',
        columns: [
          [
            { name: '名称', value: 'name' },
            { name: 'URL', value: 'url' },
            { name: '上次修改时间', value: 'lastModified' }
          ],
          [
            { name: 'ETAG', value: 'etag' },
            { name: '租约锁定状态', value: 'leaseStatus', filter: leaseState },
            { name: '租约可用状态', value: 'leaseState', filter: leaseState }
          ],
          [
            { name: '租约期限', value: 'leaseDuration' },
            { name: '存储账号', value: 'storageAccountName' },
            { name: '用户名称', value: 'userName' }
          ],
          [
            { name: '租户名称', value: 'tenantName' },
            { name: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectName' }
          ]
        ]
      },
      searchData: {},
      // 自定义镜像
      list: [],
      // 自定义镜像分页
      total: 0,
      // 镜像总显隐
      detailFlag: false,
      installDetail: {},
      azureResourceGroupName: '',
      addData: {
        dialog: false,
        data: {}
      },
      assignData: {
        dialog: false,
        data: {}
      },
      assignsDialog: {
        dialog: false,
        data: {}
      },
      idList: [],
      selectList: [],
      metaData: {
        dialog: false,
        data: {}
      },
      publicData: {
        dialog: false,
        data: {}
      },
      accountList: []
    }
  },
  methods: {
    meta(data) {
      this.metaData = {
        dialog: true,
        data: {
          id: data.id,
          metas: []
        }
      }
    },
    publicAccessDialog(data) {
      this.publicData = {
        dialog: true,
        data: {
          id: data.id,
          publicAccessType: data.publicAccess
        }
      }
    },
    handleDeletes() {
      this.refreshId()
      const list = this.idList
      if (list.length == 0) return this.$message.error('请选择容器')
      this.$confirm('此操作将删除所选容器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeContainerss({ ids: list }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
            this.selectList = []
          }
        })
      })
    },
    assigns() {
      this.refreshId()
      this.assignsDialog = {
        dialog: true,
        data: {
          ids: this.idList
        }
      }
    },
    selectable(row, index) {
      if (row.projectId) {
        return false
      } else {
        return true
      }
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
    add() {
      this.addData = {
        dialog: true,
        data: {
          storageAccountId: this.detail.id,
          vendorId: this.detail.vendorId
        }
      }
    },
    // 自定义镜像
    getList() {
      const searchParam = this.$tools.formatSearchParam({
        eqParam: {
          storageAccountId: this.detail.id
        },
        lkParam: {
          name: this.searchData.name
        }
      })
      this.params.params = searchParam
      this.selectList = []
      getContainers(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    getDetail(id) {
      detailContainers(id).then(data => {
        if (data.success) {
          this.installDetail = { ...data.data, metaDatas: [] }
          // this.detailFlag = true
          const metaData = JSON.parse(data.data.metadata)
          const metaKey = Object.keys(metaData)
          const metaValue = Object.values(metaData)
          this.installDetail.metaDatas = metaKey.map((item, index) => {
            return {
              key: item,
              value: metaValue[index]
            }
          })
          this.$emit('isShow', {
            if: true,
            detail: this.installDetail
          })
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    // 做自定义镜像操作
    handleOperate(command) {
      switch (command.flag / 1) {
        case 5:
          // 删除镜像
          this.handleDelete(command.imageUuid, command.id, command.azureResourceGroupName)
          break
      }
    },
    // 删除
    handleDelete(imageUuid, id, azureResourceGroupName) {
      this.$confirm('该操作为不可逆操作，确定后将永久删除该容器，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeContainers(id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    },
    getAccount() {
      getAccount({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }])
      }).then(data => {
        if (data.success) {
          this.accountList = data.data.rows
        }
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) {
        this.getList()
        if (this.detailFlag) {
          this.getDetail(this.installDetail.id)
        }
      }
    }
  },
  mounted() {
    this.getList()
    // this.getAccount()
  }
}
</script>

<style scoped></style>
