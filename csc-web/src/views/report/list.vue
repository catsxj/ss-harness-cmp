<template>
  <el-card class="wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-input placeholder="模板名称" v-model="listQuery.name"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-date-picker v-model="listQuery.time" type="datetimerange" start-placeholder="创建开始时间" end-placeholder="创建结束时间"> </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button class="filter-item" style="margin-left: 10px" @click="handleCreate()" type="primary">
          <Icon type="icon-add"></Icon>
          新增
        </el-button>
      </el-form-item>
    </el-form>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="模板名称" prop="name" show-overflow-tooltip> </el-table-column>
      <el-table-column label="创建人" prop="creater" show-overflow-tooltip> </el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
      <el-table-column label="周期" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.cycleType | reportCycleType }}
        </template>
      </el-table-column>
      <el-table-column label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | reportStatusTypeColor">{{ scope.row.status | reportStatusType('status') }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" @click="goHistory(scope.row)">
            <Icon type="icon-lishirenwu"></Icon>
            查看历史
          </el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="handleDelete(scope.row.id)">
            <Icon type="icon-delete"></Icon>
            删除
          </el-button>
          <div class="action-divider"></div>
          <el-dropdown @command="dropdownClick" trigger="click">
            <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="!scope.row.status" :command="{ id: scope.row.id, index: 1 }">
                <Icon type="icon-lishirenwu"></Icon>
                启用
              </el-dropdown-item>
              <el-dropdown-item v-if="scope.row.status" :command="{ id: scope.row.id, index: 2 }">
                <Icon type="icon-yichu"></Icon>
                禁用
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </basic-table>
    <!--新增界面-->
    <el-dialog :title="title1" :close-on-click-modal="false" width="65%" v-if="dialogFormVisible" :visible.sync="dialogFormVisible">
      <el-form :model="addData.basics" label-width="120px" ref="addData" :rules="rule">
        <el-tabs v-model="activeName" type="border-card" @tab-click="tab()">
          <el-tab-pane label="基础信息" name="first">
            <el-form-item label="报告名称：" required>
              <el-input v-model="addData.basics.name" auto-complete="off" style="width: 80%"></el-input>
            </el-form-item>
            <el-form-item label="报告周期：" required>
              <el-radio v-model="addData.basics.cycleType" label="ByDay" border>日报</el-radio>
              <el-radio v-model="addData.basics.cycleType" label="ByWeek" border>周报</el-radio>
              <el-radio v-model="addData.basics.cycleType" label="ByMonth" border>月报</el-radio>
            </el-form-item>
            <template v-if="addData.basics.cycleType == 'ByDay'">
              <el-form-item label="时间范围：" required v-if="reportCategory == 'Platform' || reportCategory == 'CloudServer' || reportCategory == 'Monitor' || reportCategory == 'Tenant' || reportCategory == 'Charge'">
                <div style="float: left; padding-right: 20px">每天</div>
                <el-time-picker is-range v-model="addData.basics.timeRange" format="HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围"> </el-time-picker>
              </el-form-item>
              <el-form-item label="生成时间：" required>
                <el-select disabled style="width: 20%" placeholder="次日">
                  <el-option key="次日" label="次日" value="次日"></el-option>
                </el-select>
                <el-time-select v-model="addData.basics.buildTime" :picker-options="{ start: '00:00', step: '1:00', end: '24:00' }" placeholder="选择时间" style="margin-left: 20px; width: 25%"> </el-time-select>
              </el-form-item>
            </template>
            <template v-if="addData.basics.cycleType == 'ByWeek'">
              <el-form-item label="时间范围：" required v-if="reportCategory == 'Platform' || reportCategory == 'CloudServer' || reportCategory == 'Monitor' || reportCategory == 'Tenant' || reportCategory == 'Charge'">
                <div style="float: left; padding-right: 20px">每周</div>
                <el-checkbox-group v-model="addData.basics.weeks">
                  <el-checkbox v-for="item in weekOptions" :label="item.value" :key="item.value">{{ item.name }} </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="生成时间：" required>
                <el-select disabled style="width: 20%" placeholder="下周">
                  <el-option key="下周" label="下周" value="下周"></el-option>
                </el-select>
                <el-select v-model="createWeekDay" style="margin-left: 20px; width: 25%" placeholder="请选择">
                  <el-option v-for="item in weekOptions" :key="item.name" :label="item.name" :value="item.value"></el-option>
                </el-select>
                <el-time-select v-model="createWeekHour" :picker-options="{ start: '00:00', step: '1:00', end: '24:00' }" placeholder="选择时间" style="margin-left: 20px; width: 25%"> </el-time-select>
              </el-form-item>
            </template>
            <template v-if="addData.basics.cycleType == 'ByMonth'">
              <el-form-item label="时间范围：" required v-if="reportCategory == 'Platform' || reportCategory == 'CloudServer' || reportCategory == 'Monitor' || reportCategory == 'Tenant' || reportCategory == 'Charge'">
                <div style="float: left">每月</div>
                <el-select v-model="addData.basics.startDate" style="margin-left: 20px; width: 25%" placeholder="请选择">
                  <el-option v-for="item in monthOptions" :key="item.name" :label="item.name" :value="item.value"></el-option>
                </el-select>
                <div style="display: inline-block; padding-left: 20px">至</div>
                <el-select v-model="addData.basics.endDate" style="margin-left: 20px; width: 25%" placeholder="请选择">
                  <el-option v-for="item in monthOptions" :key="item.name" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="生成时间：" required>
                <el-select disabled style="width: 20%" placeholder="次月">
                  <el-option label="次月" value="次月"></el-option>
                </el-select>
                <el-select v-model="nextMonthWeek" style="margin-left: 20px; width: 25%" placeholder="请选择">
                  <el-option v-for="item in monthOptions" :key="item.name" :label="item.name" :value="item.value"></el-option>
                </el-select>
                <el-time-select v-model="nextMonthDay" :picker-options="{ start: '00:00', step: '1:00', end: '24:00' }" placeholder="选择时间" style="margin-left: 20px; width: 25%"> </el-time-select>
              </el-form-item>
            </template>
            <el-form-item label="状态：" required>
              <el-radio v-model="addData.basics.status" label="true" border>启用</el-radio>
              <el-radio v-model="addData.basics.status" label="false" border>停用</el-radio>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="目录信息" name="second">
            <el-container>
              <el-aside width="70%" style="overflow: hidden">
                <el-form-item label="目录标题：">
                  <el-input v-model="name" :maxlength="16" auto-complete="off"></el-input>
                </el-form-item>
                <catelog :reportCategory="reportCategory" @back="getIds" ref="catelog"></catelog>
                <el-form-item label="选择指标：" v-if="targetList.length">
                  <el-checkbox-group v-model="selectList">
                    <el-row>
                      <el-col :span="8" v-for="(item, key) in targetList" :key="key">
                        <el-checkbox :label="item.id">{{ item.name }}</el-checkbox>
                      </el-col>
                    </el-row>
                  </el-checkbox-group>
                </el-form-item>
                <el-button type="ghost" style="float: right" @click="save">确定</el-button>
              </el-aside>
              <el-container width="30%;">
                <div style="border: 1px solid #e4e3e3; width: 100%; margin-left: 20px">
                  <el-table :data="addData.contents" style="width: 100%" aligh="center">
                    <el-table-column prop="name" label="名称"> </el-table-column>
                    <el-table-column label="操作">
                      <template slot-scope="scope">
                        <el-button type="ghost" size="mini" @click="removeContent(scope.row)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-container>
            </el-container>
          </el-tab-pane>
          <el-tab-pane label="订阅信息" name="third">
            <el-form-item label="报告名称：" required>
              <el-input v-model="addData.subscription.name" auto-complete="off" style="width: 80%" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="订阅信息：" required>
              <el-radio v-model="addData.subscription.status" :label="true" border>启用</el-radio>
              <el-radio v-model="addData.subscription.status" :label="false" border>停用</el-radio>
            </el-form-item>
            <el-form-item label="收件人：" required v-if="addData.subscription.status">
              <el-tag :key="index" v-for="(item, index) in userList" closable :disable-transitions="false" @close="handleClose(index)">
                {{ item.name }}
              </el-tag>
              <el-button size="mini" @click="handleInputConfirm" type="primary">新增收件人</el-button>
            </el-form-item>
            <el-form-item label="收件人：" v-else>
              <el-tag :key="index" v-for="(item, index) in userList" closable :disable-transitions="false" @close="handleClose(index)">
                {{ item.name }}
              </el-tag>
              <el-button size="mini" @click="handleInputConfirm" type="primary">新增收件人</el-button>
            </el-form-item>
            <el-form-item label="文件形式：" :required="addData.subscription.status">
              <el-checkbox-group v-model="fileFormat">
                <el-checkbox label="excel"></el-checkbox>
                <el-checkbox label="word"></el-checkbox>
                <el-checkbox label="pdf"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>

    <!--选择收件人-->
    <el-dialog title="收件人列表" v-if="userFlag" :visible.sync="userFlag">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="用户姓名" v-model="searchUser.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearchUser">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table label-width="90px" :data="userListData" tooltip-effect="dark" stripe border fit ref="basicTable" @select="handleSelectItems" @select-all="handleSelectAlls">
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column prop="username" label="登录账号"> </el-table-column>
        <el-table-column prop="name" label="用户姓名"> </el-table-column>
        <el-table-column prop="mobile" label="移动电话"> </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination @size-change="handleSearchUserS" @current-change="getUser" :current-page.sync="paramt.page" :page-sizes="[5, 10, 20, 30, 50]" :page-size="paramt.rows" layout="total, sizes, prev, pager, next, jumper" :total="userTotal"> </el-pagination>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button
          type="ghost"
          @click.native="
            userFlag = false
            radioSelect = ''
          "
          >取消</el-button
        >
        <el-button type="primary" @click.native="senderSubmit">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>
<style scoped>
.el-row {
  line-height: 32px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
<script>
import { getReport, getReportResource, getReportContent, createReport, modifyReport, deleteReport } from 'services/report/index'
import { getUser } from 'services/system/user'
import catelog from './catelog'
export default {
  components: { catelog },
  data() {
    return {
      idLists: [],
      selectLists: [],
      // 校验
      rule: {
        name: [{ required: true, message: '该字段为必填字段' }],
        weeks: [{ required: true, message: '该字段为必填字段' }],
        timeRange: [{ required: true, message: '该字段为必填字段' }],
        startDay: [{ required: true, message: '该字段为必填字段' }]
      },
      // 周报生成时间
      createWeekDay: '',
      createWeekHour: '',
      // 月报生成时间
      nextMonthWeek: '',
      nextMonthDay: '',
      catelogList: [],
      targetList: [],
      selectList: [],
      activeName: 'first',
      list: null,
      total: null,
      userTotal: 0,
      searchUser: {
        name: ''
      },
      listQuery: {
        name: '',
        time: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      paramd: {
        page: 1,
        rows: 10
      },
      paramt: {
        page: 1,
        rows: 10,
        params: [{ params: { status: 'NORMAL' }, status: 'EQ' }]
      },
      name: '',
      resourseList: [],
      resourseTotal: 0,
      // 新增界面数据
      dialogFormVisible: false,
      title1: '',
      addData: {
        basics: {
          cycleType: 'ByDay'
        },
        contents: [],
        subscription: {}
      },
      weekOptions: [
        { name: '周一', value: '1' },
        { name: '周二', value: '2' },
        { name: '周三', value: '3' },
        {
          name: '周四',
          value: '4'
        },
        { name: '周五', value: '5' },
        { name: '周六', value: '6' },
        { name: '周日', value: '0' }
      ],
      monthOptions: [
        { name: '1号', value: '1' },
        { name: '2号', value: '2' },
        { name: '3号', value: '3' },
        { name: '4号', value: '4' },
        { name: '5号', value: '5' },
        { name: '6号', value: '6' },
        { name: '7号', value: '7' },
        { name: '8号', value: '8' },
        { name: '9号', value: '9' },
        { name: '10号', value: '10' },
        { name: '11号', value: '11' },
        { name: '12号', value: '12' },
        { name: '13号', value: '13' },
        { name: '14号', value: '14' },
        { name: '15号', value: '15' },
        { name: '16号', value: '16' },
        { name: '17号', value: '17' },
        { name: '18号', value: '18' },
        { name: '19号', value: '19' },
        { name: '20号', value: '20' },
        { name: '21号', value: '21' },
        { name: '22号', value: '22' },
        { name: '23号', value: '23' },
        { name: '24号', value: '24' },
        { name: '25号', value: '25' },
        { name: '26号', value: '26' },
        { name: '27号', value: '27' },
        { name: '28号', value: '28' },
        { name: '29号', value: '29' },
        { name: '30号', value: '30' },
        { name: '31号', value: '31' }
      ],
      multipleSelection: [],
      // 修改状态
      statusData: {
        status: ''
      },
      reportCategory: 'Platform',
      searchName: '',
      searchSn: '',
      fileFormat: [],
      userFlag: false,
      radioSelect: '',
      userList: [],
      userListData: []
    }
  },
  created() {
    switch (this.$route.name) {
      case 'platform':
        this.reportCategory = 'Platform'
        break
      case 'reportVm':
        this.reportCategory = 'CloudServer'
        break
      case 'reportHost':
        this.reportCategory = 'Server'
        break
      case 'reportStorage':
        this.reportCategory = 'Storage'
        break
      case 'reportCharge':
        this.reportCategory = 'Charge'
        break
      case 'reportMonitor':
        this.reportCategory = 'Monitor'
        break
      case 'reportTenant':
        this.reportCategory = 'Tenant'
        break
    }
    this.handleSearch()
  },
  watch: {
    $route: function (val, oldVal) {
      switch (val.name) {
        case 'platform':
          this.reportCategory = 'Platform'
          break
        case 'reportVm':
          this.reportCategory = 'CloudServer'
          break
        case 'reportHost':
          this.reportCategory = 'Server'
          break
        case 'reportStorage':
          this.reportCategory = 'Storage'
          break
        case 'reportCharge':
          this.reportCategory = 'Charge'
          break
        case 'reportMonitor':
          this.reportCategory = 'Monitor'
          break
        case 'reportTenant':
          this.reportCategory = 'Tenant'
          break
      }
      this.handleSearch()
    }
  },
  methods: {
    getIds(data) {
      this.multipleSelection = data
    },
    refreshId() {
      this.idLists = []
      this.selectLists.forEach(item => {
        this.idLists.push(item.id)
      })
    },
    // 单选
    handleSelectItems(selection, row) {
      this.refreshId()
      if (this.idLists.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectLists.length; j++) {
          const item = this.selectLists[j]
          if (item.id == row.id) {
            this.selectLists.splice(j, 1)
            break
          }
        }
      } else {
        this.selectLists.push(row)
      }
    },
    // 全选
    handleSelectAlls(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.userListData.forEach(item => {
          if (this.idLists.indexOf(item.id) == -1) {
            this.selectLists.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.userListData.forEach(item => {
          if (this.idLists.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectLists.length; j++) {
              const row = this.selectLists[j]
              if (item.id == row.id) {
                this.selectLists.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    // 删除收件人
    handleClose(index) {
      this.userList.splice(index, 1)
    },
    // 新增收件人
    handleInputConfirm() {
      if (this.userList.length >= 5) {
        this.$notify({
          title: '提示',
          message: '收件人最多五个',
          type: 'error'
        })
        return
      }
      this.selectLists = this.userList
      this.userFlag = true
      this.searchUser = {
        name: ''
      }
      this.handleSearchUser()
    },
    // 新增收件人确定
    senderSubmit() {
      if (this.selectLists.length == 0) {
        this.$message.error('请选择收件人！')
        return
      }
      if (this.selectLists.length > 5) {
        this.$message.error('收件人不可超过五个！')
        return
      }
      this.userList = this.selectLists
      this.userFlag = false
    },
    // 请求收件人
    getUser() {
      getUser(this.paramt).then(data => {
        if (data.success) {
          this.userListData = data.data.rows
          this.userTotal = data.data.total
          this.refreshId()
          this.userListData.forEach(item => {
            const self = this
            setTimeout(function () {
              if (self.idLists.indexOf(item.id) > -1) self.$refs.basicTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    handleSearchUser() {
      this.paramt.page = 1
      this.paramt.params = this.$tools.handleSearchParam({
        status: 'NORMAL',
        'name:LK': this.searchUser.name
      })
      this.getUser()
    },
    handleSearchUserS(val) {
      this.paramt.rows = val
      this.handleSearchUser()
    },
    // 单选
    handleSelectItem(selection, row) {
      const idList = []
      this.multipleSelection.forEach(item => {
        idList.push(item.id)
      })
      if (idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.multipleSelection.length; j++) {
          if (this.multipleSelection[j].id == row.id) {
            this.multipleSelection.splice(j, 1)
            break
          }
        }
      } else {
        this.multipleSelection.push(row)
      }
    },
    // 多选
    handleSelectAll(selection) {
      const idList = []
      this.multipleSelection.forEach(item => {
        idList.push(item.id)
      })
      if (selection.length) {
        // 全选情况下
        this.resourseList.forEach(item => {
          if (idList.indexOf(item.id) == -1) {
            this.multipleSelection.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.resourseList.forEach(item => {
          this.multipleSelection.forEach((item1, index) => {
            if (item.id == item1.id) {
              this.multipleSelection.splice(index, 1)
            }
          })
        })
      }
    },

    // 切换目录时操作
    tab() {
      if (this.activeName == 'third') {
        this.addData.subscription.name = this.addData.basics.name
      }
    },

    // 目录信息删除
    removeContent(row) {
      this.addData.contents.forEach((data, index) => {
        if (data == row) {
          this.addData.contents.splice(index, 1)
        }
      })
    },
    // 目录信息保存
    save() {
      if (!this.name) {
        this.$notify({
          title: '提示',
          message: '请输入目录标题',
          type: 'error'
        })
        return
      }
      let flag = false
      this.addData.contents.forEach(item => {
        if (this.name == item.name) {
          flag = true
          return true
        }
      })
      if (flag) {
        this.$notify({
          title: '提示',
          message: '目录标题不可重复',
          type: 'error'
        })
        return
      }
      if (this.multipleSelection.length == 0) {
        this.$notify({
          title: '提示',
          message: '请选择资源',
          type: 'error'
        })
        return
      }
      const str = []
      this.multipleSelection.forEach(data => {
        str.push(data.id)
      })
      this.multipleSelection = []
      this.$refs.catelog.clearIds()
      const obj = {
        name: this.name,
        contentTemplates: this.selectList,
        resourceIds: str.join()
      }
      this.addData.contents.push(obj)
      this.name = ''
      this.selectList = []
    },

    dropdownClick(command) {
      switch (command.index) {
        case 1:
          this.handleStart(command.id, true)
          break
        case 2:
          this.handleStart(command.id, false)
          break
      }
    },
    getList() {
      getReport(this.params).then(data => {
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
        reportCategory: this.reportCategory,
        'name:LK': this.listQuery.name,
        'gmtCreate:RANGE': this.listQuery.time
      })
      this.getList()
    },
    // 请求指标
    getTarget() {
      getReportContent({ reportCategory: this.reportCategory }).then(data => {
        if (data.success) {
          this.targetList = data.data
        }
      })
    },
    handleCreate() {
      this.name = ''
      this.createWeekDay = ''
      this.createWeekHour = ''
      this.nextMonthWeek = ''
      this.nextMonthDay = ''
      this.fileFormat = []
      this.userList = []
      this.resourseList = []
      this.multipleSelection = []
      this.searchName = ''
      this.addData = {
        basics: {
          cycleType: 'ByDay',
          weeks: [],
          reportCategory: this.reportCategory,
          status: 'false'
        },
        contents: [],
        subscription: {
          status: false
        }
      }
      this.title1 = '报表模版新增'
      this.getTarget()
      this.dialogFormVisible = true
      this.activeName = 'first'
    },
    addSubmit() {
      this.$refs.addData.validate(valid => {
        if (valid) {
          if (!this.addData.basics.name) {
            this.$message.error('名称不能为空')
            return
          }
          if (this.addData.basics.cycleType == 'ByDay') {
            if (this.reportCategory == 'Platform' || this.reportCategory == 'CloudServer' || this.reportCategory == 'Monitor' || this.reportCategory == 'Tenant' || this.reportCategory == 'Charge') {
              if (!this.addData.basics.timeRange) {
                this.$message.error('请选择时间范围')
                return
              }
              const dates = new Date(this.addData.basics.timeRange[0])
              const dates1 = new Date(this.addData.basics.timeRange[1])
              this.addData.basics.startTime = dates.getHours() + ':' + dates.getMinutes()
              this.addData.basics.endTime = dates1.getHours() + ':' + dates1.getMinutes()
            }
            if (!this.addData.basics.buildTime) {
              this.$message.error('请选择生成时间')
              return
            }
          } else if (this.addData.basics.cycleType == 'ByWeek') {
            if (this.reportCategory == 'Platform' || this.reportCategory == 'CloudServer' || this.reportCategory == 'Monitor' || this.reportCategory == 'Tenant') {
              if (this.addData.basics.weeks.length == 0) {
                this.$message.error('请选择时间范围')
                return
              }
            }
            if (!this.createWeekDay || !this.createWeekHour) {
              this.$message.error('请选择生成时间')
              return
            }
            this.addData.basics.buildTime = this.createWeekDay + ',' + this.createWeekHour
          } else if (this.addData.basics.cycleType == 'ByMonth') {
            if (this.reportCategory == 'Platform' || this.reportCategory == 'CloudServer' || this.reportCategory == 'Monitor' || this.reportCategory == 'Tenant') {
              if (!this.addData.basics.startDate || !this.addData.basics.endDate) {
                this.$message.error('请选择时间范围')
                return
              }
              if (this.addData.basics.startDate > this.addData.basics.endDate) {
                this.$message.error('请选择正确的时间范围')
                return
              }
            }
            if (!this.nextMonthWeek) {
              this.$message.error('请选择生成时间')
              return
            }
            this.addData.basics.buildTime = this.nextMonthWeek + ',' + this.nextMonthDay
          }
          this.addData.subscription.fileFormat = this.fileFormat.join()
          if (this.addData.contents.length == 0) {
            this.$message.error('目录不能为空')
            return
          }
          // 收件人处理
          const emailList = []
          this.userList.forEach(item => {
            emailList.push(item.email)
          })
          this.addData.subscription.email = emailList.join(',')
          // 如果没有选择用户
          if (this.userList.length == 0 && this.addData.subscription.status) {
            this.$message.error('请选择收件人')
            return
          }
          // 如果没有选择报告文件形式
          if (this.fileFormat.length == 0 && this.addData.subscription.status) {
            this.$message.error('请选择文件形式')
            return
          }
          this.$refs.addData.validate(valid => {
            if (valid) {
              createReport(this.addData).then(data => {
                if (data.success) {
                  this.$notify({
                    message: data.message,
                    type: 'success'
                  })
                  this.dialogFormVisible = false
                  this.getList()
                }
              })
            }
          })
        } else {
          return false
        }
      })
    },
    goHistory(row) {
      this.$router.push({
        name: 'reportHistory',
        params: { configTemplateId: row.id, reportCategory: this.reportCategory, detail: row }
      })
    },
    handleStart(id, flag) {
      let title = ''
      if (flag) title = '启用'
      else title = '禁用'
      this.$confirm('您确定要' + title + '该模板吗?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        modifyReport({ id: id, status: flag }).then(data => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该模板吗?', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        deleteReport({ id: id }).then(data => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getList()
          }
        })
      })
    }
  }
}
</script>
