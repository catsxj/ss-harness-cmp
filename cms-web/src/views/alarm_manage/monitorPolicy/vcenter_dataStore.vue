<template>
  <div>
    <AdvanceTable
      title="存储列表"
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
        <status-icon :type="vmStatusColorFilter(status)">
          {{ openstackServerFilter(status) }}
        </status-icon>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getCloudVendor } from 'services/platform/index'
import { getDataStore } from 'services/monitor/index.js'
const typeData = [
  { name: ' 通用Internet文件系统', id: 'CIFS' },
  { name: ' 网络文件系统', id: 'NFS' },
  { name: ' 其他文件系统', id: 'OTHER' },
  { name: ' vFlash文件系统', id: 'VFFS' },
  { name: ' VMware文件系统', id: 'VMFS' },
  { name: ' VSAN文件系统', id: 'vsan' },
  { name: ' vvol文件系统', id: 'VVOL' }
]
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
      vmStatusColorFilter,
      openstackServerFilter,
      typeData,
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
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '类型',
          prop: 'type'
        },
        {
          label: '空间总量(GB)',
          prop: 'capacity'
        },
        {
          label: '空闲空间(GB)',
          prop: 'freeSpace'
        },
        {
          label: '关联主机',
          prop: 'hostNum'
        },
        {
          label: '关联云主机',
          prop: 'vmNum'
        }
      ],
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Select', label: '存储类型', value: 'type', data: typeData },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true, params: this.$tools.handleSearchParam({ type: 'VMWARE' }) }, attr: 'data.rows' } },
        { type: 'Const', value: 'id', initValue: this.resourceIds && this.status == 'detail' ? this.resourceIds.join(',') : '', sign: 'IN' }
      ],
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      selectList: [],
      idList: [],
      loading: false,
      flag: 0,
      vendorData: []
    }
  },
  methods: {
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
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    getList() {
      this.loading = true
      this.refreshId()
      getDataStore(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((data) => {
            data.cpuUsage = Number(data.cpuUsage)
            data.memUsage = Number(data.memUsage)
            if (data.privateIps) {
              data.privateIps = JSON.parse(data.privateIps)
            }
            switch (data.onOffStatus) {
              case '0':
                data.onOffStatus = '断开'
                break
              case '1':
                data.onOffStatus = '正常'
                break
              default:
                data.onOffStatus = '未知'
                break
            }
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
      this.columns[0].hidden = true
      this.columns[0].disabled = true
    }
  }
}
</script>

<style></style>
