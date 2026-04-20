<template>
  <div>
    <AdvanceTable
      title="存储池列表"
      :search-configs="searchConfigs"
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
      <template #role="role">
        {{ roleDiskTypeFilter(role) }}
      </template>
      <template #captionType="captionType">
        {{ roleDiskTypeFilter(captionType) }}
      </template>
      <template #capacity="capacity">
        {{ capacity.toFixed(2) }}
      </template>
      <template #usedCapacity="usedCapacity">
        {{ (usedCapacity / 1024 / 1024 / 1024).toFixed(2) }}
      </template>
      <template #usedPercent="val, record"> {{ ((record.physicalDisk.usedCapacity / record.physicalDisk.capacity) * 100).toFixed(2) }}% </template>
      <template #dataStatus="val, record">
        <el-tooltip class="item" effect="dark" placement="top">
          <div slot="content">
            <div>健康的：{{ record.dataStatus.healthyPercent * 100 }}%</div>
            <div>降级的：{{ record.dataStatus.degradedPercent * 100 }}%</div>
            <div>待恢复：{{ record.dataStatus.recoveryPercent * 100 }}%</div>
            <div>不可：{{ record.dataStatus.unavailablePercent * 100 }}%</div>
          </div>
          <el-progress :percentage="record.dataStatus.healthyPercent * 100" :show-text="false"></el-progress>
        </el-tooltip>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { roleDiskTypeFilter, xskyStatusFilter } from '@/filters/xsky'
import { getCloudVendor } from 'services/platform/index'
import { getOsd } from 'services/platform/xsky'
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
      roleDiskTypeFilter,
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
          label: '角色',
          prop: 'role',
          scopedSlots: { customRender: 'role' }
        },
        {
          label: '类型',
          prop: 'physicalDisk.captionType',
          scopedSlots: { customRender: 'captionType' }
        },
        {
          label: '总容量(GB)',
          prop: 'physicalDisk.capacity',
          scopedSlots: { customRender: 'capacity' }
        },
        {
          label: '已用容量(GB)',
          prop: 'physicalDisk.usedCapacity',
          scopedSlots: { customRender: 'usedCapacity' }
        },
        {
          label: '缓存盘',
          prop: 'cacheDisk.name'
        },
        {
          label: '服务器',
          prop: 'server.name'
        },
        {
          label: '所属存储池',
          prop: 'volumePool.name'
        },
        {
          label: '数据状态',
          scopedSlots: { customRender: 'dataStatus' }
        },
        {
          label: '物理盘',
          prop: 'physicalDisk.name'
        },
        {
          label: '槽位号',
          prop: 'physicalDisk.slotId'
        },
        {
          label: '转速',
          prop: 'physicalDisk.rpm'
        },
        {
          label: '型号',
          prop: 'physicalDisk.mode'
        }
      ],
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true, params: this.$tools.handleSearchParam({ type: 'XSKY' }) }, attr: 'data.rows' } },
        { type: 'Const', value: 'id', initValue: this.resourceIds && this.status == 'detail' ? this.resourceIds.join(',') : '', sign: 'IN' }
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
      loading: false,
      flag: 0,
      ids: ''
    }
  },
  methods: {
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
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    getList() {
      this.loading = true
      this.refreshId()
      getOsd(this.params).then((data) => {
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
  }
}
</script>

<style></style>
