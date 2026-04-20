<template>
  <div class="detail">
    <common-detail class="common" :title="detailData.sn" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="订单编号">{{ detailData.sn }}</common-detail-item>
        <common-detail-item label="资源类型">{{ detailData.serviceName | serviceNameFilter(detailData) }}</common-detail-item>
        <common-detail-item label="订单类型">{{ typeMap[detailData.type] || detailData.type }}</common-detail-item>
        <common-detail-item label="收费模式">{{ chargeMode[detailData.chargeMode] || detailData.chargeMode }}</common-detail-item>
        <common-detail-item label="订单状态">{{ orderStatusList[detailData.orderStatus] || detailData.orderStatus }}</common-detail-item>
        <common-detail-item label="所属租户">{{ detailData.tenantName }}</common-detail-item>
        <common-detail-item label="所属用户">{{ detailData.userName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
        <!-- 从自服务发起的云主机申请，变更，退订 展示关联工单 -->
        <!-- <common-detail-item label="关联工单" v-if="detailData.workOrderFlowNo"><el-button :loading="relationBtnloading" @click="openRelationWorkOrder" type="text">查看关联工单</el-button></common-detail-item> -->
      </template>
      <el-tabs value="orderDetail" @tab-click="handleDetailTab">
        <el-tab-pane name="orderDetail">
          <span slot="label">订单详情 </span>
          <AdvanceTable class="order-table" :card-border="false" :show-tools="false" :data="orderDetailList" :params="orderParams" :columns="orderColumns" :get-list="getDetailInfo" :total="orderTotal" :loading="loading">
            <template #duration="duration">
              {{ durationMode(JSON.parse(duration)) }}
            </template>
            <template #resourceName="val, record">
              <template v-if="record.resourceType === '云主机'">
                <span v-if="record.serverIsExit">
                  <router-link class="detail-href" :to="{ path: '/cloud_resource/ecs', query: { resourceId: record.resourceId } }">
                    {{ val }}
                  </router-link>
                </span>
                <div v-else-if="['UnsubscribeSuccess', 'UnsubscribeFailure', 'OpenedSuccess', 'Changing', 'ChangeSuccess', 'ChangeFailure', 'Extensioning', 'ExtensionSuccess', 'ExtensionFailure'].includes(record.status) && val">
                  {{ val }}
                  <div class="text-danger">（云主机不属于此租户或已删除）</div>
                </div>
              </template>
              <span v-else>{{ val }}</span>
            </template>
            <template #ip="val, record">
              <div v-if="record.vendorType == 'OPENSTACK' || record.vendorType == 'EASYSTACK' || record.vendorType == 'MANAGEONE' || record.vendorType == 'FUSIONCLOUD'">
                <span v-for="item in record.privateIpsList" :key="item.networkId">
                  <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
                </span>
              </div>
              <div v-else-if="record.vendorType == 'VMWARE' || record.vendorType == 'INSPURRAIL' || record.vendorType == 'CNWARE' || record.vendorType == 'ZSTACK' || record.vendorType == 'CECSTACK' || record.vendorType == 'H3C' || record.vendorType == 'SANGFOR' || record.vendorType == 'CLOUDTOWER'">
                <div v-for="item in record.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
              </div>
              <div v-else-if="record.vendorType == 'HUAWEI' || record.vendorType == 'HCSO'">
                <div v-for="item in record.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
              </div>
              <div v-else-if="record.vendorType == 'QCLOUD'">
                <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.address }}</div>
              </div>
              <div v-else-if="record.vendorType == 'AZURE' || record.vendorType == 'AWS'">
                <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
              </div>
              <div v-else-if="record.vendorType == 'JDCLOUD'">
                <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item }}</div>
              </div>
              <div v-else-if="record.vendorType == 'VOLCENGINE'">
                <!-- <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
                <div v-if="JSON.parse(record.privateIps)[0].primaryIpAddress">{{ JSON.parse(record.privateIps)[0].primaryIpAddress }}(内网)</div>
                <div v-if="JSON.parse(record.privateIps)[0].eipAddress">{{ JSON.parse(record.privateIps)[0].eipAddress }}(公网)</div>
              </div>
              <div v-else-if="record.vendorType == 'SMARTX'">
                <div>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</div>
              </div>
              <div v-else>
                <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
              </div>
              <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
              <div v-if="record.vendorType == 'CNWARE' || record.vendorType == 'CECSTACK'">
                <div v-for="(item, index) in record.publicIps" :key="index">(公网){{ item.address }}</div>
              </div>
            </template>
            <template #time="val, record">
              {{ !record.effectiveTime && !record.expiredTime ? '--' : '' }}
              <p>{{ record.effectiveTime }}</p>
              <p>{{ record.expiredTime }}</p>
            </template>
            <template #resourceStatus="status">
              <status-icon :type="status | resStatusFilter('color')">
                {{ status | resStatusFilter('status') }}
              </status-icon>
            </template>
            <template #elementList="elementList">
              <p style="margin: 0; padding: 0" v-for="item in elementList" :key="item">{{ item }}</p>
            </template>
            <template #basicPrice="basicPrice">
              {{ basicPrice !== null ? `￥${basicPrice}元` : `--` }}
            </template>
            <template #price="price">
              {{ price !== null && price !== undefined ? `￥${price}元` : `--` }}
            </template>
            <template #discountList="discountList">
              {{ discountList[0] }}
            </template>
            <template #finalPrice="finalPrice">
              {{ finalPrice !== null ? `￥${finalPrice}元` : `--` }}
            </template>
            <template #operate="val, record">
              <!-- 展示具体资源是只有云主机申请，并且只展示在云主机那个子单上 -->
              <el-button type="text" v-if="detailData.type === 'apply' && record.status === 'OpenedSuccess' && isServerServiceCode(record.serviceCode)" @click="openRelationVmDetail(record)">查看资源详情</el-button>
            </template>
          </AdvanceTable>
        </el-tab-pane>
        <el-tab-pane name="record">
          <span slot="label"> 账单记录 </span>
          <AdvanceTable class="bill-table" :card-border="false" :show-tools="false" :title="'账单金额汇总: ￥' + totalMoney + '元'" :data="billList" :search-configs="searchConfigs" :params="billParams" :columns="billColumns" :get-list="getBillList" :total="billTotal" :loading="loading">
            <template #status="status">
              {{ orderStatusList[status] || status }}
            </template>
            <template #chargeMode="mode">
              {{ chargeMode[mode] || mode }}
            </template>
            <template #money="money">
              {{ money !== null ? `￥${money}元` : `--` }}
            </template>
          </AdvanceTable>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <RelationWorkOrder v-if="relationWorkOrderDialog.visible" :dialogData="relationWorkOrderDialog"></RelationWorkOrder>
    <RelationVmDetail v-if="relationVmDetailDialog.visible" :dialogData="relationVmDetailDialog"></RelationVmDetail>
  </div>
</template>

<script>
import { getOrderDetail } from 'services/system/order'
import { getBills } from 'services/services/bill'
import { getFlowInstance, terminateInstance } from 'services/services/flow'
import RelationWorkOrder from './RelationWorkOrder.vue'
import RelationVmDetail from './RelationVmDetail.vue'
import { ServiceCodeMap } from 'views/resource-apply/data/EFCInit.js'
const orderStatusList = {
  unpay: '未支付', // 未支付
  paid: '已支付', // 已支付
  canceld: '已取消', // 已取消,
  audit: '审批中'
}

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

const serviceNameFilter = (val, record) => {
  if (!val && record.type === 'apply') return '云主机'
  if (!val && record.type === 'unsubscribe') return '资源退订'
  return val
}
export default {
  components: { RelationWorkOrder, RelationVmDetail },
  props: {
    config: {
      type: Object
    }
  },
  filters: {
    resStatusFilter(value, type) {
      const cnUserData = {
        OpenedSuccess: '开通成功',
        OpenedFailure: '开通失败',
        Opening: '正在开通',
        ChangeSuccess: '变更成功',
        ChangeFailure: '变更失败',
        Changing: '正在变更',
        UnsubscribeSuccess: '退订成功',
        UnsubscribeFailure: '退订失败',
        Unsubscribing: '正在退订',
        ExtensionSuccess: '延期成功',
        ExtensionFailure: '延期失败',
        Extensioning: '延期中',
        Abandoned: '已废弃',
        Canceld: '已取消',
        Termination: '已终止',
        Audit: '审批中'
      }
      const colorMap = {
        Opening: 'normal', // ing
        Changing: 'normal', // ing
        Unsubscribing: 'normal', // ing
        Extensioning: 'normal', // ing
        OpenedSuccess: 'success', // 成功
        ChangeSuccess: 'success', // 成功
        UnsubscribeSuccess: 'success', // 成功
        ExtensionSuccess: 'success', // 成功
        OpenedFailure: 'danger', // 失败
        ChangeFailure: 'danger', // 失败
        UnsubscribeFailure: 'danger', // 失败
        ExtensionFailure: 'danger', // 失败
        Abandoned: 'disabled', // 已废弃
        Canceld: 'warning', // 已取消
        Termination: '#72142a', // 已终止
        Audit: 'normal'
      }
      return type == 'color' ? colorMap[value] : cnUserData[value]
    },
    serviceNameFilter
  },
  computed: {
    durationMode() {
      return function (val) {
        if (val.mode === 'Hour') {
          return '后付费（按小时计费）'
        } else if (val.mode === 'Month') {
          return `预付费（按月计费）: ${val.amount}个月`
        } else if (val.mode === 'Year') {
          return `预付费（按年计费）: ${val.amount}年`
        }
      }
    }
  },
  data() {
    return {
      orderParams: {
        page: 1,
        rows: 10
      },
      orderColumns: [],
      billColumns: [
        {
          label: '账期',
          prop: 'month'
        },
        {
          label: '资源名称',
          prop: 'serviceName'
        },
        {
          label: '订单编号',
          prop: 'orderSn'
        },
        {
          label: '流水号',
          prop: 'sn'
        },
        {
          label: '账单状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '收费模式',
          prop: 'chargeMode',
          scopedSlots: { customRender: 'chargeMode' }
        },
        {
          label: '账单金额',
          prop: 'money',
          scopedSlots: { customRender: 'money' }
        },
        {
          label: '所属租户',
          prop: 'tenantName'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        }
      ],
      searchConfigs: [{ type: 'Const', value: 'orderId', sign: 'EQ', initValue: this.config.id }],
      orderTotal: 0,
      loading: false,
      orderStatusList,
      typeMap,
      chargeMode,
      detailData: {},
      billList: [],
      billTotal: 0,
      orderDetailList: [],
      billParams: {
        page: 1,
        rows: 10
      },
      totalMoney: 0,
      relationBtnloading: false,
      relationWorkOrderDialog: {
        visible: false,
        record: {}
      },
      relationVmDetailDialog: {
        visible: false,
        record: {}
      }
    }
  },
  created() {
    if (this.config.serviceCode === 'physical.standard.server') {
      this.orderColumns = [
        {
          label: '资源类型',
          prop: 'serviceName'
        },
        {
          label: '具体配置',
          prop: 'elementList',
          scopedSlots: { customRender: 'elementList' }
        },
        {
          label: '付款方式',
          prop: 'duration',
          scopedSlots: { customRender: 'duration' }
        },
        {
          label: '起止时间',
          prop: 'time',
          scopedSlots: { customRender: 'time' }
        },
        {
          label: '原价',
          prop: 'basicPrice',
          scopedSlots: { customRender: 'basicPrice' }
        },
        {
          label: '折扣率',
          prop: 'discountList',
          scopedSlots: { customRender: 'discountList' }
        },
        {
          label: '实际价格',
          prop: 'finalPrice',
          scopedSlots: { customRender: 'finalPrice' }
        }
      ]
    } else {
      this.orderColumns = [
        {
          label: '资源类型',
          prop: 'serviceName'
        },
        {
          label: '资源名称',
          prop: 'resourceName',
          scopedSlots: { customRender: 'resourceName' }
        },
        {
          label: 'UUID',
          prop: 'sn'
        },
        {
          label: '具体配置',
          prop: 'elementList',
          scopedSlots: { customRender: 'elementList' }
        },
        // {
        //   label: '资源类型',
        //   prop: 'resourceType'
        // },
        {
          label: 'IP',
          prop: 'ips',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '所属虚拟机',
          prop: 'belongServer',
          scopedSlots: { customRender: 'belongServer' }
        },
        {
          label: '资源状态',
          prop: 'status',
          scopedSlots: { customRender: 'resourceStatus' }
        },
        {
          label: '结果',
          prop: 'errorMsg'
        },
        {
          label: '付款方式',
          prop: 'duration',
          scopedSlots: { customRender: 'duration' }
        },
        {
          label: '起止时间',
          prop: 'time',
          scopedSlots: { customRender: 'time' }
        },
        {
          label: '原价',
          prop: 'basicPrice',
          scopedSlots: { customRender: 'basicPrice' }
        },
        {
          label: '折扣率',
          prop: 'discountList',
          scopedSlots: { customRender: 'discountList' }
        },
        {
          label: '实际价格',
          prop: 'finalPrice',
          scopedSlots: { customRender: 'finalPrice' }
        }
        // {
        //   label: '操作',
        //   prop: 'operate',
        //   width: '120px',
        //   scopedSlots: { customRender: 'operate' }
        // }
      ]
    }

    this.getDetailInfo()
    this.getBillList()
  },
  methods: {
    isServerServiceCode(serviceCode = '') {
      if (!serviceCode) return false
      return Object.values(ServiceCodeMap.server).includes(serviceCode)
    },
    async openRelationVmDetail(record) {
      if (!record.sn) return this.$message.error('订单详情缺少 sn 参数')
      this.relationVmDetailDialog.visible = true
      this.relationVmDetailDialog.record = record
    },
    async openRelationWorkOrder() {
      // 获取已发起工单
      this.relationBtnloading = true
      const res = await getFlowInstance({
        page: 1,
        rows: 10,
        type: 'ALL',
        params: this.$tools.handleSearchParam({
          instanceNo: this.detailData.workOrderFlowNo
        })
      }).finally(() => (this.relationBtnloading = false))
      if (!res.success) return
      if (!res.data.rows.length) return this.$message.error('未找到关联工单')
      this.relationWorkOrderDialog.visible = true
      this.relationWorkOrderDialog.record = res.data.rows[0]
    },
    handleDetailTab(tab) {
      switch (tab.name) {
        case 'orderDetail':
          break
        case 'record':
          break
      }
    },
    async getDetailInfo() {
      this.loading = true
      const res = await getOrderDetail(this.config.id)
      if (res.success) {
        res.data.applyParam = JSON.parse(res.data.applyParam || '{}')
        this.detailData = res.data
        this.orderDetailList = res.data.items.map(item => {
          item.vendorType = item.serviceCode.split('.')[0].toUpperCase()
          if (item.vendorType === 'SANGFOR' && item.ips) {
            item.ips = JSON.stringify(Object.values(JSON.parse(item.ips)).map(item => ({ address: Object.keys(item)[0] })))
          }
          if (item.ips) item.privateIpsList = JSON.parse(item.ips)
          if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
          return item
        })
        this.orderTotal = res.data.items.length
        this.totalMoney = res.data.money
      }
      this.loading = false
    },
    getBillList() {
      this.loading = true
      getBills({
        ...this.billParams,
        params: this.$tools.handleSearchParam({
          orderId: this.config.id
        })
      })
        .then(res => {
          if (res.success) {
            this.billList = res.data.rows
            this.billTotal = res.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    goBack() {
      this.config.visible = false
    }
  }
}
</script>

<style scoped lang="scss">
.bill-table ::v-deep .search {
  display: none !important;
}
.order-table ::v-deep .pagination-container {
  display: none;
}
</style>
