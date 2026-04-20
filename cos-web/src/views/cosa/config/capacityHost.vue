<template>
  <div class="wrapper">
    <div v-show="!detailFlag">
      <table-search :configs="searchConfigs" :onSearch="handleSearch" style="margin-bottom: 15px">
        <template v-slot:operate>
          <el-button type="primary" @click="handleCreate()"> <i class="el-icon-plus"></i>新增 </el-button>
        </template>
      </table-search>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total">
        <el-table-column show-overflow-tooltip label="名称" prop="name">
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip label="创建时间" prop="gmtCreate"> </el-table-column>

        <el-table-column show-overflow-tooltip label="操作" width="220px">
          <template slot-scope="scope">
            <el-button type="text" @click="handleCreate(scope.row)"><i class="el-icon-edit"></i>编辑</el-button>
            <div class="action-divider"></div>
            <el-button type="text" @click="handleDelete(scope.row.id)"><i class="el-icon-delete"></i> 删除</el-button>
            <div class="action-divider"></div>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="analysis(scope.row)">分析</el-dropdown-item>
                <el-dropdown-item @click.native="handleHistory(scope.row.id)">历史</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="addFlag" :visible.sync="addFlag" width="70%">
      <basic-form :model="addData" ref="addData" label-width="110px">
        <el-row>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.name" auto-complete="off"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="规则：">
              <el-row class="rule-box">
                <el-col :span="24" v-for="(row, index) in addData.rules" :key="index" class="m-t">
                  <el-row :gutter="10">
                    <span class="m-l pull-left" style="display: inline-block; width: 150px">{{ row.metric | alarmMetric }}：</span>
                    <el-col :span="5">
                      <el-select v-model="row.operator" clearable>
                        <el-option v-for="(item, indexItem) in relationList" :key="indexItem" :label="item.value" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="5">
                      <el-input type="number" min="0" v-model="row.value" auto-complete="off" @blur="changeValue(row.value, index)"></el-input>
                    </el-col>
                    <el-col :span="4">
                      <el-select v-model="row.valueType" clearable>
                        <el-option v-for="item in valueType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="4">
                      <el-select v-model="row.relation" clearable>
                        <el-option v-for="item in relationType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="title2" :close-on-click-modal="false" v-if="analysisFlag" :visible.sync="analysisFlag" width="70%">
      <basic-form :model="analysisData" ref="analysisData" label-width="80px">
        <el-row :gutter="10">
          <el-col :span="8">
            <basic-form-item label="平台：" prop="vendorId" validate="required" required-message="请选择平台">
              <el-select :disabled="analysisStatus == 'history'" v-model="analysisData.vendorId" clearable filterable multiple @change="handleChangeVendor">
                <el-option v-for="item in vendorData" :key="item.id" :label="item.name" :value="item.id" :disabled="item.disabled"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="16">
            <basic-form-item label="时间：" prop="time" validate="required">
              <el-date-picker :disabled="analysisStatus == 'history'" v-model="analysisData.time" :picker-options="forbid" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
              <el-button style="margin-left: 10px" v-if="analysisStatus != 'history'" type="primary" @click="handleAnalysis()">分析</el-button>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="规则：">
              <el-row class="rule-box">
                <el-col :span="24" v-for="(row, index) in analysisData.rules" :key="index" class="m-t">
                  <el-row :gutter="10">
                    <span class="m-l pull-left" style="display: inline-block; width: 150px">{{ row.metric | alarmMetric }}：</span>
                    <el-col :span="5">
                      <el-select disabled v-model="row.operator">
                        <el-option v-for="(item, indexItem) in relationList" :key="indexItem" :label="item.value" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="5">
                      <el-input disabled type="number" min="0" v-model="row.value" auto-complete="off"></el-input>
                    </el-col>
                    <el-col :span="4">
                      <el-select disabled v-model="row.valueType">
                        <el-option v-for="item in valueType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="4">
                      <el-select disabled v-model="row.relation">
                        <el-option v-for="item in relationType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
          <div v-if="analysisStatus == 'history'">
            <el-col :span="12" class="m-b" v-for="(chart, index) in charts" :key="index">
              <el-card class="box-card">
                <div slot="header" class="clearfix">
                  <span>{{ chart.name }}</span>
                </div>
                <div>
                  <bar-reverse-charts :data="chart" height="300px"></bar-reverse-charts>
                </div>
              </el-card>
            </el-col>
            <el-col :span="24">
              <SmartTable :data="tableList">
                <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>

                <el-table-column show-overflow-tooltip label="IP" prop="ip"> </el-table-column>

                <el-table-column show-overflow-tooltip label="CPU利用率(%)" prop="cpuUsage"> </el-table-column>

                <el-table-column show-overflow-tooltip label="内存利用率(%)" prop="memUsage"> </el-table-column>

                <el-table-column show-overflow-tooltip label="CPU就绪时间(毫秒)" prop="cpuReady"> </el-table-column>
                <div slot="pagination"></div>
              </SmartTable>
            </el-col>
          </div>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="analysisStatus == 'history'" :disabled="analysisId == null" @click.native="handleExport(analysisId)">导出</el-button>
      </div>
    </el-dialog>
    <el-dialog title="历史记录" :close-on-click-modal="false" v-if="historyFlag" :visible.sync="historyFlag" width="70%">
      <basic-table :data="historyList" :params="params2" :get-list="getHistory" :total="total2">
        <el-table-column show-overflow-tooltip label="名称" prop="name">
          <template slot-scope="scope">
            <span class="detail-href" @click="getAnalysisDetail(scope.row)">{{ scope.row.ruleName }}</span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="云平台名称" prop="vendorName"></el-table-column>

        <el-table-column show-overflow-tooltip label="开始时间" prop="startTime"></el-table-column>
        <el-table-column show-overflow-tooltip label="结束时间" prop="endTime"></el-table-column>

        <el-table-column show-overflow-tooltip label="创建时间" prop="gmtCreate"> </el-table-column>
        <el-table-column show-overflow-tooltip label="操作" width="160px">
          <template slot-scope="scope">
            <el-button type="text" @click="deleteHistory(scope.row.id)"><i class="el-icon-delete"></i> 删除</el-button>
            <div class="action-divider"></div>
            <el-button type="text" @click="handleExport(scope.row.id)"><i class="el-icon-info"></i> 导出</el-button>
          </template>
        </el-table-column>
      </basic-table>
      <div slot="footer" class="dialog-footer"></div>
    </el-dialog>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <el-card class="m-t-n" slot="custom_content">
        <basic-form label-width="110px" class="m-b">
          <div :span="24" v-for="(row, index) in detailData.rules" :key="index" class="m-t">
            <el-row :gutter="10">
              <span class="m-l pull-left" style="display: inline-block; width: 100px">{{ row.metric | alarmMetric }}：</span>
              <el-col :span="5">
                <el-input disabled v-model="row.operator"></el-input>
              </el-col>
              <el-col :span="5">
                <el-input disabled type="number" min="0" v-model="row.value" auto-complete="off" @blur="changeValue(row.value, index)"></el-input>
              </el-col>
              <el-col :span="5">
                <el-select disabled v-model="row.valueType" clearable>
                  <el-option v-for="item in valueType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-col>
              <el-col :span="5">
                <el-select disabled v-model="row.relation" clearable>
                  <el-option v-for="item in relationType" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-col>
            </el-row>
          </div>
        </basic-form>
      </el-card>
    </common-detail>
  </div>
</template>

<script>
import { getRules, createRules, modifyRules, removeRules, getDetail, getSnapshot, removeSnapshot, getSnapshotDetail, handleAnalysis, exportAnalysis } from 'services/monitor/analysis'
import { conditionCloudVendor } from 'services/platform/index'
const relationList = [{ value: '>' }, { value: '>=' }, { value: '==' }, { value: '<' }, { value: '<=' }, { value: '!=' }]
const valueType = [
  { name: '最大值', value: 'max' },
  { name: '最小值', value: 'min' },
  { name: '平均值', value: 'avg' }
]
const relationType = [
  { name: '与', value: 'and' },
  { name: '或', value: 'or' }
]
export default {
  data() {
    return {
      searchConfigs: [
        { type: 'Input', label: '名称', value: 'name' },
        { type: 'Const', value: 'type', initValue: 'serverCapacityExpansion' }
      ],
      relationList,
      relationType,
      valueType,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      params2: {
        page: 1,
        rows: 10
      },
      // 新增编辑
      addFlag: false,
      addData: {},
      textMap: {
        update: '编辑扩容分析',
        create: '新增扩容分析'
      },
      dialogStatus: '',
      analysisFlag: false,
      analysisData: {},
      analysisId: null,
      charts: null,
      tableList: [],
      vendorData: [],
      historyFlag: false,
      analysisStatus: '',
      ruleId: null,
      historyList: [],
      total2: null,
      detailFlag: false,
      detailData: {},
      title2: ''
    }
  },
  computed: {
    forbid() {
      const time = {
        disabledDate: (time) => {
          return time.getTime() > new Date().getTime() // - (24 * 60 * 60 * 1000);
        }
      }
      return time
    }
  },
  created() {},
  methods: {
    getList() {
      getRules(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 查询
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleCreate(data) {
      if (data) {
        this.addData = Object.assign({}, data)
        this.dialogStatus = 'update'
        this.addData.rules = JSON.parse(this.addData.rules)
        const type = []
        this.addData.rules.forEach((item) => {
          type.push(item.metric)
        })
        if (type.indexOf('cpuUsageAverage') == -1) {
          this.addData.rules.push({ metric: 'memUsageAverage', operator: '', value: '', valueType: '', relation: '' })
        }
        if (type.indexOf('memUsageAverage') == -1) {
          this.addData.rules.push({ metric: 'memUsageAverage', operator: '', value: '', valueType: '', relation: '' })
        }
        if (type.indexOf('cpuReadySummation') == -1) {
          this.addData.rules.push({ metric: 'cpuReadySummation', operator: '', value: '', valueType: '', relation: '' })
        }
        this.addFlag = true
      } else {
        this.addData = {
          name: '',
          type: 'serverCapacityExpansion',
          rules: [
            { metric: 'cpuUsageAverage', operator: '', value: '', valueType: '', relation: '' },
            { metric: 'memUsageAverage', operator: '', value: '', valueType: '', relation: '' },
            { metric: 'cpuReadySummation', operator: '', value: '', valueType: '', relation: '' }
          ]
        }
        this.dialogStatus = 'create'
        this.addFlag = true
      }
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          const rulesFlag = this.addData.rules.every((item) => {
            if ((item.operator && item.value && item.valueType) || (!item.operator && !item.value && !item.valueType)) {
              return true
            } else {
              return false
            }
          })
          if (!rulesFlag) {
            return this.$message({
              message: '请确保规则信息填写完整',
              type: 'error'
            })
          }
          const addData = {
            rules: []
          }
          const edit = ['id', 'name', 'type', 'gmtCreate', 'creatorId', 'deleted']
          edit.forEach((attr) => {
            addData[attr] = this.addData[attr]
          })
          addData.rules = Object.assign([], this.addData.rules)
          for (let j = 0; j < addData.rules.length; j++) {
            if (!addData.rules[j].operator) {
              addData.rules.splice(j, 1)
              j--
            }
          }
          if (!addData.rules.length) {
            return this.$message.error('至少选一项规则填写！')
          }
          if (this.dialogStatus == 'update') {
            modifyRules(addData).then((data) => {
              if (data.success) {
                this.$message.success(data.message)
                this.getList()
                this.addFlag = false
              }
            })
          } else {
            createRules(addData).then((data) => {
              if (data.success) {
                this.$message.success(data.message)
                this.getList()
                this.addFlag = false
              }
            })
          }
        }
      })
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该方案吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeRules(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    changeValue(value, index) {
      if (value < 0) {
        this.addData.rules[index].value = 0
      }
    },
    analysis(row) {
      this.title2 = '分析'
      this.charts = []
      this.tableList = []
      this.analysisData = {
        vendorId: [], // 初始化为空数组
        time: [], // 初始化为空数组
        ...row, // 展开其他属性
        rules: JSON.parse(row.rules)
      }
      this.analysisStatus = 'analysis'
      this.analysisId = null
      this.getVendorData()
      this.analysisFlag = true
    },
    handleAnalysis() {
      this.$refs.analysisData.validate((valid) => {
        if (valid) {
          if (!this.analysisData.time.length) {
            return this.$message.error('请选择分析时间范围！')
          }
          const params = {
            id: this.analysisData.id,
            startTime: this.analysisData.time[0],
            endTime: this.analysisData.time[1]
          }
          if (this.analysisData.vendorId.includes(-1)) {
            // 全部
            params.types = ['OPENSTACK', 'VMWARE', 'INSPURRAIL', 'CNWARE', 'EASYSTACK', 'ARCHEROS', 'CLOUDTOWER', 'FUSIONSPHERE', 'USPHERE', 'SANGFOR']
          } else {
            params.vendorIds = this.analysisData.vendorId
          }
          handleAnalysis(params).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.getList()
              this.analysisFlag = false
            }
          })
        }
      })
    },
    handleHistory(id) {
      this.ruleId = id
      this.handleSearchHistory()
      this.historyFlag = true
    },
    getHistory() {
      getSnapshot(this.params2).then((data) => {
        this.historyList = data.data.rows
        this.total2 = data.data.total
      })
    },
    handleSearchHistory() {
      this.params2.page = 1
      this.params2.params = this.$tools.handleSearchParam({
        ruleId: this.ruleId
      })
      this.getHistory()
    },
    getAnalysisDetail(row) {
      this.title2 = '分析结果'
      this.analysisId = row.id
      this.getVendorData()
      getSnapshotDetail({
        id: row.id,
        startTime: row.startTime,
        endTime: row.endTime
      }).then((data) => {
        if (data.success) {
          this.analysisData.vendorId = [row.vendorId]
          this.analysisData.time = [row.startTime, row.endTime]
          this.analysisData.rules = JSON.parse(row.rule)
          this.charts = JSON.parse(data.data.result).charts.map((item) => {
            const { values, name } = item
            return {
              ...item,
              values: [
                {
                  name,
                  data: values
                }
              ]
            }
          })
          this.tableList = JSON.parse(data.data.result).list
          this.analysisStatus = 'history'
          this.analysisFlag = true
        }
      })
    },
    deleteHistory(id) {
      this.$confirm('您确定要删除该历史吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeSnapshot(id).then((data) => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.handleHistory(this.ruleId)
            }
          })
        })
        .catch(() => {})
    },
    getDetail(row) {
      getDetail(row.id).then((data) => {
        if (data.success) {
          this.detailData = data.data
          this.detailData.rules = JSON.parse(this.detailData.rules)
          this.detailFlag = true
        }
      })
    },
    // 导出任务
    handleExport(id) {
      const params = JSON.stringify({ operation: 'download' })
      exportAnalysis(id, params)
    },
    getVendorData() {
      conditionCloudVendor({
        condition: JSON.stringify({
          condition: 'listByTypes',
          types: ['OPENSTACK', 'VMWARE', 'INSPURRAIL', 'CNWARE', 'EASYSTACK', 'ARCHEROS', 'CLOUDTOWER', 'FUSIONSPHERE', 'USPHERE', 'SANGFOR']
        })
      }).then((data) => {
        if (data.success) {
          this.vendorData = data.data
          if (this.vendorData && this.vendorData.length > 0) {
            this.vendorData.unshift({
              id: -1,
              name: '全部'
            })
          }
        }
      })
    },
    handleChangeVendor(val) {
      if (val.includes(-1)) {
        // 如果选中了"全部"
        // 只保留"全部"选项
        this.vendorData.forEach((item) => {
          if (item.id !== -1) {
            item.disabled = true // 禁用其他选项
          }
        })
      } else {
        // 如果选择了其他选项
        this.vendorData.forEach((item) => {
          if (item.id === -1) {
            item.disabled = true // 禁用"全部"选项
          } else {
            item.disabled = false // 启用其他选项
          }
        })

        // 如果没有选中任何选项,则启用所有选项
        if (val.length === 0) {
          this.vendorData.forEach((item) => {
            item.disabled = false
          })
        }
      }
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
<style scoped>
.search-item {
  width: 12%;
}
.rule-box {
  padding: 10px;
  padding-top: 0px;
  border: 1px solid #dcdfe6;
}
</style>
