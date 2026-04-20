<template>
  <el-card class="wrapper">
    <div v-show="!detaildialogVisible">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="流程名称" v-model="listQuery.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-date-picker v-model="listQuery.date" type="datetimerange" start-placeholder="创建开始时间" end-placeholder="创建结束时间"> </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button @click="add" type="primary"><i class="el-icon-plus"></i>新增</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total">
        <el-table-column label="流程名称" prop="name" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-button type="text" @click="getDetail(scope.row.id)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.state | templateStateColor">{{ scope.row.state | templateState }}</status-icon>
          </template>
        </el-table-column>
        <el-table-column label="创建人" prop="creatorName"></el-table-column>
        <el-table-column label="创建时间" prop="gmtCreate" min-width="110px"> </el-table-column>
        <el-table-column label="修改时间" prop="gmtModify" min-width="110px"> </el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <el-button type="text" @click="dropdownCLick({ index: 2, id: scope.row.id })"><i class="el-icon-edit"></i> 编辑 </el-button>
            <div class="action-divider"></div>
            <el-button type="text" @click="dropdownCLick({ index: 3, id: scope.row.id })"> <i class="el-icon-delete"></i> 删除 </el-button>
            <div class="action-divider"></div>
            <el-dropdown @command="dropdownCLick">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :disabled="scope.row.state == 'TERMINATION'" :command="{ index: 4, id: scope.row.id }"> 终止 </el-dropdown-item>
                <el-dropdown-item :disabled="scope.row.state == 'ACTIVE'" :command="{ index: 5, id: scope.row.id }"> 激活 </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
    </div>

    <!--终结-->
    <el-dialog title="终止" :close-on-click-modal="false" v-if="finalityFlag" :visible.sync="finalityFlag">
      <el-form label-width="90px" :model="finalityData" ref="finalityData">
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="remark">
              <el-input placeholder="描述" v-model="finalityData.remark"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click.native="
            finalityFlag = false
            $refs['finalityData'].resetField()
          "
          >取消</el-button
        >
        <el-button type="primary" @click.native="finalityOk">确定</el-button>
      </div>
    </el-dialog>

    <!--激活-->
    <el-dialog title="激活" :close-on-click-modal="false" v-if="activeFlag" :visible.sync="activeFlag">
      <el-form label-width="90px" :model="activeData" ref="activeData">
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="remark">
              <el-input placeholder="描述" v-model="activeData.remark"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click.native="
            activeFlag = false
            $refs['activeData'].resetField()
          "
          >取消</el-button
        >
        <el-button type="primary" @click.native="activeOk">确定</el-button>
      </div>
    </el-dialog>

    <!--详情-->
    <common-detail v-if="detaildialogVisible" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="流程名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="流程描述">{{ detail.remark }}</common-detail-item>
      </template>
      <el-tabs value="first">
        <el-tab-pane label="流程展示" name="first">
          <graph-detail :graph="detail.graph"></graph-detail>
        </el-tab-pane>
        <el-tab-pane name="second">
          <span slot="label"><i class="el-icon-date"></i> 操作历史</span>
          <el-table :data="historyData" stripe border fit style="width: 100%" header-cell-class-name="table-header">
            <el-table-column prop="name" label="流程名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="operationRemark" label="备注" show-overflow-tooltip></el-table-column>
            <el-table-column prop="menderName" label="更新人" show-overflow-tooltip></el-table-column>
            <el-table-column prop="gmtModify" label="更新时间" show-overflow-tooltip></el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </el-card>
</template>

<script>
import GraphDetail from './create_flow/detail.vue'
import { getFlow, removeFlow, getFlowDetail, operateFlow, flowHistory } from 'services/services/flow'
import { bindFlowItems } from 'services/services/catelog'

export default {
  components: {
    GraphDetail
  },
  data() {
    return {
      templateId: -1,
      listQuery: {
        name: '',
        date: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      paramd: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      finalityData: {},
      activeData: {},
      finalityFlag: false,
      activeFlag: false,
      templateData: [],
      detail: {},
      finalityTotal: 0,
      detaildialogVisible: false,
      template: {},
      historyData: [],
      serviceData: [],
      params2: {
        page: 1,
        rows: 10
      },
      total2: 0
    }
  },
  created() {
    this.handleSearch()
    // this.$webSocket.OnMessage = this.message
  },
  mounted() {},
  methods: {
    goBack() {
      this.detaildialogVisible = false
    },
    // 详情
    getDetail(id) {
      getFlowDetail(id).then(data => {
        this.detail = data.data
        this.detaildialogVisible = true
        this.getDetailHost(data.data.id)
      })
    },
    getDetailHost(id) {
      flowHistory(id).then(data => {
        if (data.success) {
          this.historyData = data.data
        }
      })
    },
    // 终结确认
    finalityOk() {
      const params = {
        action: 'terminate',
        remark: this.finalityData.remark
      }
      operateFlow(this.templateId, params).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.finalityFlag = false
          this.finalityData.remark = ''
          this.handleSearch()
        }
      })
    },

    // 激活确认
    activeOk() {
      const params = {
        action: 'active',
        params: JSON.stringify({ remark: this.finalityData.remark })
      }
      operateFlow(this.templateId, params).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.activeFlag = false
          this.activeData.remark = ''
          this.handleSearch()
        }
      })
    },

    // 新增模版
    add() {
      this.$router.push({ name: 'CreateFlow' })
    },
    // 下拉点击事件
    dropdownCLick(command) {
      this.templateId = command.id
      switch (command.index) {
        case 2:
          this.$router.push({ name: 'ModifyFlow', params: { id: command.id } })
          break
        case 3:
          this.$confirm('此操作将永久删除该流程, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            removeFlow(command.id).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.handleSearch()
              }
            })
          })
          break
        case 4:
          this.finalityFlag = true
          break
        case 5:
          this.activeFlag = true
          break
      }
    },
    // list请求
    getList() {
      getFlow(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        catalog: this.listQuery.catalog,
        category: this.listQuery.category,
        specialType: this.listQuery.specialType,
        'name:LK': this.listQuery.name,
        'gmtCreate:RANGE': this.listQuery.date
      })
      this.getList()
    },
    handleSizeChange(val) {
      this.params.rows = val
      this.getList()
    },
    // webSocket事件
    message(data) {
      this.getList()
    }
  }
}
</script>

<style>
.console-title {
  margin-top: 10px;
  margin-bottom: 15px;
  text-indent: 8px;
  border-left: 3px solid #88b7e0;
  font-size: 14px;
  font-weight: 600;
}
</style>
