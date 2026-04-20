<template>
  <div>
    <AdvanceTable ref="table" :card-border="false" :before-search="beforeSearch" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll">
      <template v-slot:action>
        <el-button type="" icon="el-icon-upload" @click="sync">同步</el-button>
        <el-button icon="el-icon-download" @click="exportData(true)">导出</el-button>
        <el-button type="primary" @click="handleAllRules" slot="operate" :disabled="selectList <= 0">批量设置分摊规则</el-button>
        <el-tag style="margin-left: 10px; font-weight: 600; font-size: 14px" effect="plain">账单总额：{{ allMoney }} 元</el-tag>
      </template>
      <template #productName="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #chargeMode="val">
        {{ val | chargeMode }}
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
        <el-button type="text" @click="handleBatchSetRules(record)">设置分摊规则</el-button>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :title="detail.orderSn" @goBack="detailFlag = false">
      <template v-slot:item_container>
        <common-detail-item label="资源名称">{{ detail.productName }}</common-detail-item>
        <common-detail-item label="月份">{{ detail.month }}</common-detail-item>
        <common-detail-item label="资源类型">{{ detail.productName }}</common-detail-item>
        <common-detail-item label="订购ID">{{ detail.orderSn }}</common-detail-item>
        <common-detail-item label="资源标识">{{ detail.productCode }}</common-detail-item>
        <common-detail-item label="实付金额（元）">{{ detail.money }}</common-detail-item>
        <common-detail-item label="开始时间">{{ detail.feeBeginTime }}</common-detail-item>
        <common-detail-item label="结束时间">{{ detail.feeEndTime }}</common-detail-item>
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
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="账单明细" name="items">
          <basic-table :data="[detail]" v-if="detail.vendorType == 'HUAWEI'">
            <el-table-column label="流水号" prop="orderSn" show-overflow-tooltip> </el-table-column>
            <el-table-column label="区域" prop="regionName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="官网价" prop="pretaxGrossAmount" show-overflow-tooltip> </el-table-column>
            <el-table-column label="优惠金额" prop="roundDownDiscount" show-overflow-tooltip> </el-table-column>
            <el-table-column label="现金券抵扣" prop="deductedByCoupons" show-overflow-tooltip></el-table-column>
            <el-table-column label="代金券抵扣" prop="deductedByCashCoupons" show-overflow-tooltip> </el-table-column>
            <el-table-column label="储值卡抵扣" prop="deductedByPrepaidCard" show-overflow-tooltip></el-table-column>
            <el-table-column label="支付金额" prop="money" show-overflow-tooltip></el-table-column>
            <el-table-column label="欠费金额" prop="outstandingAmount" show-overflow-tooltip></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
          <basic-table :data="[detail]" v-else-if="detail.vendorType == 'ALIYUN'">
            <el-table-column label="流水号" prop="orderSn" show-overflow-tooltip></el-table-column>
            <el-table-column label="原价" prop="pretaxGrossAmount" show-overflow-tooltip></el-table-column>
            <el-table-column label="优惠金额" prop="invoiceDiscount" show-overflow-tooltip></el-table-column>
            <el-table-column label="优惠券抵扣" prop="deductedByCoupons" show-overflow-tooltip></el-table-column>
            <el-table-column label="抹零金额" prop="roundDownDiscount" show-overflow-tooltip></el-table-column>
            <el-table-column label="应付金额" prop="pretaxAmount" show-overflow-tooltip></el-table-column>
            <el-table-column label="现金支付" prop="money" show-overflow-tooltip></el-table-column>
            <el-table-column label="代金券抵扣" prop="deductedByCashCoupons" show-overflow-tooltip></el-table-column>
            <el-table-column label="储值卡支付金额" prop="deductedByPrepaidCard" show-overflow-tooltip></el-table-column>
            <el-table-column label="未结清金额或信用结算金额" prop="outstandingAmount" show-overflow-tooltip></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
          <basic-table :data="[detail]" v-else>
            <el-table-column label="流水号" prop="orderSn" show-overflow-tooltip> </el-table-column>
            <el-table-column label="现金券扣除" prop="deductedByCashCoupons" show-overflow-tooltip> </el-table-column>
            <el-table-column label="优惠券扣除" prop="deductedByCoupons" show-overflow-tooltip> </el-table-column>
            <el-table-column label="预付卡扣款" prop="deductedByPrepaidCard" show-overflow-tooltip> </el-table-column>
            <el-table-column label="发票折扣" prop="invoiceDiscount" show-overflow-tooltip> </el-table-column>
            <el-table-column label="未付金额" prop="outstandingAmount" show-overflow-tooltip></el-table-column>
            <el-table-column label="支付金额" prop="money" show-overflow-tooltip></el-table-column>
            <el-table-column label="税前金额" prop="pretaxAmount" show-overflow-tooltip></el-table-column>
            <el-table-column label="税前利润" prop="pretaxGrossAmount" show-overflow-tooltip></el-table-column>
            <el-table-column label="四舍五入折扣" prop="roundDownDiscount" show-overflow-tooltip></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <ImportDialog :dialog="importDialog" v-if="importDialog.visible" ref="importDialog"></ImportDialog>
    <setAllocationRules :dialog="setAllocationRules" v-if="setAllocationRules.visible" ref="setAllocationRules" @getList="getList"></setAllocationRules>
  </div>
</template>

<script>
import { getCloudBills, syncCloudBills, getCloudBillsQuery, getAllocated, getCloudMoney } from 'services/services/bill'
import { getItems } from 'services/services/catelog'
import { conditionCloudVendor } from 'services/platform/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import ImportDialog from './importDialog.vue'
import { downloadFile } from 'utils'
// import ImportData from '@/common/components/import-data/index.vue'
import setAllocationRules from './setAllocationRules.vue'

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
  components: { ImportDialog, setAllocationRules },
  mixins: [webSocket],
  data() {
    return {
      columns: [
        {
          type: 'selection'
        },
        {
          label: '资源名称',
          prop: 'productName',
          scopedSlots: { customRender: 'productName' }
        },
        {
          label: '平台',
          prop: 'vendorName'
        },
        {
          label: '账期',
          prop: 'month',
          scopedSlots: { customRender: 'month' }
        },
        {
          label: '分摊状态',
          prop: 'isAllocation',
          scopedSlots: { customRender: 'isAllocation' }
        },
        {
          label: '资源类型',
          prop: 'productName'
        },
        {
          label: '订购ID',
          prop: 'orderSn'
        },
        {
          label: '资源标识ID',
          prop: 'productCode'
        },
        {
          label: '实付金额（元）',
          prop: 'money'
        },
        {
          label: '分摊' + this.$store.getters.systemConfig.projectConfigLabel + '数量',
          prop: 'projectNum'
        },
        {
          label: '开始时间',
          prop: 'feeBeginTime'
        },
        {
          label: '结束时间',
          prop: 'feeEndTime'
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
        productName: '',
        vendorId: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      detail: {},
      allocatedList: [],
      allocatedTotal: 0,
      allocatedParams: {
        page: 1,
        rows: 10
      },
      detailFlag: false,
      importDialog: {
        visible: false
      },
      searchConfigs: [
        { type: 'DateRange', label: '账期', value: 'gmtCreate' },
        { label: '订购ID', value: 'orderSn', type: 'Input' },
        { label: '资源名称', value: 'productName', type: 'Input' },
        { label: '资源类型', value: 'productName', type: 'Input' },
        {
          type: 'Select',
          value: 'isAllocation',
          label: '分摊状态',
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
        },
        { label: '资源标识ID', value: 'productCode', type: 'Input' }
        // {
        //   type: 'Select',
        //   value: '',
        //   label: this.$store.getters.systemConfig.projectConfigLabel,
        //   data: []
        // }
      ],
      selectList: [],
      idList: [],
      setAllocationRules: {
        visible: false
      },
      allMoney: 0
    }
  },
  watch: {
    // $route: function(val, oldVal) {
    //   this.handleSearch()
    // }
    vendorId(val, oldVal) {
      this.listQuery.productName = ''
    }
  },
  computed: {
    userData() {
      return this.$store.state.app.userData
    },
    vendorId() {
      return this.listQuery.vendorId
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
    }
  },
  created() {
    // this.handleSearch()
    getItems({
      page: 1,
      rows: 9999
    }).then((data) => {
      if (data.success) {
        this.codeList = data.data.rows
      }
    })
    this.getCloud()
  },
  methods: {
    beforeSearch({ handleSearch, listQuery }) {
      if (listQuery) {
        this.listQuery = listQuery
      }
      if (listQuery && listQuery.vendorId) {
        this.getCloudBillsQuery(listQuery.vendorId)
      }
    },
    getCloudBillsQuery(vendorId) {
      if (!vendorId) {
        return
      }
      getCloudBillsQuery({
        vendorId: vendorId
      }).then((data) => {
        if (data.success) {
          this.searchConfigs[2].data = data.data.map((item) => {
            const obj = {
              id: item.value,
              name: item.key
            }
            return obj
          })
        }
      })
    },
    importData() {
      this.importDialog = {
        visible: true,
        vendorId: this.vendorId
      }
    },
    exportData() {
      this.$refs.table.handleSearch()
      downloadFile('/ims/v1/cloud/bills/export', {
        params: this.$refs.table.params.params
      })
    },
    getCloud() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'listByTypes',
          // types: ['HUAWEI', 'ALIYUN']
          types: ['OPENSTACK', 'VMWARE', 'CNWARE', 'EASYSTACK', 'ARCHEROS', 'CLOUDTOWER', 'USPHERE']
        })
      }).then((data) => {
        if (data.success) {
          this.searchConfigs[0].data = data.data
        }
      })
    },
    getDetail(data) {
      this.detail = data
      this.detailFlag = true
      this.allocatedParams.params = this.$tools.handleSearchParam({
        billId: this.detail.id,
        type: 'outside'
      })
      this.getAllocatedList()
    },
    sync() {
      syncCloudBills().then((data) => {
        if (data.success) {
          this.$message.success(data.message)
        }
      })
    },
    getList() {
      this.loading = true
      const params = { ...this.params }
      const arr = JSON.parse(this.params.params)
      if (arr.length > 0) {
        arr.forEach((item) => {
          // 处理日期参数转换
          if (item.param.gmtCreate) {
            // 如果是GET，设置为开始时间
            if (item.sign === 'GET') {
              item.param.feeBeginTime = item.param.gmtCreate
              delete item.param.gmtCreate
            }
            // 如果是LET，设置为结束时间
            if (item.sign === 'LET') {
              item.param.feeEndTime = item.param.gmtCreate
              delete item.param.gmtCreate
            }
          } else if (item.param.isAllocation === 'null') {
            item.param.isAllocation = null
            item.sign = 'NUL'
          }
        })
      }

      // if (arr.length > 0 && arr[0].param.isAllocation === 'null') {
      //   params.params = JSON.stringify([{ param: { isAllocation: 'null' }, sign: 'NUL' }])
      // } else {
      //   params.params = JSON.stringify(arr) // 将处理后的arr赋值给params
      // }
      params.params = JSON.stringify(arr)
      getCloudBills(params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
      this.getCloudMoney(this.params)
    },
    getAllocatedList() {
      getAllocated(this.allocatedParams).then((data) => {
        if (data.success) {
          this.allocatedList = data.data.rows
          this.allocatedTotal = data.data.total
        }
      })
    },
    // handleSearch() {
    //   this.params.page = 1
    //   this.params.params = this.$tools.handleSearchParam({
    //     vendorId: this.listQuery.vendorId,
    //     orderSn: this.listQuery.orderSn,
    //     productName: this.listQuery.vendorId ? this.listQuery.productName : '',
    //     'feeBeginTime:RANGE': this.listQuery.date
    //   })
    //   this.getList()
    // },
    onmessage(data) {
      if (data.operate.indexOf('cloudBill') !== -1) {
        this.getList()
      }
    },
    // 设置单个规则
    handleBatchSetRules(data) {
      this.setAllocationRules.visible = true
      this.setAllocationRules.data = data
      this.setAllocationRules.title = '设置分摊规则'
      this.setAllocationRules.type = 'single'
    },
    // 批量设置分摊规则
    handleAllRules() {
      this.setAllocationRules.visible = true
      this.setAllocationRules.data = this.idList
      this.setAllocationRules.title = '批量设置分摊规则'
      this.setAllocationRules.type = 'all'
    },

    // 单选
    handleSelectItem(selection, row) {
      console.log(selection, row)
      this.selectList = selection
      this.refreshId()
    },
    // 全选
    handleSelectAll(selection) {
      this.selectList = selection
      this.refreshId()
    },
    refreshId() {
      this.idList = []
      this.selectList.forEach((item) => {
        this.idList.push(item.id)
      })
    },
    getCloudMoney(params) {
      getCloudMoney(params).then((res) => {
        if (res.success) {
          this.allMoney = res.data.totalMoney ? res.data.totalMoney : 0
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
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
// ::v-deep #operate-btn-group {
//   align-items: baseline;
//   .el-button {
//     margin-top: 5px;
//   }
// }
.el-tag--small {
  line-height: 32px;
  height: 32px;
}
</style>
