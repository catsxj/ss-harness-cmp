<template>
  <div>
    <AdvanceTable title="资源列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" ref="ResourceTable" @select="handleSelectItem" @select-all="handleSelectAll" v-if="columns.length">
      <template #status="status">
        <status-icon :type="vmStatusColorFilter(status)">
          {{ openstackServerFilter(status) }}
        </status-icon>
      </template>
      <template #status2="status">
        <status-icon :type="xskyStatusFilter(status, 'color')">
          {{ xskyStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #catalog="catalog">
        {{ xskyHostTypeFilter(catalog) }}
      </template>
      <template #connected="connected">
        {{ connected | vmConnect }}
      </template>
      <template #maintained="maintained">
        {{ maintained | vmMaintain }}
      </template>
      <template #ipv6Enabled="ipv6Enabled">
        {{ ipv6Enabled | ipv6Enabled }}
      </template>
    </AdvanceTable>
  </div>
</template>

<script>
import { xskyHostTypeFilter, xskyStatusFilter } from '@/filters/xsky'
import { vmStatusColorFilter, openstackServerFilter } from '@/filters/index'
import { getHost, getCloudVendor } from 'services/platform/index'
import { getVendorType } from '@/views/data'
export default {
  components: {},
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
      xskyHostTypeFilter,
      xskyStatusFilter,
      vmStatusColorFilter,
      openstackServerFilter,
      columns: [],
      vcenter_columns: [
        {
          type: 'selection',
          selectable: this.selectable
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
          label: '主机IP',
          prop: 'manageIp'
        },
        {
          label: '所属集群',
          prop: 'clusterName'
        },
        {
          label: '数据中心',
          prop: 'vdcName'
        },
        {
          label: '云主机总数',
          prop: 'vmNum'
        },
        {
          label: '模板总数',
          prop: 'templateNum'
        },
        {
          label: '平台',
          prop: 'catalog'
        },
        {
          label: '连接状态',
          prop: 'connected',
          scopedSlots: { customRender: 'connected' }
        },
        {
          label: '模式',
          prop: 'maintained',
          scopedSlots: { customRender: 'maintained' }
        },
        {
          label: 'IPV6启动',
          prop: 'ipv6Enabled',
          scopedSlots: { customRender: 'ipv6Enabled' }
        }
      ],
      openstack_columns: [
        {
          type: 'selection',
          selectable: this.selectable
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
          label: '主机IP',
          prop: 'manageIp'
        },
        {
          label: '云主机总数',
          prop: 'vmNum'
        }
      ],
      h3c_columns: [
        {
          type: 'selection',
          selectable: this.selectable
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: 'IP',
          prop: 'IP',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          label: '操作系统',
          prop: 'os',
          scopedSlots: { customRender: 'os' }
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        }
      ],
      xsky_column: [
        {
          type: 'selection',
          selectable: this.selectable
        },
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: 'IP地址',
          prop: 'manageIp'
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status2' }
        },
        {
          label: '类型',
          prop: 'catalog',
          scopedSlots: { customRender: 'catalog' }
        },
        {
          label: '厂商',
          prop: 'provider'
        },
        {
          label: '型号',
          prop: 'version'
        },
        {
          label: '角色',
          prop: 'roleFormat'
        },
        {
          label: 'CPU使用率',
          scopedSlots: { customRender: 'cpuUsed' }
        },
        {
          label: '内存总量(GB)',
          prop: 'config.memoryCapacity'
        },
        {
          label: '内存使用率',
          scopedSlots: { customRender: 'ramUsed' }
        },
        {
          label: '时间同步',
          prop: 'clockDiff',
          scopedSlots: { customRender: 'clockDiff' }
        }
      ],
      id: '',
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      selectList: [],
      idList: [],
      loading: false,
      vendorType: getVendorType(this.resourceType),
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Input', label: 'IP', value: 'manageIp' },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true, params: this.$tools.handleSearchParam({ type: getVendorType(this.resourceType) }) }, attr: 'data.rows' } },
        { type: 'Const', value: 'vendorType', initValue: getVendorType(this.resourceType) },
        { type: 'Const', value: 'id', initValue: this.resourceIds && this.status == 'detail' ? this.resourceIds.join(',') : '', sign: 'IN' }
      ]
    }
  },
  computed: {},
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
    getList() {
      this.refreshId()
      getHost(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach((data) => {
            setTimeout(() => {
              if (this.idList.indexOf(data.id) > -1) this.$refs.ResourceTable.toggleRowSelection(data, true)
            })
          })
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
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
    switch (this.vendorType) {
      case 'VCENTER':
        this.columns = this.vcenter_columns
        break
      case 'OPENSTACK':
      case 'EASYSTACK':
        this.columns = this.openstack_columns
        break
      case 'H3C':
        this.columns = this.h3c_columns
        break
      case 'XSKY':
        this.columns = this.xsky_column
        break
      default:
        this.columns = this.openstack_columns
        break
    }
    if (this.status == 'detail') {
      this.columns[0].hidden = true
      this.columns[0].disabled = true
    }
  },
  mounted() {},
  watch: {}
}
</script>

<style>
.no-searchBox {
  padding: 0 5px 5px 0;
}
</style>
