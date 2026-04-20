<template>
  <div>
    <AdvanceTable
      title="资源列表"
      :data="list"
      :params="params"
      :columns="columns"
      :get-list="getList"
      :total="total"
      ref="ResourceTable"
      @select="handleSelectItem"
      @select-all="handleSelectAll"
      :loading="loading"
      :isInitSearch="resourceIds === null || resourceIds.length != 0 || status != 'detail'"
    >
      <template v-slot:action>
        <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="名称" v-model="listQuery.name"> </el-input>
          </el-form-item>
          <el-form-item>
            <el-select clearable v-model="listQuery.vendorId" placeholder="所属平台" @change="getStorage">
              <el-option v-for="item in vendorData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-select clearable v-model="listQuery.storageId" placeholder="存储设备">
              <el-option v-for="item in storageData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            <el-button type="ghost" icon="el-icon-refresh" @click="handleReSet">重置</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template #operationalStatus="operationalStatus">
        <status-icon :type="operateStatusFilter(operationalStatus, 'color')">
          {{ operateStatusFilter(operationalStatus, 'status') }}
        </status-icon>
      </template>
      <template #size="val, record">
        {{ ((record.blockCount * record.blockSize) / 1024 / 1024 / 1024).toFixed(2) }}
      </template>
      <template #storageHostCnt="val">
        {{ val > 0 ? '是' : '否' }}
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { operateStatusFilter } from '@/filters/huawei'
import { getCloudVendor, getVolume } from 'services/platform/index'
import { getVolumeByType } from 'services/monitor/index'
import { getStorages } from 'services/platform/storage'
import { getVendorType, getProjectName } from '@/views/data'
export default {
  props: {
    resourceType: {
      type: String
    },
    resourceIds: {
      type: Array,
      default: function () {
        return []
      }
    },
    status: {
      type: String
    }
  },
  data() {
    return {
      operateStatusFilter,
      columns: [
        {
          type: 'selection'
          // selectable: this.selectable
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '运行状态',
          prop: 'operationalStatus',
          scopedSlots: { customRender: 'operationalStatus' }
        },
        {
          label: '容量（GB）',
          prop: 'size',
          scopedSlots: { customRender: 'size' }
        },
        {
          label: '存储池',
          prop: 'poolName'
        },
        {
          label: '存储设备',
          prop: 'storageName'
        },
        {
          label: '主机映射',
          prop: 'storageHostCnt',
          scopedSlots: { customRender: 'storageHostCnt' }
        }
      ],
      list: null,
      total: null,
      listQuery: {
        name: '',
        storageId: '',
        vendorId: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      selectList: [],
      idList: [],
      vendorType: getVendorType(this.resourceType),
      loading: false,
      flag: 0,
      vendorData: [],
      storageData: [],
      vendorIds: '',
      ids: '',
      projectName: getProjectName(this.resourceType)
    }
  },
  methods: {
    getData() {
      getCloudVendor({
        page: 1,
        rows: 10000,
        params: this.$tools.handleSearchParam({
          type: this.vendorType,
          'authentication:LK': '"projectName":"DELL%CMPL"'
        })
      }).then((data) => {
        if (data.success) {
          this.vendorData = data.data.rows
          const ids = this.vendorData.map((item) => item.id)
          this.vendorIds = ids.join(',')
          this.handleSearch()
          this.getStorage()
        }
      })
    },
    getStorage() {
      this.listQuery.storageId = ''
      getStorages({
        page: 1,
        rows: 99999999,
        params: this.$tools.handleSearchParam({
          vendorId: this.listQuery.vendorId,
          'vendorId:IN': this.vendorIds
        })
      }).then((data) => {
        if (data.success) {
          this.storageData = data.data.rows
        }
      })
    },
    selectable(row, index) {
      if (row.projectVisibility && row.projectVisibility != 'GLOBAL_PROJECT') {
        return false
      } else {
        return true
      }
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
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
        selection.forEach((item) => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach((item) => {
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
    handleReSet() {
      this.listQuery = {}
      this.handleSearch()
    },
    // 查询
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        vendorId: this.listQuery.vendorId,
        'vendorId:IN': this.vendorIds,
        'id:IN': this.ids,
        'name:LK': this.listQuery.name,
        storageId: this.listQuery.storageId
      })
      this.getList()
    },
    getList() {
      this.loading = true
      this.refreshId()
      getVolumeByType(this.params, this.vendorType, this.projectName).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((data) => {
            setTimeout(() => {
              if (this.idList.indexOf(data.id) > -1 && this.status != 'detail') {
                this.$refs.ResourceTable.toggleRowSelection(data, true)
              }
            })
          })
          this.flag++
        }
      })
    }
  },
  created() {
    if (this.resourceIds && this.resourceIds.length && this.status == 'update') {
      this.resourceIds.forEach((item) => {
        if (this.selectList.indexOf(item) == -1) {
          this.selectList.push({ id: Number(item) })
        }
      })
    }
    if (this.status == 'detail') {
      if (this.resourceIds) {
        this.ids = this.resourceIds.join(',')
      }
      this.columns[0].hidden = true
      this.columns[0].disabled = true
    }
    this.getData()
  }
}
</script>

<style></style>
