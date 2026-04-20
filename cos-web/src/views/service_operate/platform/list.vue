<template>
  <el-card>
    <AdvanceTable title="" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()"> <i class="el-icon-plus"></i> 新增 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)"><i class="el-icon-delete"></i> 删除</el-button>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <common-detail v-if="detailVisible" :setting="{ type: 'host' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="地址">{{ detailData.address }}</common-detail-item>
        <common-detail-item label="协议">{{ detailData.protocol }}</common-detail-item>
        <common-detail-item label="认证信息">{{ detailData.authentication }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
      </template>
    </common-detail>
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible">
      <basic-form :model="addData" ref="addData" label-width="110px">
        <basic-form-item label="名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="地址：" prop="address" validate="required">
          <el-input v-model="addData.address" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="协议：" prop="protocol" validate="required">
          <el-select v-model="addData.protocol" placeholder="请选择">
            <el-option label="http" value="http"></el-option>
            <el-option label="https" value="https"></el-option>
            <el-option label="jms" value="jms"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="认证信息：" prop="authentication" validate="required">
          <el-input v-model="addData.authentication" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="描述：" prop="remark">
          <el-input v-model="addData.remark" auto-complete="off" type="textarea"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>
<script>
import { periodFilter } from 'filters'
import { getProvider, removeProvider, getProviderDetail, modifyProvider, createProvider } from 'services/system/platform'
const searchConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '地址',
    prop: 'address'
  },
  {
    label: '协议',
    prop: 'protocol'
  },
  {
    label: '认证信息',
    prop: 'authentication'
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '操作',
    prop: 'id',
    width: '220px',
    disabled: true,
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {},
  data() {
    return {
      searchConfigs,
      columns,
      loading: false,
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      detailVisible: false,
      detailData: {},
      dialogStatus: '',
      textMap: {
        update: '编辑服务平台',
        create: '创建服务平台'
      },
      // 新增界面数据
      addData: {},
      addDialogVisible: false
    }
  },
  created() {},
  methods: {
    getList() {
      this.loading = true
      getProvider(this.params).then((data) => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    // 查询用户
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    },
    handleCreate(data) {
      if (data) {
        this.dialogStatus = 'update'
        this.addData = Object.assign({}, data)
      } else {
        this.dialogStatus = 'create'
        this.addData = {
          name: '',
          address: '',
          protocol: '',
          authentication: '',
          remark: ''
        }
      }
      this.addDialogVisible = true
    },
    addSubmit() {
      this.$refs.addData.validate((valid) => {
        if (valid) {
          if (this.dialogStatus == 'create') {
            createProvider(this.addData).then((data) => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.addDialogVisible = false
                this.getList()
              }
            })
          } else {
            modifyProvider(this.addData).then((data) => {
              if (data.success) {
                this.$notify({
                  message: data.message,
                  type: 'success'
                })
                this.addDialogVisible = false
                this.getList()
              }
            })
          }
        }
      })
    },
    handleDelete(id) {
      this.$confirm('您确定要删除该服务平台吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeProvider(id).then((data) => {
          if (data.success) {
            this.$message.success(data.message)
            this.getList()
          }
        })
      })
    },
    getDetail(id) {
      getProviderDetail(id).then((data) => {
        if (data.success) {
          this.detailData = data.data
          this.detailVisible = true
        }
      })
    },
    goBack() {
      this.detailVisible = false
    }
  }
}
</script>
