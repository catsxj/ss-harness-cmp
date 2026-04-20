<template>
  <el-card class="wrapper">
    <AdvanceTable v-show="!detailComponent.visible" :beforeSearch="beforeSearch" :card-border="false" title="订单列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="" @click="exportData"> <i class="el-icon-download"></i> 导出 </el-button>
      </template>
      <template #sn="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <!-- <template #resourceStatus="resourceStatus">
        {{ resourceStatusMap[resourceStatus] || resourceStatus }}
      </template> -->
      <template #chargeMode="mode">
        {{ chargeMode[mode] || mode }}
      </template>
      <template #orderStatus="status">
        <status-icon :type="status | statusFilter('color')">
          {{ status | statusFilter('status') }}
        </status-icon>
      </template>
      <template #type="type">
        {{ typeMap[type] || type }}
      </template>
      <template #serviceName="val, record">
        {{ val | serviceNameFilter(record) }}
      </template>
      <template #operate="val, record">
        <div v-if="record.chargeMode !== 'PostCharge' && record.orderStatus === 'unpay'">
          <el-button type="text" @click="payOrder(record)">支付订单</el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="cancelOrder(record)">取消订单</el-button>
        </div>
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
import { getUser } from 'services/system/user'
import { getItems } from 'services/services/catelog'
import { getOrder, getOrderItems, exportOrders, operateOrder } from 'services/services/order'
// const resourceStatusMap = {
//   creating: '创建中',
//   ready: '创建完成',
//   failed: '创建失败',
//   exception: '创建异常',
//   canceld: '已取消'
// }

const typeMap = {
  apply: '新购',
  alterat: '变更',
  unsubscribe: '退订',
  extension: '延期'
}

const chargeMode = {
  PreCharge: '预付费',
  PostCharge: '后付费'
}
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
      searchConfigs: [
        { type: 'Select', value: 'serviceCode', label: '资源类型', data: [], props: { value: 'code' } },
        // {
        //   type: 'Select',
        //   value: 'resourceStatus',
        //   label: '资源状态',
        //   data: [
        //     { id: 'creating', name: '创建中' },
        //     { id: 'ready', name: '创建成功' },
        //     { id: 'failed', name: '创建失败' },
        //     { id: 'exception', name: '创建异常' },
        //     { id: 'canceld', name: '已取消' }
        //   ]
        // },
        {
          type: 'Input',
          value: 'uuid',
          label: '资源UUID'
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
        { type: 'Select', value: 'userId', label: '选择用户', data: [] },
        { type: 'DateRange', value: 'gmtCreate', label: '创建' },
        {
          type: 'Input',
          value: 'sn',
          label: '订单编号'
        }
      ],
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
        // {
        //   label: '资源状态',
        //   prop: 'resourceStatus',
        //   scopedSlots: { customRender: 'resourceStatus' }
        // },
        {
          label: '收费模式',
          prop: 'chargeMode',
          scopedSlots: { customRender: 'chargeMode' }
        },
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
        },
        {
          label: '操作',
          scopedSlots: { customRender: 'operate' }
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
    }
  },
  computed: {
    userData() {
      return this.$store.state && this.$store.state.app && this.$store.state.app.userData
    }
  },
  created() {
    if (this.userData.accountCategory === 'Tenant') {
      this.searchConfigs[3].value = 'userId'
      this.searchConfigs[3].label = '选择用户'
      this.getUserList()
    } else {
      this.searchConfigs[3].value = 'tenantId'
      this.searchConfigs.splice(3, 1)
    }
    getItems({
      page: 1,
      rows: 9999
    }).then(data => {
      if (data.success) {
        this.searchConfigs[0].data = data.data.rows
      }
    })
  },
  methods: {
    cancelOrder(data) {
      this.$confirm(`您确定要取消订单【${data.sn}】`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        operateOrder('cancel', { sn: data.sn }).then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
          }
        })
      })
    },
    payOrder(data) {
      this.$confirm(`您确定要支付订单【${data.sn}】`, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        operateOrder('pay', { sn: data.sn }).then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
          }
        })
      })
    },
    getDetail(record) {
      this.detailComponent = {
        visible: true,
        id: record.id,
        serviceCode: record.serviceCode
      }
    },
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
    exportData() {
      exportOrders({ ...this.searchParams })
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
        .then(data => {
          if (data.success) {
            this.list = data.data.rows
            this.list.forEach(item => {
              item.items.forEach(item1 => {
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
    getTenantList() {
      const obj = {
        simple: true
      }
      if (this.$route.path.indexOf('/orders/tenant') > -1) {
        obj.params = this.$tools.handleSearchParam({
          managerId: this.userData.id
        })
      }
      getTenant(obj).then(data => {
        if (data.success) {
          this.searchConfigs[3].data = data.data.rows
        }
      })
    },
    async getUserList() {
      const res = await getUser({ page: 1, rows: 9999 })
      if (res.success) {
        this.searchConfigs[3].data = res.data.rows
      }
    }
  }
}
</script>
