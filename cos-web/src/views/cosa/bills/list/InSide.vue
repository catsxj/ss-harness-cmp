<template>
  <div>
    <AdvanceTable :card-border="false" :beforeSearch="beforeSearch" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll">
      <template v-slot:action>
        <el-button @click="exportData()" slot="operate" icon="el-icon-download">导出</el-button>
        <el-button type="primary" @click="handleAllRules" slot="operate" :disabled="selectList <= 0">批量设置分摊规则</el-button>
        <el-button type="primary" @click="handleContractDiscount">资源池折扣设置</el-button>
        <el-tag style="margin-left: 10px; font-weight: 600; font-size: 14px" effect="plain">账单总额：{{ allMoney }} 元</el-tag>
      </template>
      <template #month="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #chargeMode="val">
        {{ val | chargeMode }}
      </template>
      <template #serviceName="val, record">
        {{ val | serviceNameFilter(record) }}
      </template>
      <template #isAllocation="val">
        {{ val ? '是' : '否' }}
      </template>
      <template #status="status">
        <status-icon :type="status | statusFilter('color')">
          {{ status | statusFilter('status') }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleRules(record)">设置分摊规则</el-button>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :title="detailData.sn" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="账期">{{ detailData.month }}</common-detail-item>
        <common-detail-item label="资源类型">{{ detailData.serviceName | serviceNameFilter(detailData.serviceName) }}</common-detail-item>
        <common-detail-item label="资源池">{{ detailData.poolGroupName }}</common-detail-item>
        <common-detail-item label="是否分摊">{{ detailData.isAllocation ? '是' : '否' }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detailData.tenantName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel + '主体'">{{ detailData.projectName }}</common-detail-item>
        <common-detail-item label="应付金额">{{ detailData.money }}</common-detail-item>
        <common-detail-item label="折扣系数">{{ detailData.discount }}</common-detail-item>
        <common-detail-item label="实付金额">{{ detailData.discountMoney }}</common-detail-item>
      </template>
      <el-tabs value="projects">
        <el-tab-pane :label="'分摊' + $store.getters.systemConfig.projectConfigLabel" name="projects">
          <basic-table :data="allocatedList" :params="allocatedParams" :get-list="getAllocatedList" :total="allocatedTotal">
            <el-table-column label="序号" prop="" show-overflow-tooltip type="index"> </el-table-column>
            <el-table-column :label="$store.getters.systemConfig.projectConfigLabel + '名称'" prop="projectName" show-overflow-tooltip> </el-table-column>
            <el-table-column :label="$store.getters.systemConfig.projectConfigLabel + '编码'" prop="projectCode" show-overflow-tooltip> </el-table-column>
            <el-table-column label="组织机构" prop="departName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="分摊系数(%)" prop="allocationCoefficient" show-overflow-tooltip> </el-table-column>
            <el-table-column label="分摊金额(元)" prop="money" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单开始时间" prop="startTime" show-overflow-tooltip> </el-table-column>
            <el-table-column label="账单结束时间" prop="endTime" show-overflow-tooltip> </el-table-column>
          </basic-table>
        </el-tab-pane>
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
    <exportDialog :dialog="exportDialog" v-if="exportDialog.visible"></exportDialog>
    <contractDiscount :dialog="contractDiscountDialog" v-if="contractDiscountDialog.visible" ref="contractDiscountDialog" @getList="getList"></contractDiscount>
    <setAllocationRules :dialog="setAllocationRules" v-if="setAllocationRules.visible" ref="setAllocationRules" @getList="getList"></setAllocationRules>
  </div>
</template>

<script>
import { getBills, getBillsDetail, getBillsItems, getPayments, exportBill, getAllocated, getBillMoney } from 'services/services/bill'
import { getTenant, getUser } from 'services/system/tenant'
import { getItems } from 'services/services/catelog'
import setAllocationRules from './setAllocationRules.vue'
import contractDiscount from './contractDiscount.vue'
import { getProject } from 'services/system/project'
import { getPool } from 'services/platform/pool'
import exportDialog from './exportDialog.vue'

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

const orderStatusList = {
  unpay: '未支付',
  paid: '已支付',
  paying: '支付中',
  canceld: '已取消'
}

export default {
  components: { setAllocationRules, contractDiscount, exportDialog },

  data() {
    return {
      columns: [
        {
          type: 'selection',
          selectable: this.selectable
        },
        {
          label: '账期',
          prop: 'month',
          scopedSlots: { customRender: 'month' }
        },
        {
          label: '资源类型',
          prop: 'serviceName',
          scopedSlots: { customRender: 'serviceName' }
        },
        {
          label: '资源池',
          prop: 'poolGroupName'
        },
        {
          label: '流水号',
          prop: 'orderSn'
        },
        {
          label: '计费类型',
          prop: 'chargeMode',
          scopedSlots: { customRender: 'chargeMode' }
        },
        {
          label: '是否分摊',
          prop: 'isAllocation',
          scopedSlots: { customRender: 'isAllocation' }
        },
        {
          label: '账单状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '订单编号',
          prop: 'sn'
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel + '主体',
          prop: 'projectName'
        },
        {
          label: '所属用户',
          prop: 'userName'
        },
        {
          label: '应付金额（元）',
          prop: 'money'
        },
        {
          label: '折扣系数',
          prop: 'discount'
        },
        {
          label: '实付金额（元）',
          prop: 'discountMoney'
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
      allocatedList: [],
      itemTotal: 0,
      allocatedTotal: 0,
      itemParams: {
        page: 1,
        rows: 10
      },
      allocatedParams: {
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
        {
          type: 'Select',
          value: 'serviceCode',
          label: '资源类型',
          data: []
        },
        {
          type: 'Select',
          value: 'poolGroupId',
          label: '资源池',
          data: [],
          service: {
            api: getPool,
            params: {
              page: 1,
              rows: 9999
            },
            attr: 'data.rows'
          }
        },
        { type: 'DateRange', label: '', value: 'gmtCreate' },
        { label: '订单编号', value: 'sn', type: 'Input' },
        {
          type: 'Select',
          value: 'tenantId',
          label: '所属租户',
          data: [],
          service: {
            api: getTenant,
            params: {
              simple: true
            },
            attr: 'data.rows'
          }
        },
        {
          type: 'Select',
          value: 'projectId',
          label: this.$store.getters.systemConfig.projectConfigLabel + '主体',
          props: { value: 'id', label: 'name' },
          data: [],
          service: {
            api: getProject,
            params: {
              page: 1,
              rows: 9999
            },
            attr: 'data.rows'
          }
        },
        {
          type: 'Select',
          value: 'userId',
          label: '所属用户',
          data: [],
          service: {
            api: getUser,
            params: {
              simple: true
            },
            attr: 'data.rows'
          }
        },
        {
          type: 'Select',
          value: 'isAllocation',
          label: '是否分摊',
          data: [
            {
              name: '是',
              id: true
            },
            {
              name: '否',
              id: 'null'
            }
          ]
        }
      ],
      searchParams: {
        params: []
      },
      idList: [],
      selectList: [],
      setAllocationRules: {
        visible: false
      },
      contractDiscountDialog: {
        visible: false
      },
      selectFlag: true,
      allMoney: 0,
      exportDialog: {
        visible: false,
        flag: false
      }
    }
  },
  watch: {
    $route: function (val, oldVal) {
      this.handleSearch()
      // this.getTenantList()
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
      return this.$store.state.app.userData
    }
  },
  created() {
    this.handleSearch()
    // this.getTenantList()
    getItems({
      page: 1,
      rows: 9999
    }).then((data) => {
      if (data.success) {
        this.searchConfigs[0].data = data.data.rows.map((item) => {
          return {
            id: item.code,
            name: item.name
          }
        })
      }
    })
  },
  methods: {
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    beforeSearch({ listQuery }) {
      if (!listQuery) {
        return
      }
      this.searchParams.params = this.$tools.handleSearchParam({
        'serviceCode:EQ': listQuery.serviceCode,
        'sn:LK': listQuery.sn,
        'gmtCreate:RANGE': listQuery.gmtCreate,
        'tenantId:EQ': listQuery.tenantId
      })
    },
    exportData() {
      this.exportDialog.visible = true
      this.exportDialog.flag = false
      this.exportDialog.params = { ...this.searchParams, ...this.params }
      // const params = { ...this.searchParams, ...this.params }
      // exportBill(params)
    },
    // getTenantList() {
    //   const obj = {
    //     simple: true
    //   }
    //   if (this.$route.path.indexOf('/bills/tenant') > -1) {
    //     obj.params = this.$tools.handleSearchParam({
    //       managerId: this.userData.id
    //     })
    //   }
    //   getTenant(obj).then((data) => {
    //     if (data.success) {
    //       this.searchConfigs[3].data = data.data.rows
    //     }
    //   })
    // },
    goBack() {
      this.detailFlag = false
    },
    getDetail(id) {
      getBillsDetail(id).then((data) => {
        if (data.success) {
          this.detailFlag = true
          this.detailData = data.data
          this.itemParams.params = this.$tools.handleSearchParam({
            billId: this.detailData.id
          })
          this.allocatedParams.params = this.$tools.handleSearchParam({
            billId: this.detailData.id,
            type: 'inside'
          })
          this.paymentsParams.params = this.$tools.handleSearchParam({
            billId: this.detailData.id
          })
          this.getItemList()
          this.getAllocatedList()
          this.getPaymentsList()
        }
      })
    },
    getItemList() {
      getBillsItems(this.itemParams).then((data) => {
        if (data.success) {
          this.itemList = data.data.rows
          this.itemList.forEach((item) => {
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
    getAllocatedList() {
      getAllocated(this.allocatedParams).then((data) => {
        if (data.success) {
          this.allocatedList = data.data.rows
          this.allocatedTotal = data.data.total
        }
      })
    },
    getPaymentsList() {
      getPayments(this.paymentsParams).then((data) => {
        if (data.success) {
          this.paymentsList = data.data.rows
          this.paymentsTotal = data.data.total
        }
      })
    },
    getList() {
      this.setAllocationRules.visible = false
      this.contractDiscountDialog.visible = false
      const params = { ...this.params }
      const arr = JSON.parse(this.params.params)
      if (arr.length > 0 && arr[0].param.isAllocation === 'null') {
        params.params = JSON.stringify([{ param: { isAllocation: 'null' }, sign: 'NUL' }])
      }
      this.loading = true
      getBills(params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
      this.getBillMoney(params)
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        serviceCode: this.listQuery.serviceCode,
        orderSn: this.listQuery.orderSn,
        tenantId: this.listQuery.tenantId,
        'gmtCreate:RANGE': this.listQuery.date
      })
      this.getList()
    },
    // 单选
    handleSelectItem(selection, row) {
      this.selectList = selection
      this.refreshId()
    },
    // 全选
    handleSelectAll(selection) {
      this.selectList = selection
      this.refreshId()
    },
    // 批量设置分摊规则
    handleAllRules() {
      this.setAllocationRules.visible = true
      this.setAllocationRules.data = this.idList
      this.setAllocationRules.title = '批量设置分摊规则'
      this.setAllocationRules.type = 'inside'
      this.setAllocationRules.action = 'all'
      this.setAllocationRules.list = this.selectList
    },
    // 单个设置规则
    handleRules(data) {
      console.log(data)
      this.setAllocationRules.visible = true
      this.setAllocationRules.data = data.id
      this.setAllocationRules.title = '设置分摊规则'
      this.setAllocationRules.type = 'inside'
      this.setAllocationRules.action = 'single'
      this.setAllocationRules.list = [data]
    },
    // 资源池折扣设置
    handleContractDiscount() {
      this.contractDiscountDialog.visible = true
    },
    selectable(row, index) {
      if (this.selectList.length === 0) return true
      if (this.selectList[0].projectName === row.projectName) {
        return true
      } else {
        return false
      }
    },
    getBillMoney(params) {
      getBillMoney(params).then((res) => {
        if (res.success) {
          this.allMoney = res.data.totalMoney ? res.data.totalMoney : 0
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
.el-tag--small {
  line-height: 32px;
  height: 32px;
}
</style>
