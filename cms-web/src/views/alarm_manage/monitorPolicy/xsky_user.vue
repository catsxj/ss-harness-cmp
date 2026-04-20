<template>
  <div>
    <AdvanceTable
      title="对象用户列表"
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
      <template #status="val, record">
        <status-icon v-if="record.suspended" color="danger">禁用 </status-icon>
        <status-icon v-else :color="record.status | stautsIconFilter">{{ record.status | statusFilter }} </status-icon>
      </template>
      <template #opMask="opMask">
        <span> {{ opMask | authFilter }}</span>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { getCloudVendor } from 'services/platform/index'
import { getObjectUser } from 'services/platform/xsky/object_user'
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
      columns: [
        {
          type: 'selection'
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '邮箱',
          prop: 'email'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '用户权限',
          prop: 'opMask',
          scopedSlots: { customRender: 'opMask' }
        },
        {
          label: '创建时间',
          prop: 'createTime'
        }
      ],
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true, params: this.$tools.handleSearchParam({ type: 'XSKY' }) }, attr: 'data.rows' } },
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
      getObjectUser(this.params).then((data) => {
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
