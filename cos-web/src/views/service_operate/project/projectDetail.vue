<template>
  <common-detail :setting="{ type: 'host' }" :title="detailData.name" @goBack="config.visible = false">
    <template v-slot:item_container>
      <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel + '名称'">{{ detailData.name }}</common-detail-item>
      <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel + '经理'">{{ detailData.managerName }}</common-detail-item>
      <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel + '编码'">{{ detailData.code }}</common-detail-item>
      <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
      <common-detail-item label="描述">{{ detailData.remark }}</common-detail-item>
    </template>
    <el-tabs v-model="activeName" @tab-click="handleDetailTab">
      <el-tab-pane name="quota" v-if="config.visibility !== 'GLOBAL_PROJECT'" label="配额信息">
        <el-row :gutter="10">
          <el-col :span="8" v-for="item in chartsList" :key="item.name">
            <el-card class="box-card m-t-sm">
              <div slot="header" class="clearfix">
                <span>{{ item.name }}：</span>
              </div>
              <pie-charts :theme="item.name" height="200px" width="100%" :data="item.data" :id="item.name" :unit="item.unit"></pie-charts>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane name="user" label="成员列表">
        <basic-table :data="userList" :params="params" :get-list="getProjectUser" :total="userTotal">
          <el-table-column label="登录账号" prop="account"> </el-table-column>
          <el-table-column label="用户姓名" prop="name"> </el-table-column>
          <el-table-column label="邮箱" prop="email"> </el-table-column>
          <el-table-column label="联系方式" prop="mobile"> </el-table-column>
        </basic-table>
      </el-tab-pane>
      <!--<el-tab-pane name="system">-->
      <!--<el-button class="m-b" @click="handleCreate()" type="primary">-->
      <!--<i class="el-icon-plus"></i>-->
      <!--新增系统-->
      <!--</el-button>-->
      <!--<basic-table :data="systemList" :params="systemParams" :get-list="getProjectSystem" :total="systemTotal">-->
      <!--<el-table-column label="系统名称" prop="name">-->
      <!--</el-table-column>-->
      <!--<el-table-column label="系统描述" prop="remark">-->
      <!--</el-table-column>-->
      <!--<el-table-column label="操作" width="160px">-->
      <!--<template slot-scope="scope">-->
      <!--<el-button type="text" @click="handleCreate(scope.row)">-->
      <!--<i class="el-icon-edit-outline"></i>-->
      <!--编辑-->
      <!--</el-button>-->
      <!--<div class="action-divider"></div>-->
      <!--<el-button type="text" @click="handleDelete(scope.row.id)">-->
      <!--<i class="el-icon-delete" />-->
      <!--删除-->
      <!--</el-button>-->
      <!--</template>-->
      <!--</el-table-column>-->
      <!--</basic-table>-->
      <!--</el-tab-pane>-->
    </el-tabs>
    <!--新增界面-->
    <el-dialog :title="addForm.id ? '编辑系统' : '新增系统'" :close-on-click-modal="false" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" width="35%" append-to-body>
      <basic-form :model="addForm" ref="addForm">
        <basic-form-item label="系统名称：" prop="name" validate="required" required-message="请输入系统名称">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="系统备注：">
          <el-input v-model="addForm.remark" auto-complete="off" type="textarea"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
  </common-detail>
</template>
<script>
import { getSystems, createSystems, modifySystems, removeSystems } from 'services/system/system'
import { getProjectDetail } from 'services/system/project'
import { getUser } from 'services/system/user'

export default {
  props: {
    config: {
      type: Object
    }
  },
  data() {
    return {
      chartsList: {},
      params: {
        page: 1,
        rows: 10
      },
      userTotal: 0,
      detailData: {},
      userList: [],
      systemTotal: 0,
      systemList: [],
      systemParams: {
        page: 1,
        rows: 10
      },
      dialogFormVisible: false,
      // 新增界面数据
      addForm: {},
      activeName: 'quota'
    }
  },
  methods: {
    handleDetailTab(tab) {
      switch (tab.name) {
        case 'quota':
          this.getDetail()
          break
        case 'user':
          this.params.page = 1
          this.getProjectUser()
          break
        case 'system':
          this.systemParams.page = 1
          this.getProjectSystem()
          break
      }
    },
    getDetail() {
      getProjectDetail(this.config.id).then((data) => {
        if (data.success) {
          this.detailData = data.data
          this.chartsList = this.detailData.quotas
        }
      })
    },
    getProjectUser() {
      this.params.params = JSON.stringify([{ param: { projectId: this.config.id }, sign: 'EQ' }])
      getUser(this.params).then((data) => {
        if (data.success) {
          this.userList = data.data.rows
          this.userTotal = data.data.total
        }
      })
    },
    getProjectSystem() {
      this.systemParams.params = JSON.stringify([{ param: { projectId: this.config.id }, sign: 'EQ' }])
      getSystems(this.systemParams).then((data) => {
        if (data.success) {
          this.systemList = data.data.rows
          this.systemTotal = data.data.total
        }
      })
    },
    handleCreate(data) {
      if (data) {
        this.addForm = Object.assign({}, data)
      } else {
        this.addForm = {}
      }
      this.dialogFormVisible = true
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该系统吗?', '提示', {
        confirmButtonText: '删除',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeSystems(id).then((data) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success'
            })
            this.getProjectSystem()
          }
        })
      })
    },
    addSubmit() {
      let url = '/business/system/create'
      if (this.addForm.id) url = '/business/system/modify'
      const service = this.addForm.id ? modifySystems : createSystems
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          service({
            projectId: this.config.id,
            ...this.addForm
          }).then((data) => {
            if (data.success) {
              this.$notify({
                message: data.message,
                type: 'success'
              })
              this.dialogFormVisible = false
              this.getProjectSystem()
            }
          })
        }
      })
    }
  },
  created() {
    this.getDetail()
    if (this.config.visibility === 'GLOBAL_PROJECT') {
      // 全局应用系统不展示配额
      this.activeName = 'user'
      this.getProjectUser()
    }
  }
}
</script>
