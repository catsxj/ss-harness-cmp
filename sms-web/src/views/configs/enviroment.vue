<template>
  <el-card class="wrapper">
    <AdvanceTable title="环境列表" :search-configs="searchConfigs" :data="tableData" :params="params" :columns="columns" :get-list="getData" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('edit', record)"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </AdvanceTable>
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="addFlag" :visible.sync="addFlag" width="600px">
      <basic-form :model="addData" ref="addData">
        <el-row :gutter="10">
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required">
              <el-input v-model="addData.name"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="描述：" prop="remark" maxlength="128">
              <el-input type="textarea" :autosize="{ minRows: 3 }" v-model="addData.remark"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addFlag = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
    <common-detail v-if="detailFlag" :setting="{ type: 'host' }" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="描述">{{ detail.remark }}</common-detail-item>
      </template>
      <el-tabs value="3" class="detail">
        <el-tab-pane label="云平台" name="3">
          <basic-table class="basic-table-detail" :data="vendorData" :params="paramt" :get-list="getVendor" :total="vendorTotal">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="平台类型" show-overflow-tooltip></el-table-column>
          </basic-table>
          <!-- <SmartTable :data="vendorData" :rows="10">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="remark" label="描述" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="平台类型" show-overflow-tooltip></el-table-column>
          </SmartTable> -->
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </el-card>
</template>

<script>
import { getCloudVendor, getEnvironments, removeEnvironments, modifyEnvironments, createEnvironments, detailEnvironments } from 'services/platform/index'
export default {
  data() {
    return {
      loading: false,
      detailFlag: false,
      searchConfigs: [{ label: '名称', value: 'name', type: 'Input' }],
      columns: [
        {
          label: '名称',
          prop: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          label: '描述',
          prop: 'remark'
        },
        {
          label: '操作',
          disabled: true,
          width: '200px',
          scopedSlots: { customRender: 'operate' }
        }
      ],
      detail: {},
      paramt: {
        page: 1,
        rows: 10
      },
      vendorData: [],
      vendorTotal: 0,
      params: {
        page: 1,
        rows: 10
      },
      tableData: [],
      total: 0,
      addFlag: false,
      addData: {},
      textMap: {
        update: '编辑所属环境',
        create: '添加所属环境'
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
    // 详情
    getDetail(id) {
      detailEnvironments(id).then((data) => {
        if (data.success) {
          this.detail = data.data
          this.detailFlag = true
          this.getVendor()
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    // 平台
    getVendor(page) {
      this.paramt.page = page || this.paramt.page
      const params = {
        page: this.paramt.page,
        rows: this.paramt.rows
      }
      params.params = JSON.stringify([
        {
          param: { envId: this.detail.id },
          sign: 'EQ'
        }
      ])
      getCloudVendor(params).then((data) => {
        if (data.success) {
          this.vendorData = data.data.rows
          this.vendorTotal = data.data.total
        }
      })
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          this.loading = true
          const http = this.addData.id ? modifyEnvironments : createEnvironments
          http(this.addData)
            .then((data) => {
              if (data.success) {
                this.$message({
                  message: data.message,
                  type: 'success'
                })
                this.addFlag = false
                this.getData()
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
        this.addFlag = true
      } else {
        this.addData = {}
        this.dialogStatus = 'create'
        this.addFlag = true
      }
    },
    remove(id) {
      this.$confirm('确定删除该环境吗?', '提示', {
        type: 'warning'
      }).then(() => {
        removeEnvironments(id).then((data) => {
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
    getData() {
      this.loading = true
      getEnvironments(this.params)
        .then((data) => {
          if (data.success) {
            this.tableData = data.data.rows
            this.total = data.data.total
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getData()
    }
  }
}
</script>

<style scoped lang="scss">
.wrapper ::v-deep .el-card__body {
  padding: 0 !important;
}
.detail {
  padding: 20px;
}
</style>
