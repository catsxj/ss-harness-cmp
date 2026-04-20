<template>
  <div class="wrapper">
    <el-drawer append-to-body :visible.sync="detailFlag" :with-header="false" size="70%">
      <div style="padding: 20px">
        <el-tabs value="detail">
          <el-tab-pane label="概述" name="detail">
            <el-form label-position="left" label-width="120px" style="font-size: 12px">
              <el-form-item label="URL">{{ installDetail.url }}</el-form-item>
              <el-form-item label="修改时间">{{ installDetail.lastModified }}</el-form-item>
              <el-form-item label="类型">{{ installDetail.blobType | blobFilter }}</el-form-item>
              <el-form-item label="大小">{{ installDetail.size }}</el-form-item>
              <el-form-item label="访问层">{{ installDetail.standardBlobTier }}</el-form-item>
              <!-- <el-form-item label="上次修改访问层的时间">{{installDetail.tierChangeTime}}</el-form-item> -->
              <el-form-item label="加密的服务器">{{ installDetail.serverEncrypted }}</el-form-item>
              <el-form-item label="ETAG">{{ installDetail.etag }}</el-form-item>
              <el-form-item label="内容类型">{{ installDetail.contentType }}</el-form-item>
              <el-form-item label="租约锁定状态">{{ installDetail.leaseStatus | leaseState }}</el-form-item>
              <el-form-item label="租约可用状态">{{ installDetail.leaseState | leaseState }}</el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="快照" name="0">
            <el-form :inline="true">
              <el-form-item>
                <el-button type="primary" @click="addSnapshot" :disabled="detail.locked">
                  <Icon type="icon-add"></Icon>
                  新增快照
                </el-button>
              </el-form-item>
            </el-form>
            <basic-table :data="detailList" :params="detailParams" :get-list="getDetailList" :total="detailTotal">
              <el-table-column prop="name" label="名称" show-overflow-tooltip>
                <template slot-scope="scope">
                  {{ scope.row.name + '(' + scope.row.snapshotID + ')' }}
                </template>
              </el-table-column>
              <el-table-column prop="lastModified" label="上次修改时间"></el-table-column>
              <el-table-column prop="publicAccess" label="访问层">
                <template slot-scope="scope">
                  {{ scope.row.standardBlobTier | blobFilter }}
                </template>
              </el-table-column>
              <el-table-column prop="publicAccess" label="Blob类型">
                <template slot-scope="scope">
                  {{ scope.row.blobType | blobFilter }}
                </template>
              </el-table-column>
              <el-table-column prop="contentType" label="内容类型"></el-table-column>
              <el-table-column prop="size" label="大小"></el-table-column>
              <el-table-column prop="name" label="操作" width="200px">
                <template slot-scope="scope">
                  <el-button type="text" @click="remove(scope.row)" :disabled="detail.locked">删除</el-button>
                  <el-button type="text" @click="downloadBlobSnapshot(scope.row)" :disabled="scope.row.standardBlobTier == 'ARCHIVE' || detail.locked"> 下载 </el-button>
                  <el-button type="text" @click="uploadStandardBlobTier(scope.row)" :disabled="!scope.row.standardBlobTier || detail.locked"> 更改层 </el-button>
                </template>
              </el-table-column>
            </basic-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-drawer>
    <el-form :inline="true">
      <el-form-item>
        <el-input v-model="searchData.name" placeholder="请输入名称"></el-input>
      </el-form-item>
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
        <el-button type="primary" @click="add" :disabled="detail.locked">
          <Icon type="icon-add"></Icon>
          上传
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
      <el-table-column prop="size" label="大小"></el-table-column>
      <el-table-column prop="publicAccess" label="访问层">
        <template slot-scope="scope">
          {{ scope.row.standardBlobTier | blobFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="publicAccess" label="Blob类型">
        <template slot-scope="scope">
          {{ scope.row.blobType | blobFilter }}
        </template>
      </el-table-column>
      <el-table-column prop="leaseState" label="租约可用状态">
        <template slot-scope="scope">
          {{ scope.row.leaseState | leaseState }}
        </template>
      </el-table-column>
      <el-table-column prop="containerName" label="容器名称"></el-table-column>
      <el-table-column width="200px" label="操作">
        <template slot-scope="scope">
          <el-button type="text" :disabled="detail.locked" @click="handleOperate({ flag: 5, imageUuid: scope.row.imageUuid, id: scope.row.id, azureResourceGroupName: scope.row.azureResourceGroupName })"> 删除 </el-button>
          <el-button type="text" @click="download(scope.row)" :disabled="scope.row.standardBlobTier == 'ARCHIVE' || detail.locked"> 下载 </el-button>
          <el-button type="text" @click="uploadStandardBlobTier(scope.row)" :disabled="!scope.row.standardBlobTier || detail.locked"> 更改层 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <add :add-data="addData" v-if="addData.dialog" @back="getList"></add>
    <tier :add-data="tierData" v-if="tierData.dialog" @back="getList"></tier>
  </div>
</template>
<script>
import { getToken } from 'utils/auth'
import { getBlob, removeBlob, detailBlob, removeBlobs, downloadBlob, removeBlobSnpshot, createBlobSnpshot, downloadBlobSnapshot, getContainers, getAccount } from 'services/platform/azure'
import { blobFilter, leaseState } from 'filters'
import webSocket from '@/common/mixins/getGlobalSocket'

import add from './add.vue'
import tier from './tier'
import { removeSnapshot } from '@/services/platform/index.js'
export default {
  props: {
    detail: {
      type: Object
    }
  },
  mixins: [webSocket],
  components: { add, tier },
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
            { name: '租约期限', value: 'leaseDuration' },
            { name: '类型', value: 'blobType', filter: blobFilter },
            { name: '大小', value: 'size' }
          ],
          [
            { name: '访问层', value: 'standardBlobTier', filter: blobFilter },
            { name: '上次修改访问层的时间', value: 'tierChangeTime' },
            { name: '加密的服务器', value: 'serverEncrypted' }
          ],
          [
            { name: 'ETAG', value: 'etag' },
            { name: '内容类型', value: 'contentType' },
            { name: 'CONTENT-MD5', value: 'contentMD5' }
          ],
          [
            { name: '租约锁定状态', value: 'leaseStatus', filter: leaseState },
            { name: '租约可用状态', value: 'leaseState', filter: leaseState },
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
      idList: [],
      selectList: [],
      detailList: [],
      detailParams: {
        page: 1,
        rows: 10
      },
      detailTotal: 0,
      tierData: {
        dialog: false,
        data: {}
      },
      containers: [],
      accountList: []
    }
  },
  methods: {
    uploadStandardBlobTier(data) {
      this.tierData = {
        dialog: true,
        data: {
          id: data.id,
          standardBlobTier: data.standardBlobTier
        }
      }
    },
    download(data) {
      location.href = `/api/ims/v1/azure/blobs/${data.id}/download?token=${getToken()}`
    },
    downloadBlobSnapshot(data) {
      location.href = `/api/ims/v1/azure/blobs/${data.id}/snapshots/download?token=${getToken()}`
    },
    addSnapshot() {
      createBlobSnpshot({ name: this.installDetail.name, containerId: this.installDetail.containerId }).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
        }
      })
    },
    handleDeletes() {
      this.refreshId()
      const list = this.idList
      if (list.length == 0) return this.$message.error('请选择Blob')
      this.$confirm('此操作将删除所选Blob, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeBlobs({ ids: list }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
            this.selectList = []
          }
        })
      })
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
        kind: this.detail.storageAccount ? this.detail.storageAccount.kind : 'Storage',
        sku: this.detail.storageAccount ? this.detail.storageAccount.sku : 'Standard_LRS',
        data: {
          vendorId: this.detail.vendorId,
          containerId: this.detail.id
        }
      }
    },
    // 自定义镜像
    getList() {
      const searchParam = this.$tools.formatSearchParam({
        eqParam: {
          isSnapshot: false,
          containerId: this.detail.id
        },
        lkParam: {
          name: this.searchData.name
        }
      })
      this.params.params = searchParam
      this.selectList = []
      getBlob(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows.map(item => {
            return {
              ...item,
              size: this.filtrationSize(item)
            }
          })
          this.total = data.data.total
        }
      })
    },
    filtrationSize(data) {
      let size = '0B'
      if (data.length < 1024) {
        size = data.length + 'B'
      } else if (data.length >= 1024 && data.length < 1048576) {
        size = (data.length / 1024).toFixed(2) + 'KB'
      } else if (data.length >= 1048576 && data.length < 1073741824) {
        size = (data.length / 1024 / 1024).toFixed(2) + 'MB'
      } else {
        size = (data.length / 1024 / 1024 / 1024).toFixed(2) + 'GB'
      }
      return size
    },
    getDetail(id) {
      detailBlob(id).then(data => {
        if (data.success) {
          this.installDetail = data.data
          this.installDetail.size = this.filtrationSize(this.installDetail)
          this.getDetailList()
          this.detailFlag = true
        }
      })
    },
    getDetailList() {
      this.detailList = []
      this.detailParams.params = JSON.stringify([{ param: { containerId: this.installDetail.containerId, isSnapshot: true, name: this.installDetail.name }, sign: 'EQ' }])
      getBlob(this.detailParams).then(data => {
        if (data.success) {
          this.detailList = data.data.rows.map(item => {
            return {
              ...item,
              size: this.filtrationSize(item)
            }
          })
          this.detailTotal = data.data.total
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
      this.$confirm('该操作为不可逆操作，确定后将永久删除该Blob，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeBlob(id).then(data => {
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
    remove(data) {
      this.$confirm('该操作为不可逆操作，确定后将永久删除该快照，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeBlobSnpshot(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getDetailList()
          }
        })
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
  },
  watch: {
    detail: {
      handler(newVal, oldVal) {
        this.getList()
        if (this.detailFlag) {
          this.getDetail(this.installDetail.id)
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.text-hidden {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
