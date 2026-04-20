<template>
  <div>
    <AdvanceTable title="流程列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="add()" slot="operate" icon="el-icon-plus">新增</el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="status | templateStateColor">
          {{ status | templateState }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleEdit(record.id)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)"><i class="el-icon-delete"></i> 删除</el-button>
        <div class="action-divider"></div>
        <el-dropdown @command="dropdownCLick" trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="record.state == 'TERMINATION'" :command="{ index: 1, id: record.id }"> 终止 </el-dropdown-item>
            <el-dropdown-item :disabled="record.state == 'ACTIVE'" :command="{ index: 2, id: record.id }"> 激活 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
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
          type="ghost"
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
          type="ghost"
          @click.native="
            activeFlag = false
            $refs['activeData'].resetField()
          "
          >取消</el-button
        >
        <el-button type="primary" @click.native="activeOk">确定</el-button>
      </div>
    </el-dialog>
    <common-detail v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <template #item_container>
        <common-detail-item label="流程名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="流程描述">{{ detailData.remark }}</common-detail-item>
      </template>
      <el-tabs value="second">
        <el-tab-pane label="流程图" name="second">
          <detail :graph="detailData.graph"></detail>
        </el-tab-pane>
        <el-tab-pane label="操作历史" name="third">
          <basic-table :data="historyData">
            <el-table-column prop="name" label="流程名称"></el-table-column>
            <el-table-column prop="operationRemark" label="备注" show-overflow-tooltip></el-table-column>
            <el-table-column prop="menderName" label="更新人"></el-table-column>
            <el-table-column prop="gmtModify" label="更新时间"></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </div>
</template>

<script>
import { columns, searchConfigs } from './config'
import Detail from './flow_create/detail.vue'
import { getFlow, removeFlow, getFlowDetail, operateFlow, flowHistory } from 'services/services/flow'

export default {
  components: {
    Detail
  },
  data() {
    return {
      columns,
      searchConfigs,
      loading: false,
      templateId: -1,
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
      detailData: {},
      finalityTotal: 0,
      detailFlag: false,
      template: {},
      historyData: []
    }
  },
  created() {},
  mounted() {},
  methods: {
    // 详情
    getDetail(id) {
      getFlowDetail(id).then((data) => {
        this.detailData = data.data
        this.detailFlag = true
        this.getDetailHost(data.data.id)
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getDetailHost(id) {
      flowHistory(id).then((data) => {
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
      operateFlow(this.templateId, params).then((data) => {
        this.$message({
          type: 'success',
          message: data.message
        })
        this.finalityFlag = false
        this.finalityData.remark = ''
        this.getList()
      })
    },

    // 激活确认
    activeOk() {
      const params = {
        action: 'active',
        remark: this.finalityData.remark
      }
      operateFlow(this.templateId, params).then((data) => {
        this.$message({
          type: 'success',
          message: data.message
        })
        this.activeFlag = false
        this.activeData.remark = ''
        this.getList()
      })
    },

    // 新增模版
    add() {
      this.$router.push({ name: 'CreateFlow' })
    },
    // 编辑
    handleEdit(id) {
      this.$router.push({ name: 'ModifyFlow', params: { id: id } })
    },
    handleDelete(id) {
      this.$confirm('此操作将永久删除该流程, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeFlow(id).then((data) => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
          }
        })
      })
    },
    dropdownCLick(command) {
      this.templateId = command.id
      switch (command.index) {
        case 1:
          this.finalityFlag = true
          break
        case 2:
          this.activeFlag = true
          break
      }
    },
    // list请求
    getList() {
      this.loading = true
      getFlow(this.params)
        .then((data) => {
          if (data.success) {
            this.list = data.data.rows
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
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
