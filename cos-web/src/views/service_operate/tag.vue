<template>
  <el-card class="wrapper">
    <table-search :onSearch="handleSearch">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate()" slot="operate"> 新增 </el-button>
    </table-search>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="名称" prop="name"> </el-table-column>
      <el-table-column prop="content" label="内容"></el-table-column>
      <el-table-column prop="content" label="标签类型">
        <template slot-scope="scope">
          {{ typeFilter[scope.row.category] }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <el-button type="text" @click="handleCreate('edit', scope.row)"> <i class="el-icon-edit"></i> 编辑 </el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="remove(scope.row.id)"> <i class="el-icon-delete"></i> 删除 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible" width="35%">
      <basic-form :model="addData" ref="addData">
        <basic-form-item label="标签类型：" prop="category">
          <el-radio-group v-model="addData.category" size="small">
            <el-radio label="Vm" border>云主机</el-radio>
            <el-radio label="PoolGroup" border>资源池</el-radio>
            <el-radio label="Pm" border>宿主机</el-radio>
          </el-radio-group>
        </basic-form-item>
        <basic-form-item label="名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="内容：" prop="content" validate="required">
          <el-input v-model="addData.content" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
import { getLabel, removeLabel, createLabel, modifyLabel } from 'services/platform/index'
export default {
  data() {
    return {
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      list: [],
      total: 0,
      addDialogVisible: false,
      addData: {},
      textMap: {
        update: '编辑标签',
        create: '添加标签'
      },
      typeFilter: {
        Vm: '云主机',
        PoolGroup: '资源池',
        Pm: '宿主机'
      },
      dialogStatus: ''
    }
  },
  computed: {
    detailData: function () {
      const data = this.detail
      return Object.assign({}, data.server, data.serverConfig)
    }
  },
  methods: {
    addSubmit() {
      const editObj = ['id', 'name', 'content', 'category']
      const addData1 = {}
      for (const a in editObj) {
        const attr = editObj[a]
        addData1[attr] = this.addData[attr]
      }
      this.$refs.addData.validate((valid) => {
        if (valid) {
          this.loading = true
          const http = this.addData.id ? modifyLabel : createLabel
          http(addData1)
            .then((data) => {
              if (data.success) {
                this.$message({
                  message: data.message,
                  type: 'success'
                })
                this.addDialogVisible = false
                this.getList()
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    handleCreate(type, data) {
      if (type === 'edit') {
        this.addData = Object.assign({}, data)
        this.dialogStatus = 'update'
        this.addDialogVisible = true
      } else {
        this.addData = {
          category: 'Vm'
        }
        if (data) {
          this.addData.pvalue = data.value
        } else {
          this.addData.pvalue = 0
        }
        this.dialogStatus = 'create'
        this.addDialogVisible = true
      }
    },
    remove(id) {
      this.$confirm('此操作将永久删除该标签, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeLabel(id).then((data) => {
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
    getList() {
      getLabel(this.params).then((data) => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    }
  }
}
</script>
