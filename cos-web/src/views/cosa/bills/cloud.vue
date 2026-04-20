<template>
  <el-card class="wrapper">
    <!-- <el-form :inline="true" slot="header">
      <el-form-item>
        <el-select v-model="listQuery.vendorId" @change="getCloudBillsQuery" placeholder="请选择平台" clearable>
          <el-option v-for="(item, index) in cloudList" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="listQuery.productName" placeholder="请选择类型" clearable>
          <el-option v-for="(item, index) in queryTypeList" :key="index" :label="item.value" :value="item.key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="listQuery.orderSn" placeholder="订单号"></el-input>
      </el-form-item>
      <el-form-item class="m-b-none">
        <el-date-picker v-model="listQuery.date" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="primary" icon="el-icon-sync" @click="sync">同步</el-button> -->
    <!-- <el-button type="ghost" @click="importData" :disabled="!listQuery.vendorId">
          <Icon type="icon-shangchuan" /> 导入
        </el-button> -->
    <!-- <el-button type="ghost" @click="exportData(true)" icon="el-icon-download" :disabled="!listQuery.vendorId">
          导出
        </el-button>
      </el-form-item>
    </el-form> -->
    <AdvanceTable ref="table" title="外部账单列表" :card-border="false" :before-search="beforeSearch" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <!-- <ImportData url="/api/sms/v1/tenants/import" @getData="getList" template-url="/sms/v1/tenants/import/template"></ImportData> -->
        <el-button type="" icon="el-icon-upload" @click="sync">同步</el-button>
        <el-button icon="el-icon-download" @click="exportData(true)">导出</el-button>
      </template>
      <template #orderSn="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #chargeMode="val">
        {{ val | chargeMode }}
      </template>
      <template #status="status">
        <status-icon :type="status | statusFilter('color')">
          {{ status | statusFilter('status') }}
        </status-icon>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :title="detail.orderSn" @goBack="detailFlag = false">
      <template v-slot:item_container>
        <common-detail-item label="账期">{{ detail.month }}</common-detail-item>
        <common-detail-item label="流水号">{{ detail.orderSn }}</common-detail-item>
        <common-detail-item label="账单状态">{{ detail.status | billStatusFilter }}</common-detail-item>
        <common-detail-item label="账单金额">{{ detail.money }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.feeBeginTime }}</common-detail-item>
        <common-detail-item label="结束时间">{{ detail.feeEndTime }}</common-detail-item>
      </template>
      <el-tabs value="items">
        <el-tab-pane label="账单明细" name="items">
          <basic-table :data="[detail]" v-if="detail.vendorType == 'HUAWEI'">
            <el-table-column label="流水号" prop="orderSn" show-overflow-tooltip> </el-table-column>
            <el-table-column label="区域" prop="regionName" show-overflow-tooltip> </el-table-column>
            <el-table-column label="官网价" prop="pretaxGrossAmount" show-overflow-tooltip> </el-table-column>
            <el-table-column label="优惠金额" prop="roundDownDiscount" show-overflow-tooltip> </el-table-column>
            <el-table-column label="代金券抵扣" prop="deductedByCashCoupons" show-overflow-tooltip> </el-table-column>
            <el-table-column label="现金券抵扣" prop="deductedByCoupons" show-overflow-tooltip></el-table-column>
            <el-table-column label="储值卡抵扣" prop="deductedByPrepaidCard" show-overflow-tooltip></el-table-column>
            <el-table-column label="支付金额" prop="money" show-overflow-tooltip></el-table-column>
            <el-table-column label="欠费金额" prop="outstandingAmount" show-overflow-tooltip></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
          <basic-table :data="[detail]" v-else-if="detail.vendorType == 'ALIYUN'">
            <el-table-column label="流水号" prop="orderSn" show-overflow-tooltip></el-table-column>
            <el-table-column label="原价" prop="pretaxGrossAmount" show-overflow-tooltip></el-table-column>
            <el-table-column label="优惠金额" prop="invoiceDiscount" show-overflow-tooltip></el-table-column>
            <el-table-column label="抹零金额" prop="roundDownDiscount" show-overflow-tooltip></el-table-column>
            <el-table-column label="应付金额" prop="pretaxAmount" show-overflow-tooltip></el-table-column>
            <el-table-column label="现金支付" prop="money" show-overflow-tooltip></el-table-column>
            <el-table-column label="优惠券抵扣" prop="deductedByCoupons" show-overflow-tooltip></el-table-column>
            <el-table-column label="储值卡支付金额" prop="deductedByPrepaidCard" show-overflow-tooltip></el-table-column>
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
  </el-card>
</template>

<script>
import { getCloudBills, syncCloudBills, getCloudBillsQuery } from 'services/services/bill'
import { getItems } from 'services/services/catelog'
import { conditionCloudVendor } from 'services/platform/index'
import webSocket from '@/common/mixins/getGlobalSocket'
import ImportDialog from './importDialog.vue'
import { downloadFile } from 'utils'
// import ImportData from '@/common/components/import-data/index.vue'

const columns = [
  {
    label: '流水号',
    prop: 'orderSn',
    scopedSlots: { customRender: 'orderSn' }
  },
  {
    label: '平台',
    prop: 'vendorName'
  },
  {
    label: '账期',
    prop: 'month'
  },
  {
    label: '资源',
    prop: 'productName'
  },
  {
    label: '资源详情',
    prop: 'productDetail'
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
    label: '账单金额（元）',
    prop: 'money'
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
  }
]
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
  components: { ImportDialog },
  mixins: [webSocket],
  data() {
    return {
      columns,
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
      detailFlag: false,
      importDialog: {
        visible: false
      },
      searchConfigs: [
        {
          type: 'Select',
          value: 'vendorId',
          label: '所属平台',
          data: []
        },
        { label: '流水号', value: 'orderSn', type: 'Input' },
        {
          type: 'Select',
          value: 'productName',
          label: '资源',
          data: []
        },
        { type: 'DateRange', label: '', value: 'gmtCreate' }
      ]
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
          condition: 'listSimpleTypes',
          types: ['HUAWEI', 'ALIYUN', 'AZURE']
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
      getCloudBills(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
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
::v-deep #operate-btn-group {
  align-items: baseline;
  .el-button {
    margin-top: 5px;
  }
}
</style>
