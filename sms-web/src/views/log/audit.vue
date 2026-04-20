<template>
  <div>
    <AdvanceTable ref="table" title="审计日志列表" :before-search="beforeSearch" :search-configs="searchConfigs" :data="list" :columns="adminColumns" :params="params" :get-list="getList" :total="total" :loading="loading">
      <template #action>
        <el-button type="ghost" @click="handleArchive">归档</el-button>
        <el-button type="ghost" @click="handleArchiveHistory">归档记录</el-button>
      </template>
    </AdvanceTable>
    <el-dialog title="归档" :close-on-click-modal="false" v-if="addVisible" :visible.sync="addVisible">
      <el-form :model="addData" label-width="100px" ref="solveData">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="归档时间：" prop="date">
              <el-date-picker v-model="addData.date" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" start-placeholder="开始时间" end-placeholder="结束时间"> </el-date-picker>
            </el-form-item>
            <el-form-item label="" prop="deleted">
              <el-checkbox v-model="addData.deleted">是否清空服务器中的数据</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="归档记录" :close-on-click-modal="false" v-if="recordVisible" :visible.sync="recordVisible" width="900px">
      <table-search class="m-b-sm" :configs="recordSearchs" :onSearch="handleSearchRecord"></table-search>
      <basic-table :data="recordList" :params="recordParams" :get-list="getRecordList" :total="recordTotal">
        <el-table-column label="归档人" prop="userName"> </el-table-column>
        <el-table-column label="归档时间" prop="gmtArchive"> </el-table-column>
        <el-table-column label="是否同步删除数据库" prop="deleted">
          <template slot-scope="scope">
            {{ scope.row.deleted || scope.row.syncDelete ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="归档结果" prop="result"> </el-table-column>
      </basic-table>
      <div slot="footer" class="dialog-footer"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getLog, accessLog, getRecords } from 'services/system/log'
import { getUser as getManager } from 'services/system/manager'
import { getUser } from 'services/system/user'
import { getTenant } from 'services/system/tenant'
const searchConfigs = [
  { type: 'Input', label: '请求IP', value: 'requestIp' },
  {
    type: 'Select',
    label: '账号类型',
    value: 'catalog',
    data: [
      { id: 'Manager', name: '管理员' },
      { id: 'Tenant', name: '租户' },
      { id: 'User', name: '用户' }
    ]
  },
  { type: 'Select', label: '用户列表', value: 'userId', data: [] },
  { type: 'DateRange', label: '请求', value: 'gmtCreate' },
  { type: 'Input', label: '操作', value: 'action' }
]

export default {
  data() {
    return {
      list: null,
      total: null,
      loading: false,
      searchConfigs,
      recordSearchs: [{ label: '归档人', value: 'userName', type: 'Input' }],
      params: {
        page: 1,
        rows: 10
      },
      addData: {},
      addVisible: false,
      recordVisible: false,
      recordList: [],
      recordTotal: 0,
      recordParams: {
        page: 1,
        rows: 10
      },
      catalog: '',
      adminColumns: [
        {
          label: '服务名称',
          prop: 'module'
        },
        {
          label: '请求IP',
          prop: 'requestIp'
        },
        {
          label: '操作账号',
          prop: 'account'
        },
        {
          label: '用户名',
          prop: 'userName'
        },
        {
          label: '请求对象',
          prop: 'target'
        },
        {
          label: '操作',
          prop: 'action'
        },
        {
          label: '参数',
          prop: 'detail'
        },
        {
          label: '请求时间',
          prop: 'gmtCreate'
        },
        {
          label: '请求耗时(ms)',
          prop: 'cost'
        }
      ]
    }
  },
  methods: {
    // 获取账号列表
    async getAccountList(catalog, handleSearch) {
      const map = {
        Manager: getManager,
        Tenant: getTenant,
        User: getUser
      }
      const data = await map[catalog]({ simple: true })
      if (data.success) {
        this.searchConfigs[2].data = data.data.rows
        handleSearch()
      }
    },
    getList() {
      this.loading = true
      getLog(this.params)
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
    // 查询
    beforeSearch({ handleSearch, listQuery }) {
      if (listQuery) {
        const { catalog, userId } = listQuery
        if (catalog !== this.catalog) {
          if (userId) {
            listQuery.userId = ''
          }
          this.catalog = catalog
          this.getAccountList(catalog, handleSearch)
        }
      }
    },
    handleArchive() {
      this.addData = {
        date: null,
        deleted: false
      }
      this.addVisible = true
    },
    addSubmit() {
      if (!this.addData.date) {
        return this.$message.error('请选择开始结束时间！')
      }
      const addData = {
        startTime: this.addData.date[0],
        endTime: this.addData.date[1],
        deleted: this.addData.deleted
      }
      accessLog(addData)
      this.addVisible = false
    },
    handleArchiveHistory() {
      this.recordVisible = true
    },
    getRecordList() {
      getRecords(this.recordParams).then((data) => {
        if (data.success) {
          this.recordList = data.data.rows
          this.recordTotal = data.data.total
        }
      })
    },
    handleSearchRecord(params) {
      this.recordParams.page = 1
      this.recordParams.params = params
      this.getRecordList()
    }
  }
}
</script>
