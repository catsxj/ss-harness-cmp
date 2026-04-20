<template>
  <div>
    <AdvanceTable
      title="对象路由列表"
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
        <status-icon :type="status | stautsIconFilter">
          {{ status | statusFilter }}
        </status-icon>
      </template>
      <template #sizeQuota="val, record">
        <MyProgress :total="record.quotaMaxSize" :used="record.allocatedSize">
          <span slot="used">{{ record.allocatedSize | capacityFilter({ zeroTrans: false }) }}</span>
          <span slot="total">{{ record.quotaMaxSize | capacityFilter }}</span>
        </MyProgress>
      </template>
      <template #objectQuota="val, record">
        <MyProgress :total="record.quotaMaxSize" :used="record.allocatedSize">
          <span slot="used">{{ record.allocatedObjects }}</span>
          <span slot="total">{{ record.quotaMaxObjects | quotaFilter }}</span>
        </MyProgress>
      </template>
      <template #worm="worm">
        <span>{{ worm ? '开启' : '未开启' }}</span>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { getCloudVendor } from 'services/platform/index'
import { getBucket } from 'services/platform/xsky/bucket'
import MyProgress from 'views/storage/distribute/xsky/components/progress'
import { statusFilter, stautsIconFilter, capacityFilter, quotaFilter } from 'views/storage/distribute/xsky/filters'
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
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '容量配额',
          scopedSlots: { customRender: 'sizeQuota' }
        },
        {
          label: '对象数配额',
          scopedSlots: { customRender: 'objectQuota' }
        },
        {
          label: '拥有者',
          prop: 'objectUserName'
        },
        {
          label: '写保护',
          prop: 'worm',
          scopedSlots: { customRender: 'worm' }
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
  components: { MyProgress },
  filters: {
    statusFilter,
    stautsIconFilter,
    capacityFilter,
    quotaFilter
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
    handleReSet() {
      this.listQuery = {}
      this.handleSearch()
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
      getBucket(this.params).then((data) => {
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
