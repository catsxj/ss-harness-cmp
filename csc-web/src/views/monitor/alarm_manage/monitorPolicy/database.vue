<template>
  <div>
    <AdvanceTable
      v-if="searchConfigs"
      :title="`${type}列表`"
      :search-configs="searchConfigs"
      :data="list"
      :params="params"
      :columns="columnsType ? columns : columns2"
      :get-list="getList"
      :total="total"
      ref="ResourceTable"
      @select="handleSelectItem"
      @select-all="handleSelectAll"
      :loading="loading"
      :isInitSearch="resourceIds === null || resourceIds.length != 0 || status != 'detail'"
    >
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | database }} </status-icon>
      </template>
      <template #category="category">
        <span>{{ categoryFilter[category] }}</span>
      </template>
      <template #expiredTime="expiredTime">
        <span>{{ expiredTime ? expiredTime : '无期限' }}</span>
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
/* global $ */
import { getTenant } from 'services/system/tenant'
import { getRds, getKvs } from 'services/resource/datebase'
import { getCms } from 'services/resource/middleware'
import { getCcs, getAss, getLbs } from 'services/resource/middlewares'
import { getVendorType } from '../../data'
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
      categoryFilter: {
        standalone: '单机',
        cluster: '集群'
      },
      searchConfigs: null,
      columns: [
        {
          type: 'selection'
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '版本',
          prop: 'version'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '部署类型',
          prop: 'category',
          scopedSlots: { customRender: 'category' }
        },
        {
          label: '服务地址',
          prop: 'address'
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '过期时间',
          prop: 'expiredTime',
          scopedSlots: { customRender: 'expiredTime' }
        }
      ],
      columns2: [
        {
          type: 'selection'
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '版本',
          prop: 'version'
        },
        {
          label: '部署类型',
          prop: 'category',
          scopedSlots: { customRender: 'category' }
        },
        {
          label: '服务地址',
          prop: 'address'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        }
      ],
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      selectList: [],
      idList: [],
      type: getVendorType(this.resourceType),
      loading: false,
      flag: 0,
      http: '',
      tenantFlag: true,
      columnsType: true
    }
  },
  methods: {
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
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params || this.params.params
      this.getList()
    },
    getList() {
      this.loading = true
      this.refreshId()
      this.http(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(data => {
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
    switch (this.type.toLowerCase()) {
      case 'mysql':
      case 'sqlserver':
      case 'postgresql':
        this.http = getRds
        break
      case 'oracle':
        this.http = getRds
        const index = this.columns.indexOf('状态')
        this.columns.splice(index, 1)
        const index2 = this.columns.indexOf('部署类型')
        this.columns[index2] = {
          label: '类型',
          prop: 'categoryName'
        }
        this.columns.push(
          {
            label: '配置',
            prop: 'spec'
          },
          index2
        )
        break
      case 'redis':
      case 'memchache':
      case 'mongodb':
        this.http = getKvs
        break
      case 'kafka':
      case 'rabbitmq':
        this.http = getCms
        break
      case 'activemq':
      case 'rocketmq':
        this.http = getCms
        const index3 = this.columns.indexOf('状态')
        this.columns.splice(index3, 1)
        break
      case 'zookeeper':
      case 'etcd':
        this.http = getCcs
        this.tenantFlag = false
        this.columnsType = false
        break
    }
    if (this.tenantFlag) {
      this.searchConfigs = [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'type', initValue: this.type },
        { type: 'Select', label: '所属租户', value: 'tenantId', data: [], service: { api: getTenant, params: { simple: true }, attr: 'data.rows' } },
        { type: 'Const', value: 'id', initValue: this.resourceIds && this.status == 'detail' ? this.resourceIds.join(',') : '', sign: 'IN' }
      ]
    } else {
      this.searchConfigs = [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'type', initValue: this.type },
        { type: 'Const', value: 'id', initValue: this.resourceIds && this.status == 'detail' ? this.resourceIds.join(',') : '', sign: 'IN' }
      ]
    }
    if (this.$refs.ResourceTable) {
      this.$refs.ResourceTable.handleSearch()
    } else {
      setTimeout(() => {
        this.$refs.ResourceTable.handleSearch()
      }, 100)
    }
    if (this.resourceIds && this.resourceIds.length && this.status == 'update') {
      this.resourceIds.forEach(item => {
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
