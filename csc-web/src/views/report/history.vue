<template>
  <el-card class="wrapper-container">
    <div style="border: 1px solid #dedcdc; line-height: 45px; padding-left: 30px">
      <el-row>
        <el-col :span="22">
          {{ title }}
        </el-col>
        <el-col :span="2">
          <el-button type="ghost" @click="goBack">
            <Icon type="icon-fanhui"></Icon>
            返回
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="search-content m-b">
      <el-row style="line-height: 50px">
        <el-col :span="3"> 报告类型：{{ detail.cycleType | reportCycleType }} </el-col>
        <el-col :span="7" v-if="reportCategory == 'Platform' || reportCategory == 'CloudServer' || reportCategory == 'Monitor' || reportCategory == 'Tenant' || reportCategory == 'Charge'">
          报告时间：<span v-if="detail.cycleType == 'ByDay'">每天{{ detail.startTime }}至{{ detail.endTime }}</span
          ><span v-if="detail.cycleType == 'ByWeek'"
            >每<span v-for="(item, index) in detail.weekList" :key="index">{{ item | weekFilter }}<span v-if="index != detail.weekList.length - 1">,</span></span></span
          ><span v-if="detail.cycleType == 'ByMonth'">每月{{ detail.startDate }}号至{{ detail.endDate }}号</span>
        </el-col>
        <el-col :span="4">
          生成时间：<span v-if="detail.cycleType == 'ByDay'">次日{{ detail.buildTime }}</span
          ><span v-if="detail.cycleType == 'ByWeek'">下{{ detail.weekDay | weekFilter }},{{ detail.weekTime }}</span
          ><span v-if="detail.cycleType == 'ByMonth'">次月{{ detail.weekDay }}号,{{ detail.weekTime }}</span>
        </el-col>
        <el-col :span="3"> 状态：{{ detail.status | reportStatusType }} </el-col>
        <el-col :span="3"> 订阅：{{ detail.subscriptionStatus | reportStatusType }} </el-col>
        <el-col :span="4"> 创建人：{{ detail.creater }} </el-col>
      </el-row>
      <el-form ref="form" label-width="90px" :inline="true">
        <el-form-item label="生成时间：">
          <el-date-picker v-model="listQuery.time" type="datetimerange" start-placeholder="创建开始时间" end-placeholder="创建结束时间"> </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="报表名称" prop="name">
        <template slot-scope="scope">
          <span class="detail-href" @click="getNext(scope.row.id)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creater"> </el-table-column>
      <el-table-column label="创建时间" prop="triggerTime"> </el-table-column>
      <el-table-column label="周期">
        <template slot-scope="scope">
          {{ scope.row.cycleType | reportCycleType }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160px">
        <template slot-scope="scope">
          <el-button type="text" @click="download(scope.row)">
            <Icon type="icon-batchimport"></Icon>
            导出
          </el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="remove(scope.row.id)">
            <Icon type="icon-delete"></Icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <!--下载-->
    <el-dialog title="导出报表历史" width="30%" :close-on-click-modal="false" v-if="binddialogFormVisible" :visible.sync="binddialogFormVisible">
      <el-button type="ghost" v-for="(item, index) in downloadList" :key="index" @click="downLoadClick(item)">
        {{ item.name }}
      </el-button>
      <a href="#" v-show="true" id="links" download></a>
    </el-dialog>
  </el-card>
</template>
<script>
/* global $ */
import { reportDetail, reportDetailList, reportDetailRemove, downloadRemoportDetail } from 'services/report/index'
import { downloadFile } from 'utils'
export default {
  data() {
    return {
      list: null,
      total: null,
      title: '',
      route: '',
      listQuery: {
        time: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      reportId: this.$route.params.configTemplateId,
      reportCategory: this.$route.params.reportCategory,
      binddialogFormVisible: false,
      downloadList: [],
      detail: {}
    }
  },
  created() {
    switch (this.$route.params.reportCategory) {
      case 'Platform':
        this.title = '平台综合报表历史'
        this.route = 'platformDetail'
        break
      case 'CloudServer':
        this.title = '云主机综合报表历史'
        this.route = 'vmDetail'
        break
      case 'Server':
        this.title = '物理机综合报表历史'
        this.route = 'hostDetail'
        break
      case 'Storage':
        this.title = '存储综合报表历史'
        this.route = 'storageDetail'
        break
      case 'Charge':
        this.title = '计量计费报表历史'
        this.route = 'changeDetail'
        break
      case 'Monitor':
        this.title = '监控报表历史'
        this.route = 'monitorDetail'
        break
      case 'Tenant':
        this.title = '租户报表历史'
        this.route = 'tenantDetail'
        break
    }
    this.getDetail(this.reportId)
    this.handleSearch()
  },
  methods: {
    getNext(id) {
      this.$router.push({ name: this.route, params: { id: id } })
    },
    getDetail(id) {
      reportDetail({ id: id }).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detail.weekList = JSON.parse(this.detail.weeks)
          if (this.detail.buildTime) {
            const list = this.detail.buildTime.split(',')
            this.detail.weekDay = list[0]
            this.detail.weekTime = list[1]
          }
        }
      })
    },
    // 导出
    download(item) {
      this.binddialogFormVisible = true
      this.downloadList = [
        { name: 'PDF', value: 'application/pdf', id: item.id },
        { name: 'EXCEL', value: 'application/vnd.ms-excel', id: item.id },
        { name: 'WORD', value: 'application/msword', id: item.id }
      ]
    },
    downLoadClick(item) {
      this.binddialogFormVisible = false
      const params = JSON.stringify({ id: item.id, fileFormat: item.value, reportCategory: this.reportCategory })
      if (item.value == 'application/pdf') {
        document.getElementById('links').href = encodeURI(`/api/cos/v1/reports/${item.id}?params=${params}`)
        document.getElementById('links').click()
      } else {
        downloadFile(`/cos/v1/reports/${item.id}`, { params })
      }
    },
    remove(id) {
      this.$confirm('此操作将删除该报表历史,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        reportDetailRemove({ id: id }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.handleSearch()
          }
        })
      })
    },
    getList() {
      reportDetailList(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      if (!this.listQuery.time) this.listQuery.time = ''
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        configTemplateId: this.reportId,
        'triggerTime:RANGE': this.listQuery.time
      })
      this.getList()
    },
    goBack() {
      this.$router.back(-1)
    }
  }
}
</script>

<style scoped>
.txts {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
