<template>
  <div>
    <AdvanceTable :title="$store.getters.systemConfig.serviceConfigLabel + '列表'" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="selectionChange">
      <template v-slot:action>
        <el-button type="primary" @click="handle('add')"> <i class="el-icon-plus"></i> 新增 </el-button>
        <el-button type="" @click="handleDelete" :disabled="ids.length < 1"> <i class="el-icon-delete"></i> 删除 </el-button>
        <ImportData url="/api/sms/v1/bizs/import" @getData="getList" template-url="/sms/v1/bizs/import/template"></ImportData>
        <el-button type="" @click="exportData"> <i class="el-icon-download"></i> 导出 </el-button>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handle('edit', record)"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)"> <i class="el-icon-delete"></i> 删除 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="relationProject(record.id)"> <i class="el-icon-share"></i> 关联{{ $store.getters.systemConfig.projectConfigLabel }} </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" width="700px" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible">
      <basic-form :model="addData" ref="addData">
        <basic-form-item :label="$store.getters.systemConfig.serviceConfigLabel + '名称：'" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off" clearable></el-input>
        </basic-form-item>
        <basic-form-item :label="$store.getters.systemConfig.serviceConfigLabel + '编码：'" prop="code" validate="required">
          <el-input type="input" v-model="addData.code" clearable></el-input>
        </basic-form-item>
        <el-form-item :label="'关联' + $store.getters.systemConfig.projectConfigLabel + '：'">
          <el-select v-model="addData.projectIds" multiple placeholder="请选择" clearable :disabled="dialogStatus === 'update'">
            <el-option v-for="item in relationProjectObj.projects" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </el-form-item>
        <basic-form-item :label="$store.getters.systemConfig.serviceConfigLabel + '描述：'" prop="remark">
          <el-input type="textarea" v-model="addData.remark" clearable></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="submit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <relation-project @afterRelation="afterRelation" v-if="relationProjectObj.visible" :config="relationProjectObj"></relation-project>
  </div>
</template>

<script>
import { getBizs, createBizs, getProjectByBizList, pacthRelatioonBiz, removeBizs, modifyBizs, getBizsDetail, removeBizList, exportBizsList } from 'services/system/bizs'
import { getProject } from 'services/system/project'
import RelationProject from './RelationProject.vue'
import ImportData from '@/common/components/import-data/index.vue'

export default {
  components: {
    RelationProject,
    ImportData
  },
  data() {
    return {
      searchConfigs: [{ label: '名称', value: 'name', type: 'Input' }],
      columns: [
        { type: 'selection' },
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: this.$store.getters.systemConfig.serviceConfigLabel + '编码',
          prop: 'code'
        },
        {
          label: '关联' + this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projects'
        },
        {
          label: '描述',
          prop: 'remark'
        },
        {
          label: '创建时间',
          prop: 'gmtCreate'
        },
        {
          label: '操作',
          disabled: true,
          width: '260px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      loading: false,
      list: [],
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      addData: {},
      addDialogVisible: false,
      textMap: {
        update: '编辑' + this.$store.getters.systemConfig.serviceConfigLabel,
        create: '新增' + this.$store.getters.systemConfig.serviceConfigLabel
      },
      dialogStatus: 'create',
      relationProjectObj: {
        visible: false,
        value: [],
        projects: []
      },
      ids: [],
      searchParams: {
        params: []
      },
      exportSearch: {
        params: []
      }
    }
  },
  methods: {
    // beforeSearch({ listQuery }) {
    //   if (!listQuery) {
    //     return
    //   }
    //   this.searchParams.params = this.$tools.handleSearchParam({
    //     'name:LK': listQuery.name,
    //     'id:IN': this.ids.join(',')
    //   })
    // },
    exportData() {
      this.exportSearch.params = JSON.parse(this.params.params)
      this.exportSearch.params.push(
        ...JSON.parse(
          this.$tools.handleSearchParam({
            'id:IN': this.ids.join(',')
          })
        )
      )
      exportBizsList({ params: JSON.stringify(this.exportSearch.params) })
    },
    selectionChange(val) {
      this.ids = val.map((item) => item.id)
    },
    handleDelete() {
      this.$confirm('您确定要删除所选中' + this.$store.getters.systemConfig.serviceConfigLabel + '吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeBizList(this.ids).then((res) => {
          if (res.success) {
            this.getList()
          }
        })
      })
    },
    // 获取应用系统管理列表
    async getProjectList(params) {
      const res = await getProject({ page: 1, rows: 100000, params })
      if (res.success) {
        this.relationProjectObj.projects = res.data.rows
      }
    },
    // 关联应用系统子组件返回的函数
    async afterRelation(ids) {
      const res = await pacthRelatioonBiz(this.relationProjectObj.id, ids)
      if (res.success) {
        this.$message.success(res.message)
        this.getList()
      }
    },
    async getList() {
      this.loading = true
      const res = await getBizs(this.params)
      if (res.success) {
        this.list = res.data.rows
        this.total = res.data.total
      }
      this.loading = false
    },
    handle(type, record) {
      switch (type) {
        case 'add':
          this.addData = {}
          this.dialogStatus = 'create'
          this.getProjectList(this.$tools.handleSearchParam({ 'businessId:NUL': 'null' }))
          this.addDialogVisible = true
          break
        case 'delete':
          this.remove(record.id)
          break
        case 'edit':
          this.getrelationProjectList(record.id)
          getBizsDetail(record.id).then((res) => {
            if (res.success) {
              this.addData = res.data
            }
          })
          this.dialogStatus = 'update'
          this.addDialogVisible = true
          break
      }
    },
    remove(id) {
      this.$confirm('您确定要删除该' + this.$store.getters.systemConfig.serviceConfigLabel + '吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeBizs(id).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.getList()
          }
        })
      })
    },
    submit() {
      if (this.dialogStatus === 'create') {
        this.addSubmit()
      } else if (this.dialogStatus === 'update') {
        this.editSubmit()
      }
    },
    // 新增提交
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (!valid) {
          return this.$message.error('缺少必填项')
        }
        createBizs(this.addData)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message)
            }
          })
          .finally(() => {
            this.addDialogVisible = false
            this.getList()
            this.addData = {}
          })
      })
    },
    // 编辑提交
    editSubmit() {
      this.$refs.addData.validate((valid) => {
        if (!valid) {
          return this.$message.error('缺少必填项')
        }
        modifyBizs(this.addData)
          .then((res) => {
            if (res.success) {
              this.$message.success(res.message)
            }
          })
          .finally(() => {
            this.addDialogVisible = false
            this.getList()
            this.addData = {}
          })
      })
    },
    // 关联应用系统
    relationProject(id) {
      this.relationProjectObj.value = []
      this.getrelationProjectList(id)
      this.relationProjectObj.visible = true
    },
    async getrelationProjectList(id) {
      this.relationProjectObj.id = id
      const res = await getProjectByBizList(id)
      if (res.success) {
        this.relationProjectObj.projects = res.data
        this.relationProjectObj.value = res.data.filter((item) => item.check).map((item) => item.id)
      }
    }
  }
}
</script>

<style>
.import {
  margin-left: 10px;
}
</style>
