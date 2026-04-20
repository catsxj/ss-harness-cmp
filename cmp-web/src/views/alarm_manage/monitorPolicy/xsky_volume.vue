<template>
  <div>
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="名称" v-model="listQuery.name"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-select clearable v-model="listQuery.vendorId" placeholder="所属平台">
          <el-option v-for="item in vendorData" :key="item.id" :label="item.name" :value="item.id"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="ghost" icon="el-icon-refresh" @click="handleReSet">重置</el-button>
      </el-form-item>
    </el-form>
    <AdvanceTable
      title="块存储卷列表"
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
      <template #status="status">
        <status-icon :type="xskyStatusFilter(status, 'color')">
          {{ xskyStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #syncedSetName="syncedSetName">
        {{ syncedSetName }}
      </template>
      <template #accessPathName="accessPathName">
        {{ accessPathName }}
      </template>
      <template #snapshotName="snapshotName">
        {{ snapshotName }}
      </template>
      <template #qosEnabled="qosEnabled">
        {{ qosEnabledFilter(qosEnabled) }}
      </template>
      <template #performancePriority="performancePriority">
        {{ priorityFilter(performancePriority) }}
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { priorityFilter, qosEnabledFilter, xskyStatusFilter } from '@/filters/xsky'
import { getCloudVendor, getVolume } from 'services/platform/index'
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
      priorityFilter,
      qosEnabledFilter,
      xskyStatusFilter,
      columns: [
        {
          type: 'selection'
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '容量(GB)',
          prop: 'blockSize'
        },
        {
          label: '分配容量(GB)',
          prop: 'allocatedSize'
        },
        {
          label: '存储池',
          prop: 'poolName'
        },
        {
          label: '一致性组',
          prop: 'syncedSetName',
          scopedSlots: { customRender: 'snapshotGroupName' }
        },
        {
          label: '关联访问路径',
          prop: 'accessPathName',
          scopedSlots: { customRender: 'accessPathName' }
        },
        {
          label: '快照数',
          prop: 'snapshotCount'
        },
        {
          label: '关联快照',
          prop: 'snapshotName',
          scopedSlots: { customRender: 'snapshotName' }
        },
        {
          label: '业务Qos',
          prop: 'qosEnabled',
          scopedSlots: { customRender: 'qosEnabled' }
        },
        {
          label: '性能优先级',
          prop: 'performancePriority',
          scopedSlots: { customRender: 'performancePriority' }
        }
      ],
      list: null,
      total: null,
      listQuery: {
        name: '',
        vendorId: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      selectList: [],
      idList: [],
      vendorType: 'XSKY',
      loading: false,
      flag: 0,
      vendorData: [],
      vendorIds: '',
      ids: ''
    }
  },
  methods: {
    getData() {
      getCloudVendor({
        page: 1,
        rows: 10000,
        params: this.$tools.handleSearchParam({
          type: this.vendorType
        })
      }).then((data) => {
        if (data.success) {
          this.vendorData = data.data.rows
          const ids = this.vendorData.map((item) => item.id)
          this.vendorIds = ids.join(',')
          this.handleSearch()
        }
      })
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
      if (this.listQuery.vendorId) {
        this.vendorIds = ''
      }
      if (!this.vendorIds && !this.listQuery.vendorId) {
        this.total = 0
        this.list = []
        this.$message.error('当前资源类型无资源！')
      } else {
        this.params.params = this.$tools.handleSearchParam({
          vendorId: this.listQuery.vendorId,
          'vendorId:IN': this.vendorIds,
          'id:IN': this.ids,
          'name:LK': this.listQuery.name
        })
        this.getList()
      }
    },
    getList() {
      this.loading = true
      this.refreshId()
      getVolume(this.params).then((data) => {
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
