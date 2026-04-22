<template>
  <div>
    <AdvanceTable ref="tableRef" :title="titleName" :data="list" :searchConfigs="historySearchConfigs" :params="params" :total="total" :columns="historyColumns" :get-list="getList" :loading="loading">
      <!-- <template #action>
        <el-button type="primary" @click="getAll">查看全部数据</el-button>
      </template> -->
      <template #name="val, record">
        <template v-if="record.status === 'SUCCESS' || record.status === 'ERROR'">
          <span class="detail-href" @click="toggleDialog(record)">
            {{ val }}
          </span>
        </template>
        <template v-else>
          {{ val }}
        </template>
      </template>
      <template #type="type">
        {{ type | getInspectTypeName }}
      </template>
      <template #status="status">
        <status-icon :type="statusTypeFilter(status)">{{ statusFilter(status) }}</status-icon>
      </template>
      <template #warning="val, record">
        <span v-if="record.status && ['STARTING', 'RUNNING'].includes(record.status) ||val==null">-</span>
        <span v-else-if="val" style="color: red">告警</span>
        <span v-else style="color: mediumseagreen">正常</span>
      </template>
    </AdvanceTable>
    <!--详情-->
    <common-detail v-if="detailFlag" :title="detailInfo.name" @goBack="detailFlag = false" :data="detailInfo">
      <span slot="detail_header" style="float: right">
        <el-button type="primary" @click="getRecordById('pdf')">PDF导出</el-button>
        <el-button type="primary" @click="getRecordById('excel')">EXCEL导出</el-button>
      </span>
      <template #item_container>
        <common-detail-item label="巡检名称">{{ detailInfo.name }}</common-detail-item>
        <common-detail-item label="巡检分类">{{ detailInfo.category }}</common-detail-item>
        <common-detail-item label="巡检类型">{{ detailInfo.inspectTypeText }}</common-detail-item>
        <common-detail-item label="执行状态">
          <status-icon :type="statusTypeFilter(detailInfo.status)">{{ statusFilter(detailInfo.status) }}</status-icon>
        </common-detail-item>
        <common-detail-item label="巡检结果">
          <span v-if="detailInfo.status && ['STARTING', 'RUNNING'].includes(detailInfo.status)||detailInfo.warning==null">-</span>
          <span v-else-if="detailInfo.warning" style="color: red">告警</span>
          <span v-else style="color: mediumseagreen">正常</span>
        </common-detail-item>
        <common-detail-item label="执行人员">{{ detailInfo.userName }}</common-detail-item>
        <common-detail-item label="巡检时间">{{ detailInfo.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs v-model="activeName" @tab-click="changetab">
        <el-tab-pane class="basic-info" name="history">
          <span slot="label"> <i class="el-icon-document"></i> 执行详情 </span>
          <div class="table-container">
            <el-table :data="historyData" header-cell-class-name="custom-header" :span-method="arraySpanMethod" border fit>
              <el-table-column label="资源组名称" prop="groupName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="主机名称" prop="resourceName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="主机ip" prop="ip" show-overflow-tooltip> </el-table-column>
              <el-table-column label="指标项" prop="inspectName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="指标值" prop="inspectValue" show-overflow-tooltip> </el-table-column>
              <el-table-column label="告警" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-html="scope.row.description"></span>
                </template>
              </el-table-column>
              <el-table-column label="规则" prop="rule" show-overflow-tooltip> </el-table-column>
              <el-table-column label="命中规则" prop="threshold" show-overflow-tooltip> </el-table-column>
              <el-table-column label="错误信息" prop="scriptErrorInfo" show-overflow-tooltip> </el-table-column>
            </el-table>
          </div>
          <div class="pagination-container">
            <el-pagination @size-change="getDetailBySize" @current-change="getDetailByPage" :current-page.sync="historyParams.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="historyParams.rows"
              background layout="total, prev, pager, next, sizes, jumper" :total="historyParams.total">
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane class="basic-info" name="warning" v-if="hasWarning">
          <span slot="label"> <i class="iconfont icon-jinggao"></i> 告警信息 </span>
          <div class="table-container">
            <el-table :data="warningData" header-cell-class-name="custom-header" border stripe fit>
              <el-table-column label="资源组名称" prop="groupName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="主机名称" prop="resourceName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="主机ip" prop="ip" show-overflow-tooltip> </el-table-column>
              <el-table-column label="指标项" prop="inspectName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="指标值" prop="inspectValue" show-overflow-tooltip> </el-table-column>
              <el-table-column label="告警" show-overflow-tooltip>
                <template slot-scope="scope">
                  <span v-html="scope.row.description"></span>
                </template>
              </el-table-column>
              <el-table-column label="规则" prop="rule" show-overflow-tooltip> </el-table-column>
              <el-table-column label="命中规则" prop="threshold" show-overflow-tooltip> </el-table-column>
            </el-table>
          </div>
          <div class="pagination-container">
            <el-pagination @size-change="getWarningDataBySize" @current-change="getWarningDataByPage" :current-page.sync="warnParams.page" :page-sizes="[5, 10, 20, 30, 50]"
              :page-size="warnParams.rows" background layout="total, prev, pager, next, sizes, jumper" :total="warnParams.total">
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane class="basic-info" name="error" v-if="hasError">
          <span slot="label"> <i class="el-icon-circle-close-outline"></i> 错误信息 </span>
          <div class="table-container">
            <el-table :data="errorData" header-cell-class-name="custom-header" stripe fit>
              <el-table-column label="资源组名称" prop="groupName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="主机名称" prop="resourceName" show-overflow-tooltip>
                <template slot-scope="scope">
                  {{ scope.row.resourceName || record.ip }}
                </template>
              </el-table-column>
              <el-table-column label="主机ip" prop="ip" show-overflow-tooltip> </el-table-column>
              <el-table-column label="指标项" prop="itemName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="错误信息" prop="scriptErrorInfo" show-overflow-tooltip> </el-table-column>
            </el-table>
          </div>
          <div class="pagination-container">
            <el-pagination @size-change="getErrorDataBySize" @current-change="getErrorDataByPage" :current-page.sync="errorParams.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="errorParams.rows"
              background layout="total, prev, pager, next, sizes, jumper" :total="errorParams.total">
            </el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <create-history v-if="createVisible" @goBack="handleCreateBack"></create-history>
  </div>
</template>

<script>
import CreateHistory from './createHistory'
import { getRecords, getRecordsDetailList, getRecordsWarnList, getRecordsErrorList, downloadTpl } from 'services/task/inspect'
import { historyColumns, historySearchConfigs } from './config'

export default {
  components: {
    CreateHistory
  },
  data() {
    return {
      historyColumns,
      historySearchConfigs: [...historySearchConfigs],
      loading: false,
      list: [],
      hostChild: [],
      itemChild: [],
      params: {
        page: 1,
        rows: 10
      },
      historyParams: {
        page: 1,
        rows: 10,
        total: 0
      },
      warnParams: {
        page: 1,
        rows: 10,
        total: 0
      },
      errorParams: {
        page: 1,
        rows: 10,
        tiotal: 0
      },
      searchData: [],
      hasError: false,
      hasWarning: false,
      superSearchList: [],
      total: 0,
      inspectTypes: [
        // 快速  常规巡检  定时巡检  人工录入
        // FAST(0),ROUTINE(1),TIMING(2),MANUAL(3)
        { id: '0', name: '快速巡检-脚本' },
        { id: '1', name: '常规巡检' },
        { id: '2', name: '定时巡检' }
        /* { id: '3', name: '人工巡检' } */
      ],
      detailFlag: false,
      detailParams: {},
      detailInfo: {},
      historyData: [], // 执行详情
      errorData: [], // 错误详情
      warningData: [], // 告警详情
      activeName: 'history',
      createVisible: false
    }
  },
  computed: {
    titleName() {
      const { name = '' } = this.$route.query
      return `${name && `【${name}】`}巡检记录列表`
    }
  },
  created() {
    const { timingId, routineId } = this.$route.query
    timingId &&
      this.historySearchConfigs.push({
        type: 'Const',
        value: 'timingId',
        initValue: timingId
      })
    routineId &&
      this.historySearchConfigs.push({
        type: 'Const',
        value: 'routineId',
        initValue: routineId
      })
  },
  methods: {
    // 获取所有数据
    getAll() {
      this.$router.replace({ name: 'InspectHistory' })
      this.$refs.tableRef.handleSearch()
    },
    handleCreateBack(val) {
      this.createVisible = false
      if (val) {
        this.getList()
      }
    },
    // 表格格式处理
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      const inspectNameCountCol = [3]
      const inspectValueCountCol = [0, 1, 2, 8]
      if (inspectNameCountCol.includes(columnIndex)) {
        return [this.itemChild[rowIndex], 1]
      } else if (inspectValueCountCol.includes(columnIndex)) {
        return [this.hostChild[rowIndex], 1]
      }
    },
    getRecordById(type) {
      const id = this.detailParams.recordId
      downloadTpl(id, type)
    },
    getList(data) {
      // const params = {
      //   page: this.params.page,
      //   rows: this.params.rows,
      //   sorter: JSON.stringify({ gmtCreate: '1' })
      // }
      // this.searchData = data?.searchData || this.searchData
      // if (this.$route.query.routineId) {
      //   this.searchData.push({
      //     param: {
      //       routineId: this.$route.query.routineId
      //     },
      //     sign: 'EQ'
      //   })
      // } else if (this.$route.query.timingId) {
      //   this.searchData.push({
      //     param: {
      //       timingId: this.$route.query.timingId
      //     },
      //     sign: 'EQ'
      //   })
      // } else if (this.$route.query.fastInspectId) {
      //   this.searchData.push({
      //     param: {
      //       id: this.$route.query.fastInspectId
      //     },
      //     sign: 'EQ'
      //   })
      // }
      // params.params = JSON.stringify(parm.push(...this.searchData))
      getRecords(this.params).then(data => {
        if (data.success) {
          this.list = data?.data?.rows || []
          this.total = data?.data?.total || 0
        }
      })
    },
    toggleDialog(item) {
      this.detailInfo = {
        ...item
      }
      let inspectResult = '正常'
      if (item.warning) {
        inspectResult = '告警'
        this.detailInfo.inspectResult = inspectResult
      }
      for (const type of this.inspectTypes) {
        if (type.id === item.type?.toString()) {
          this.detailInfo.inspectTypeText = type.name
        }
      }
      this.detailInfo.statusText = '成功'
      if (item.status === 'ERROR') {
        this.detailInfo.statusText = '失败'
      }
      this.activeName = 'history'
      this.detailParams.recordId = item.id
      this.hasWarning = item.warning
      this.hasError = item.status == 'ERROR'
      this.historyData = []
      this.warningData = []
      this.errorData = []
      this.getDetail()
      this.detailFlag = true
    },
    // tab页切换
    // 首次切换时请求
    changetab() {
      switch (this.activeName) {
        case 'history':
          if (this.historyData.length < 1) {
            this.getDetail()
          }
          break
        case 'warning':
          if (this.warningData.length < 1) {
            this.getWarningData()
          }
          break
        case 'error':
          if (this.errorData.length < 1) {
            this.getErrorData()
          }
          break
      }
    },
    // 根据规则code获取name
    getRuleName(code) {
      switch (code) {
        case 'GT':
          return '大于'
        case 'EQ':
          return '等于'
        case 'LT':
          return '小于'
        case 'GE':
          return '大于等于'
        case 'LE':
          return '小于等于'
        case 'NEQ':
          return '不等于'
        case 'IN':
          return '包含'
        case 'NIN':
          return '不包含'
      }
    },
    getRules(rules) {
      let txt = ''
      rules.forEach(item => {
        txt += `${this.getRuleName(item.rule) + ' ' + item.threshold + ' ' + item.description}; `
      })
      return txt
    },
    // 历史记录详情 - 改变rows
    getDetailBySize(rows) {
      this.historyParams.rows = rows
      this.getDetail()
    },
    // 历史记录详情 - 改变page
    getDetailByPage(page) {
      this.historyParams.page = page
      this.getDetail()
    },
    // 历史记录详情
    getDetail() {
      getRecordsDetailList({
        page: this.historyParams.page,
        rows: this.historyParams.rows,
        recordId: this.detailInfo.id
      }).then(data => {
        if (data.success) {
          const historyData = data.data.rows
          const afterHandleData = [],
            hostChild = [],
            itemChild = []
          historyData.forEach((item1, index1) => {
            let count = 0
            const result = JSON.parse(item1.result) || []
            const warningInfo = JSON.parse(item1.warningInfo) || []
            if (result.length > 0) {
              result.forEach((item2, index2) => {
                let scount = 0
                item2.entities.forEach(item3 => {
                  const warningRuleResult = item3.warningRuleResult || null
                  scount++
                  count++
                  afterHandleData.push({
                    groupName: item1.groupName,
                    resourceName: item1.resourceName || item1.ip,
                    ip: item1.ip,
                    inspectName: item2?.key ? `${item1.itemName}_${item2?.key}` : `${item1.itemName}`,
                    inspectValue: item3?.valueName ? `${item3?.valueName}: ${item3?.value}` : `${item3?.value}`,
                    description: warningRuleResult && warningRuleResult?.targetRule ? `<span style="color: ${JSON.parse(warningRuleResult?.targetRule).color}">${JSON.parse(warningRuleResult?.targetRule).description}</span>` : '--',
                    // rule: warningRuleResult && warningRuleResult?.targetRule ? `${this.getRuleName(JSON.parse(warningRuleResult?.targetRule).rule)}` : '',
                    // threshold: warningRuleResult && warningRuleResult?.targetRule ? `${JSON.parse(warningRuleResult?.targetRule).threshold}` : '',
                    rule: item2?.rules ? this.getRules(item2.rules) : '--',
                    threshold: warningInfo.length ? warningInfo[index2] : '未命中规则',
                    scriptErrorInfo: item1.scriptErrorInfo
                  })
                })
                itemChild.push(scount)
              })
            } else {
              count++
              afterHandleData.push({
                groupName: item1.groupName,
                resourceName: item1.resourceName || item1.ip,
                ip: item1.ip,
                inspectName: item1.itemName,
                inspectValue: '--',
                description: '--',
                rule: '--',
                threshold: '--',
                scriptErrorInfo: item1.scriptErrorInfo
              })
              itemChild.push(1)
            }
            hostChild.push(count)
          })
          this.historyData = afterHandleData
          this.hostChild = hostChild
            .map(i => {
              const arr = [i]
              for (let j = 1; j < i; j++) {
                arr[j] = 0
              }
              return arr
            })
            .join(',')
            .split(',')
            .map(i => parseInt(i, 10))
          this.itemChild = itemChild
            .map(i => {
              const arr = [i]
              for (let j = 1; j < i; j++) {
                arr[j] = 0
              }
              return arr
            })
            .join(',')
            .split(',')
            .map(i => parseInt(i, 10))
          this.historyParams.total = data.data.total || 0
        }
      })
    },
    // 历史记录告警详情 - 改变rows
    getWarningDataBySize(rows) {
      this.warnParams.rows = rows
      this.getWarningData()
    },
    // 历史记录告警详情 - 改变page
    getWarningDataByPage(page) {
      this.warnParams.page = page
      this.getWarningData()
    },
    getWarningData() {
      // 请求警告信息列表
      getRecordsWarnList({
        page: this.warnParams.page,
        rows: this.warnParams.rows,
        recordId: this.detailInfo.id
      }).then(data => {
        if (data.success) {
          const warningData = data.data.rows
          this.warningData = warningData.map(item => {
            return {
              groupName: item.groupName,
              resourceName: item.resourceName || item.ip,
              ip: item.ip,
              inspectName: item.key ? `${item.itemName}_${item.key}` : `${item.itemName}`,
              inspectValue: item?.valueName ? `${item?.valueName}: ${item?.value}` : `${item?.value}`,
              description: item && item?.targetRule ? `<span style="color: ${JSON.parse(item?.targetRule).color}">${JSON.parse(item?.targetRule).description}</span>` : '--',
              rule: item && item?.targetRule ? `${this.getRuleName(JSON.parse(item?.targetRule).rule) + ' ' + JSON.parse(item?.targetRule).threshold + ' ' + JSON.parse(item?.targetRule).description}` : '',
              // threshold: item && item?.targetRule ? `${JSON.parse(item?.targetRule).threshold}` : ''
              threshold: item?.content ? item.content : '未命中规则'
            }
          })
          this.warnParams.total = data.data.total
        }
      })
    },
    // 历史记录错误详情 - 改变rows
    getErrorDataBySize(rows) {
      this.errorParams.rows = rows
      this.getErrorData()
    },
    // 历史记录错误详情 - 改变page
    getErrorDataByPage(page) {
      this.errorParams.page = page
      this.getErrorData()
    },
    getErrorData() {
      // 请求错误信息列表
      getRecordsErrorList({
        page: this.errorParams.page,
        rows: this.errorParams.rows,
        recordId: this.detailInfo.id
      }).then(data => {
        if (data.success) {
          this.errorData = data.data.rows
          this.errorParams.total = data.data.total
        }
      })
    },
    create() {
      this.createVisible = true
    },
    statusTypeFilter(val) {
      const map = {
        STARTING: 'primary',
        RUNNING: 'normal',
        SUCCESS: 'success',
        ERROR: 'danger'
      }
      return map[val]
    },
    statusFilter(val) {
      const map = {
        STARTING: '启动中',
        RUNNING: '执行中',
        SUCCESS: '成功',
        ERROR: '错误'
      }

      return map[val]
    }
  },
  filters: {
    getInspectTypeName(val) {
      const data = {
        0: '快速巡检-脚本',
        1: '常规巡检',
        2: '定时巡检',
        3: '人工巡检'
      }
      return data[val] || '-'
    }
  }
}
</script>
