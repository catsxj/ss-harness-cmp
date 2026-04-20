<template>
  <el-card class="wrapper">
    <AdvanceTable :beforeSearch="beforeSearch" :card-border="false" title="订单列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button @click="exportData"><i class="el-icon-download"></i>导出</el-button>
      </template>
      <template #sn="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #chargeMode="mode">
        {{ chargeMode[mode] || mode }}
      </template>
      <template #orderStatus="status">
        <status-icon :type="status | statusFilter('color')">
          {{ status | statusFilter('status') }}
        </status-icon>
      </template>
      <template #serviceName="val, record">
        {{ val | serviceNameFilter(record) }}
      </template>
      <template #type="type">
        {{ typeMap[type] || type }}
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <OrderDetail v-if="detailComponent.visible" :config="detailComponent"></OrderDetail>
    <el-dialog title="异常信息" :close-on-click-modal="false" :visible.sync="msgDialog.dialog" v-if="msgDialog.dialog" width="40%" append-to-body>
      <div>
        <div>{{ msgDialog.data }}</div>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import OrderDetail from './detail.vue'
import { getTenant } from 'services/system/tenant'
import { getUser } from 'services/system/manager.ts'
import { getItems } from 'services/services/catelog'
import { getOrder, getOrderItems, exportOrders } from 'services/services/order'

const typeMap = {
  apply: '新购',
  alterat: '变更',
  extension: '延期',
  unsubscribe: '退订'
}

const chargeMode = {
  PreCharge: '预付费',
  PostCharge: '后付费'
}

const searchConfigs = [
  { type: 'Select', value: 'serviceCode', label: '资源类型', data: [], props: { value: 'code' } },
  {
    type: 'Input',
    value: 'uuid',
    label: 'UUID'
  },
  {
    type: 'Select',
    value: 'orderStatus',
    label: '订单状态',
    data: [
      { id: 'unpay', name: '未支付' },
      { id: 'paid', name: '已支付' },
      { id: 'canceld', name: '已取消' },
      { id: 'audit', name: '审批中' }
    ]
  },
  { type: 'Select', value: 'tenantId', label: '选择租户', data: [] },
  { type: 'DateRange', value: 'gmtCreate', label: '创建' },
  {
    type: 'Select',
    value: 'userId',
    label: '选择用户',
    data: []
  },
  {
    type: 'Input',
    value: 'sn',
    label: '订单编号'
  }
]
export const serviceNameFilter = (val, record) => {
  if (!val && record.type === 'apply') return '云主机'
  if (!val && record.type === 'unsubscribe') return '资源退订'
  return val
}
export default {
  components: {
    OrderDetail
  },
  filters: {
    statusFilter(value, type) {
      const cnUserData = {
        unpay: '未支付', // 未支付
        paid: '已支付', // 已支付
        canceld: '已取消', // 已取消
        audit: '审批中'
      }
      const colorMap = {
        paid: 'success',
        unpay: 'danger',
        canceld: 'warning',
        audit: 'normal'
      }
      return type == 'color' ? colorMap[value] : cnUserData[value]
    },
    serviceNameFilter
  },
  data() {
    return {
      searchConfigs,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      typeMap,
      msgDialog: {
        dialog: false,
        data: ''
      },
      chargeMode,
      loading: false,
      columns: [
        {
          label: '订单编号',
          prop: 'sn',
          scopedSlots: { customRender: 'sn' }
        },
        {
          label: '资源类型',
          prop: 'serviceName',
          scopedSlots: { customRender: 'serviceName' }
        },
        {
          label: '收费模式',
          prop: 'chargeMode',
          scopedSlots: { customRender: 'chargeMode' }
        },
        // {
        //   label: '资源状态',
        //   prop: 'resourceStatus',
        //   scopedSlots: { customRender: 'resourceStatus' }
        // },
        {
          label: '订单状态',
          prop: 'orderStatus',
          scopedSlots: { customRender: 'orderStatus' }
        },
        {
          label: '订单类型',
          prop: 'type',
          scopedSlots: { customRender: 'type' }
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: '所属用户',
          prop: 'userName'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        }
      ],
      detailComponent: {
        visible: false
      },
      searchParams: {
        params: []
      }
    }
  },
  watch: {
    $route: function (val, oldVal) {
      this.getTenantList()
      this.$refs.search.handleSearch()
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.getTenantList()
    this.getUserList()
    getItems({
      page: 1,
      rows: 9999
    }).then((data) => {
      if (data.success) {
        this.searchConfigs[0].data = data.data.rows
      }
    })
  },
  methods: {
    beforeSearch({ listQuery }) {
      if (!listQuery) {
        return
      }
      this.searchParams.params = this.$tools.handleSearchParam({
        'serviceCode:EQ': listQuery.serviceCode,
        'orderStatus:EQ': listQuery.orderStatus,
        'tenantId:EQ': listQuery.tenantId,
        'gmtCreate:RANGE': listQuery.gmtCreate,
        'userId:EQ': listQuery.userId
      })
    },
    async getUserList() {
      const res = await getUser({ page: 1, rows: 9999 })
      if (res.success) {
        this.searchConfigs[5].data = res.data.rows
      }
    },
    getDetail(record) {
      this.detailComponent = {
        visible: true,
        id: record.id,
        serviceCode: record.serviceCode
      }
    },
    exportData() {
      exportOrders({ ...this.params, ...this.searchParams })
    },
    masDetail(data) {
      this.msgDialog = {
        dialog: true,
        data: data.errorMsg
      }
    },
    getList() {
      this.loading = true
      getOrder(this.params)
        .then((data) => {
          if (data.success) {
            this.list = data.data.rows
            this.list.forEach((item) => {
              item.items.forEach((item1) => {
                item1.duration = JSON.parse(item1.duration)
              })
              item.isExpand = false
            })
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    getTenantList() {
      const obj = {
        simple: true
      }
      if (this.$route.path.indexOf('/orders/tenant') > -1) {
        obj.params = this.$tools.handleSearchParam({
          managerId: this.userData.id
        })
      }
      getTenant(obj).then((data) => {
        if (data.success) {
          this.searchConfigs[3].data = data.data.rows
        }
      })
    }
  }
}
</script>
