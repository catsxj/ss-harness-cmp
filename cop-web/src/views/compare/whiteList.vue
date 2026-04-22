<template>
  <div>
    <AdvanceTable title="命令白名单" :data="list" :searchConfigs="whiteListConfigs" :params="params" :total="total" :columns="whiteListColumns" :get-list="getList" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate()" icon="el-icon-plus">
          新增
        </el-button>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)">
          <i class="el-icon-edit"></i>
          修改
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="del(record)">
          <i class="el-icon-delete"></i>
          删除
        </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="title[status]" :close-on-click-modal="false" v-if="dialogVisible" :visible.sync="dialogVisible" width="40%">
      <basic-form :model="data" ref="form">
        <basic-form-item label="参数名称" prop="wList" validate="required,english" required-message="请输入参数名称">
          <el-input placeholder="请输入内容(英文)" v-model="data.wList" />
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="create" :loading="loading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getWhiteList, createWhite, modifyWhite, removeWhite, getWhiteListById } from 'services/task/compare'
import { whiteListColumns, whiteListConfigs } from './config'
export default {
  data() {
    return {
      whiteListColumns,
      whiteListConfigs,
      loading: false,
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      title: {
        create: '创建白名单',
        update: '修改白名单'
      },
      status: '',
      data: {
        id: '',
        wList: ''
      },
      dialogVisible: false
    }
  },
  methods: {
    handleSizeChange(val) {
      this.params.rows = val
      this.getList()
    },
    handleCreate(row) {
      this.status = row ? 'update' : 'create'
      this.data.wList = ''
      this.data.id = ''
      if (row) {
        this.data.id = row.id
        this.getWhiteListById(row.id)
      }
      this.loading = false
      this.dialogVisible = true
    },
    create() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          const params = {
            wList: this.data.wList
          }
          let http = createWhite
          if (this.data.id) {
            params.id = this.data.id
            http = modifyWhite
          }
          http(params).then((data) => {
            if (data.success) {
              this.$notify.success(data.message)
              this.dialogVisible = false
              this.handleSearch()
            }
            this.loading = false
          })
        }
      })
    },
    del(row) {
      this.$confirm('您确定要删除当前数据吗?', '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeWhite(row.id).then((data) => {
          if (data.success) {
            this.$notify.success(data.message)
            this.getList()
          }
        })
      })
    },
    getList() {
      getWhiteList(this.params).then((data) => {
        this.list = data?.data?.rows || []
        this.total = data?.data?.total || 0
      })
    },
    getWhiteListById(id) {
      getWhiteListById(id).then((data) => {
        if (data.success) {
          this.data.wList = data.data.wList
        }
      })
    }
  }
}
</script>
