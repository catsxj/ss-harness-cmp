<template>
  <el-dialog :title="`${dialog.orderType === 'tenantList' ? '租户' : $store.getters.systemConfig.projectConfigLabel}资源费用统计`" :close-on-click-modal="false" :visible.sync="dialog.visible" width="90%">
    <el-row :gutter="5" class="m-t-xs">
      <el-col :span="24">
        <el-radio-group size="mini" v-model="timeType" style="margin-top: -4px; margin-bottom: 10px" @change="getTime">
          <el-radio-button label="Month">月</el-radio-button>
          <el-radio-button label="Quarter">季度</el-radio-button>
          <el-radio-button label="HalfYear">半年</el-radio-button>
          <el-radio-button label="Year">一年</el-radio-button>
        </el-radio-group>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">资源类型费用分布</div>
          <pie-charts :theme="tenantList.name" :setting="pieConfig1" :id="'stats1'" v-if="tenantList && dialog.orderType === 'tenantList'" :data="tenantList.data" width="100%" height="230px"></pie-charts>
          <pie-charts :theme="tenantList.name" :setting="pieConfig1" :id="'stats2'" v-if="projectList && dialog.orderType === 'projectList'" :data="projectList.data" width="100%" height="230px"></pie-charts>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">费用趋势统计</div>
          <line-charts v-if="incomeTrend" theme="租户消费趋势统计:" ref="chart2" height="230px" width="100%" id="incomeTrend" :data="incomeTrend"></line-charts>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card>
          <el-tabs v-model="radioType" @tab-click="handleTabClick">
            <el-tab-pane label="资源类型" name="type">
              <basic-table :data="resourceTypeList" :params="resourceTypeParams" :get-list="getResourceTypeList" :total="resourceTypeTotal">
                <el-table-column label="资源类型" prop="serviceName"></el-table-column>
                <el-table-column label="资源数量" prop="resourceNum"></el-table-column>
                <el-table-column label="总费用（元）" prop="totalMoney"></el-table-column>
                <el-table-column label="本月费用（元）" prop="monthMoney"></el-table-column>
                <el-table-column label="月费用环比" prop="monthRatio"></el-table-column>
                <el-table-column label="月费用同比" prop="monthBasis"></el-table-column>
                <el-table-column label="本季度费用（元）" prop="quarterMoney"></el-table-column>
                <el-table-column label="季度费用环比" prop="quarterRatio"></el-table-column>
                <el-table-column label="季度费用同比" prop="quarterBasis"></el-table-column>
              </basic-table>
            </el-tab-pane>
            <el-tab-pane label="资源明细" name="detail">
              <AdvanceTable :data="resourceList" :searchConfigs="searchConfigs" :params="resourceParams" :total="resourceTotal" :columns="columns" :get-list="getResourceList"> </AdvanceTable>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="dialog.visible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getItems } from 'services/services/catelog'
import { getProject } from 'services/system/project'
import { getCloudVendor } from 'services/platform/index'
import { getCostOverview, getCostOverviewListDetail } from 'services/services/bill'

export default {
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      timeType: 'Month',
      resourceTypeList: [],
      resourceTypeParams: {
        page: 1,
        rows: 10
      },
      resourceTypeTotal: 0,
      radioType: 'type',
      resourceList: [],
      resourceParams: {
        page: 1,
        rows: 10
      },
      resourceTotal: 0,
      columns: [
        {
          label: '资源名称',
          prop: 'resourceName'
        },
        {
          label: '资源类型',
          prop: 'serviceName'
        },
        {
          label: '所属平台',
          prop: 'vendorName'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '创建时间',
          prop: 'createTime'
        },
        {
          label: '总费用（元）',
          prop: 'totalMoney'
        },
        {
          label: '本月费用（元）',
          prop: 'monthMoney'
        },
        {
          label: '月费用环比',
          prop: 'monthRatio'
        },
        {
          label: '月费用同比',
          prop: 'monthBasis'
        },
        {
          label: '本季度费用（元）',
          prop: 'quarterMoney'
        },
        {
          label: '本季度费用环比',
          prop: 'quarterRatio'
        },
        {
          label: '本季度费用同比',
          prop: 'quarterBasis'
        }
      ],
      searchConfigs: [
        { label: '资源名称', value: 'resourceName', type: 'Input' },
        {
          type: 'Select',
          value: 'serviceCode',
          label: '资源类型',
          data: []
        },
        { type: 'Select', label: '所属平台', value: 'vendorId', data: [], service: { api: getCloudVendor, params: { simple: true }, attr: 'data.rows' } },

        {
          type: 'Select',
          value: 'projectId',
          label: this.$store.getters.systemConfig.projectConfigLabel,
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
        }
      ],
      incomeTrend: [],
      tenantList: [],
      projectList: [],
      pieConfig1: {
        legend: {
          orient: 'vertical',
          // 设置图例项的宽度
          itemWidth: 20,
          left: '60%',
          textStyle: {
            rich: {
              a: {
                width: 150,
                overflow: 'truncate'
              }
            }
          }
        },
        tooltip: {
          trigger: 'item'
        }
      }
    }
  },
  created() {
    this.timeType = this.dialog.data.timeType
    getItems({
      page: 1,
      rows: 9999
    }).then((data) => {
      if (data.success) {
        this.searchConfigs[1].data = data.data.rows.map((item) => {
          return {
            id: item.code,
            name: item.name
          }
        })
      }
    })
    this.search()
    this.getResourceTypeList()
  },

  methods: {
    search() {
      const { tenantId, projectId, start, end, type, timeType } = this.dialog.data
      const { orderType } = this.dialog
      this.getOrder('incomeTrend', type, tenantId, projectId, timeType, start, end)
      this.getTrend(orderType, tenantId, projectId, timeType, start, end)
    },
    getOrder(condition, type, tenantId, projectId, time, start, end) {
      const obj = {
        condition: condition,
        type: type,
        tenantId: tenantId,
        projectId: projectId,
        time,
        start,
        end
      }
      getCostOverview({
        condition: JSON.stringify(obj)
      }).then((data) => {
        if (data.success) {
          this[condition] = data.data
        }
      })
    },
    getTrend(condition, tenantId, projectId, time, start, end) {
      const obj = {
        condition: this.dialog.data.radioType,
        tenantId: tenantId,
        projectId: projectId,
        time,
        start,
        end
      }
      getCostOverviewListDetail({
        condition: JSON.stringify(obj)
      }).then((data) => {
        if (data.success) {
          this[this.dialog.orderType] = data.data
        }
      })
    },
    getResourceTypeList() {
      const { tenantId, projectId } = this.dialog.data
      const obj = {
        condition: this.dialog.orderType === 'tenantList' ? 'tenantTypeList' : 'projectTypeList',
        tenantId: tenantId,
        projectId: projectId,
        time: this.timeType
      }
      this.resourceTypeParams.condition = JSON.stringify(obj)
      getCostOverviewListDetail(this.resourceTypeParams).then((data) => {
        if (data.success) {
          this.resourceTypeList = data.data.rows
          this.resourceTypeTotal = data.data.total
        }
      })
    },
    getResourceList() {
      const { tenantId, projectId } = this.dialog.data
      const obj = {
        condition: this.dialog.orderType === 'tenantList' ? 'tenantDetailList' : 'projectDetailList',
        tenantId: tenantId,
        projectId: projectId,
        time: this.timeType
      }
      const params = JSON.parse(this.resourceParams.params)
      if (params.length > 0) {
        params.forEach((item) => {
          if (item.param.resourceName) {
            obj.resourceName = item.param.resourceName
          } else {
            obj.serviceCode = null
          }
          if (item.param.serviceCode) {
            obj.serviceCode = item.param.serviceCode
          } else {
            obj.serviceCode = null
          }
          if (item.param.vendorId) {
            obj.vendorId = item.param.vendorId
          } else {
            obj.vendorId = null
          }
        })
      } else {
        obj.resourceName = null
        obj.serviceCode = null
        obj.vendorId = null
      }
      this.resourceParams.condition = JSON.stringify(obj)
      getCostOverviewListDetail(this.resourceParams).then((data) => {
        if (data.success) {
          this.resourceList = data.data.rows
          this.resourceTotal = data.data.total
        }
      })
    },
    handleTabClick(tab) {
      console.log(tab)
      if (tab.name === 'type') {
        this.getResourceTypeList()
      } else {
        this.getResourceList()
      }
    },
    getTime(val) {
      const { tenantId, projectId, start, end, type, timeType } = this.dialog.data
      const { orderType } = this.dialog
      this.getOrder('incomeTrend', type, tenantId, projectId, val, start, end)
      this.getTrend(orderType, tenantId, projectId, val, start, end)
    }
  }
}
</script>
