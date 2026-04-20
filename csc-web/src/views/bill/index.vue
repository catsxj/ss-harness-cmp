<template>
  <el-card class="wrapper">
    <AdvanceTable title="" :search-configs="searchConfigs" :card-border="false" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #sn="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #chargeMode="val">
        {{ val | chargeMode }}
      </template>
      <template #serviceName="val, record">
        {{ val | serviceNameFilter(record) }}
      </template>
      <template #status="status">
        <status-icon :type="status | statusFilter('color')">
          {{ status | statusFilter('status') }}
        </status-icon>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :title="detailData.sn" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="账期">{{ detailData.month }}</common-detail-item>
        <common-detail-item label="流水号">{{ detailData.orderSn }}</common-detail-item>
        <common-detail-item label="账单状态">{{ detailData.status | billStatusFilter }}</common-detail-item>
        <common-detail-item label="账单金额">{{ detailData.money }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <common-detail-item label="租户名称">{{ detailData.tenantName }}</common-detail-item>
      </template>
      <el-tabs value="items">
        <el-tab-pane label="账单明细" name="items">
          <basic-table :data="itemList" :params="itemParams" :get-list="getItemList" :total="itemTotal">
            <el-table-column label="资源名称" prop="resourceName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="IP地址" prop="ip" show-overflow-tooltip> </el-table-column>
            <el-table-column label="资源标识ID" prop="resourceId" show-overflow-tooltip> </el-table-column>
            <el-table-column label="收费模式" prop="chargeMode" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.chargeMode | chargeMode }}
              </template>
            </el-table-column>
            <el-table-column label="配置" prop="resource" show-overflow-tooltip>
              <template slot-scope="scope">
                <div v-for="(item, index) in scope.row.resource" :key="index">
                  {{ item }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="账单金额（元）" prop="money" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单开始时间" prop="billStart" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单结束时间" prop="billEnd" show-overflow-tooltip> </el-table-column>
            <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单类别" prop="catalog" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ catalogFilter[scope.row.catalog] }}
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <!-- <el-tab-pane label="支付明细" name="payments">
          <basic-table :data="paymentsList" :params="paymentsParams" :get-list="getPaymentsList" :total="paymentsTotal">
            <el-table-column label="流水号" prop="sn" show-overflow-tooltip> </el-table-column>
            <el-table-column label="支付渠道" prop="channel" show-overflow-tooltip> </el-table-column>
            <el-table-column label="支付账户" prop="account" show-overflow-tooltip> </el-table-column>
            <el-table-column label="支付现金（元）" prop="money" show-overflow-tooltip> </el-table-column>
            <el-table-column label="支付状态" prop="status" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.status }}
              </template>
            </el-table-column>
            <el-table-column label="支付开始时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
            <el-table-column label="支付成功时间" prop="gmtModify" show-overflow-tooltip> </el-table-column>
            <el-table-column label="用户名称" prop="userName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="租户名称" prop="tenantName" show-overflow-tooltip> </el-table-column>
          </basic-table>
        </el-tab-pane> -->
      </el-tabs>
    </common-detail>
  </el-card>
</template>

<script>
import { getBills, getBillsDetail, getBillsItems, getPayments } from 'services/services/bill'
import { getTenant } from 'services/system/tenant'
import { getUser } from 'services/system/user'
import { getItems } from 'services/services/catelog'
export const serviceNameFilter = (val, record) => {
  if (!val) return '云主机'
  return val
}
const catalogFilter = {
  standard: '订购',
  alteration: '变更',
  extension: '延期',
  unsubscribe: '退订'
}
const columns = [
  {
    label: '流水号',
    prop: 'sn',
    width: '200px',
    scopedSlots: { customRender: 'sn' }
  },
  {
    label: '账期',
    prop: 'month'
  },
  {
    label: '资源类型',
    prop: 'serviceName',
    scopedSlots: { customRender: 'serviceName' }
  },
  {
    label: '计费类型',
    prop: 'chargeMode',
    scopedSlots: { customRender: 'chargeMode' }
  },
  {
    label: '账单状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '订单号',
    prop: 'orderSn'
  },
  {
    label: '账单金额（元）',
    prop: 'money'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '租户名称',
    prop: 'tenantName'
  }
]

const orderStatusList = {
  unpay: '未支付',
  paid: '已支付',
  paying: '支付中',
  canceld: '已取消'
}
export default {
  components: {},
  data() {
    return {
      columns,
      loading: false,
      orderStatusList,
      catalogFilter,
      list: [],
      total: null,
      listQuery: {
        tenantId: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      detailFlag: false,
      detailData: {},
      itemList: [],
      itemTotal: 0,
      itemParams: {
        page: 1,
        rows: 10
      },
      paymentsList: [],
      paymentsTotal: 0,
      paymentsParams: {
        page: 1,
        rows: 10
      },
      searchConfigs: [
        { label: '流水号', value: 'sn', type: 'Input' },
        { label: '资源名称', value: 'serviceCode', type: 'Select', data: [] },
        { label: '订单编号', value: 'orderSn', type: 'Input' },
        { type: 'DateRange', label: '账期', value: 'gmtCreate' },
        {
          type: 'Select',
          value: 'userId',
          label: '选择用户',
          data: []
        }
      ],
      codeList: []
    }
  },
  watch: {
    $route: function (val, oldVal) {
      this.getTenantList()
    }
  },
  filters: {
    statusFilter(value, type) {
      const cnUserData = {
        unpay: '未支付', // 未支付
        paid: '已支付', // 已支付
        canceld: '已取消' // 已取消
      }
      const colorMap = {
        paid: 'success',
        unpay: 'warning',
        canceld: 'primary'
      }
      return type == 'color' ? colorMap[value] : cnUserData[value]
    },
    serviceNameFilter
  },
  computed: {
    userData() {
      return this.$store.state && this.$store.state.app && this.$store.state.app.userData
    }
  },
  created() {
    if (this.userData.accountCategory === 'Tenant') {
      this.getUserList()
    } else {
      this.searchConfigs.pop()
    }
    getItems({
      page: 1,
      rows: 9999
    }).then(data => {
      if (data.success) {
        this.codeList = data.data.rows
        this.searchConfigs[1].data = data.data.rows.map(item => {
          return {
            id: item.code,
            name: item.name
          }
        })
      }
    })
  },
  methods: {
    async getUserList() {
      const res = await getUser({ page: 1, rows: 9999 })
      if (res.success) {
        this.searchConfigs[4].data = res.data.rows
      }
    },
    getTenantList() {
      const obj = {
        simple: true
      }
      if (this.$route.path.indexOf('/bills/tenant') > -1) {
        obj.params = this.$tools.handleSearchParam({
          managerId: this.userData.id
        })
      }
      getTenant(obj).then(data => {
        if (data.success) {
          this.searchConfigs[4].data = data.data.rows
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getDetail(id) {
      getBillsDetail(id).then(data => {
        if (data.success) {
          this.detailFlag = true
          this.detailData = data.data
          this.itemParams.params = this.$tools.handleSearchParam({
            billId: this.detailData.id
          })
          this.paymentsParams.params = this.$tools.handleSearchParam({
            billId: this.detailData.id
          })
          this.getItemList()
          this.getPaymentsList()
        }
      })
    },
    getItemList() {
      getBillsItems(this.itemParams).then(data => {
        if (data.success) {
          this.itemList = data.data.rows
          this.itemList.forEach(item => {
            item.resource = JSON.parse(item.resource)
            // 检查item.ip是否存在且类型为字符串，确保可以安全地调用JSON.parse
            if (item.ip && typeof item.ip === 'string') {
              try {
                // 尝试解析并安全获取第一个元素的address属性
                item.ip = JSON.parse(item.ip)[0]?.address || ''
              } catch (e) {
                // 处理JSON解析失败的情况
                item.ip = '--' // 或者设置一个默认值
              }
            } else {
              // 如果item.ip不是字符串或者不存在，则设置一个默认值
              item.ip = '--'
            }
          })
          this.itemTotal = data.data.total
        }
      })
    },
    getPaymentsList() {
      getPayments(this.paymentsParams).then(data => {
        if (data.success) {
          this.paymentsList = data.data.rows
          this.paymentsTotal = data.data.total
        }
      })
    },
    getList() {
      this.loading = true
      getBills(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    }
  }
}
</script>
<style scoped>
.key-name {
  display: inline-block;
  width: 120px;
  text-align: right;
  margin-bottom: 10px;
}
.tenant-name {
  display: block;
  font-size: 30px;
  margin-left: 50px;
}
.count {
  font-size: 60px;
  font-weight: bolder;
  margin-left: 50px;
}
</style>
