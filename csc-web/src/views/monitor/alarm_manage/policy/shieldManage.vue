<template>
  <el-card>
    <el-form class="m-t" :inline="true">
      <el-form-item>
        <el-input placeholder="名称" v-model="listQuery.name"> </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button type="ghost" icon="el-icon-refresh" @click="handleReSet">重置</el-button>
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate()">新增</el-button>
      </el-form-item>
    </el-form>
    <AdvanceTable title="" :search-configs="[]" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" :show-tools="false">
      <!-- <template v-slot:action>
        <el-button class="el-icon-plus" type="primary" @click="handleCreate()">
        新增
        </el-button>
      </template> -->
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #waitTime="waitTime">
        {{ waitTime | waiteTime }}
      </template>
      <template #remind="remind">
        <span>{{ remind | isTrue }}</span>
      </template>
      <template #secondary="secondary">
        <span>{{ secondary | isTrue }}</span>
      </template>
      <template #primary="primary">
        <span>{{ primary | isTrue }}</span>
      </template>
      <template #urgent="urgent">
        <span>{{ urgent | isTrue }}</span>
      </template>
      <template #email="email">
        <span>{{ email | isTrue }}</span>
      </template>
      <template #message="message">
        <span>{{ message | isTrue }}</span>
      </template>
      <template #dingding="dingding">
        <span>{{ dingding | isTrue }}</span>
      </template>
      <template #weixin="weixin">
        <span>{{ weixin | isTrue }}</span>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)"><i class="el-icon-delete"></i> 删除</el-button>
      </template>
    </AdvanceTable>
    <common-detail v-if="detailFlag" :setting="{ type: 'host' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="延迟时间">{{ detailData.waitTime | waiteTime }}</common-detail-item>
        <common-detail-item label="接收提示告警">{{ detailData.remind | isTrue }}</common-detail-item>
        <common-detail-item label="接收次要告警">{{ detailData.secondary | isTrue }}</common-detail-item>
        <common-detail-item label="接收重要告警">{{ detailData.primary | isTrue }}</common-detail-item>
        <common-detail-item label="接收紧急告警">{{ detailData.urgent | isTrue }}</common-detail-item>
        <common-detail-item label="邮件">{{ detailData.email | isTrue }}</common-detail-item>
        <common-detail-item label="站内信">{{ detailData.message | isTrue }}</common-detail-item>
        <common-detail-item label="钉钉">{{ detailData.dingding | isTrue }}</common-detail-item>
        <common-detail-item label="微信">{{ detailData.weixin | isTrue }}</common-detail-item>
        <common-detail-item label="屏蔽策略开启">{{ detailData.action | isTrue }}</common-detail-item>
      </template>
      <el-tabs value="list">
        <el-tab-pane name="list">
          <span slot="label"><i class="el-icon-date"></i> 分发人列表</span>
          <basic-table :data="detailData.receiverInfos">
            <el-table-column prop="account" label="登录账号"> </el-table-column>
            <el-table-column prop="name" label="用户姓名"> </el-table-column>
            <el-table-column prop="email" label="邮箱"> </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                {{ scope.row.status | status('status') }}
              </template>
            </el-table-column>
            <el-table-column prop="mobile" label="移动电话"> </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <!--新增-->
    <el-dialog :title="title" :visible.sync="addFlag" v-if="addFlag" width="70%">
      <add :id="id" ref="add" @refresh="refresh"></add>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="cancle">取 消</el-button>
        <el-button type="primary" @click.native="addSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>
<script>
import { getDistributions, getDistriDetail, createDistri, modifyDistri, removeDistri } from 'services/monitor'
import { getUser } from 'services/system/manager'
import add from './add.vue'
const searchConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
const searchSenderConfigs = [{ type: 'Input', label: '名称', value: 'name' }]
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '延迟时间',
    prop: 'waitTime',
    scopedSlots: { customRender: 'waitTime' }
  },
  {
    label: '接收提示告警',
    prop: 'remind',
    scopedSlots: { customRender: 'remind' }
  },
  {
    label: '接收次要告警',
    prop: 'secondary',
    scopedSlots: { customRender: 'secondary' }
  },
  {
    label: '接收重要告警',
    prop: 'primary',
    scopedSlots: { customRender: 'primary' }
  },
  {
    label: '接收紧急告警',
    prop: 'urgent',
    scopedSlots: { customRender: 'urgent' }
  },
  {
    label: '邮件',
    prop: 'email',
    scopedSlots: { customRender: 'email' }
  },
  {
    label: '站内信',
    prop: 'message',
    scopedSlots: { customRender: 'message' }
  },
  {
    label: '钉钉',
    prop: 'dingding',
    scopedSlots: { customRender: 'dingding' }
  },
  {
    label: '微信',
    prop: 'weixin',
    scopedSlots: { customRender: 'weixin' }
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    add
  },
  data() {
    return {
      columns,
      searchConfigs,
      searchSenderConfigs,
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      listQuery: {},
      paramsUser: {
        page: 1,
        rows: 10
      },
      searchData: {
        name: '',
        sendername: ''
      },
      list: [],
      total: 0,
      detailFlag: false,
      detailData: {},
      addFlag: false,
      id: 0,
      addData: {},
      title: '',
      status: '',
      waitTimeArr: [0, 5, 10, 30, 60, 360, 720, 1440],
      receiverListData: [],
      selectList: [],
      idList: [],
      activeName: 'Mon',
      blockPolicy: [
        { week: 1, type: '' },
        { week: 2, type: '' },
        { week: 3, type: '' },
        { week: 4, type: '' },
        { week: 5, type: '' },
        { week: 6, type: '' },
        { week: 0, type: '' }
      ],
      // 分发人列表数据
      senderdialogFormVisible: false,
      userListData: [],
      totalUser: 0
    }
  },
  methods: {
    getDetail(id) {
      getDistriDetail(id).then(data => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    getList() {
      this.loading = true
      getDistributions(this.params).then(data => {
        this.loading = false
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch(params) {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.listQuery.name
      })
      this.getList()
    },
    handleReSet() {
      this.listQuery = {}
      this.handleSearch()
    },
    handleCreate(data) {
      if (data) {
        this.title = '编辑分发策略'
        this.id = data.id
      } else {
        this.title = '新增分发策略'
        this.id = 0
      }
      this.addFlag = true
    },
    addSubmit() {
      this.$refs.add.addSubmit()
    },
    refresh() {
      this.addFlag = false
      this.getList()
    },
    cancle() {
      this.addFlag = false
    },
    handleDelete(id) {
      this.$confirm('您确认要删除吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          removeDistri(id).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message,
                type: 'success'
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    }
  },
  created() {
    this.handleSearch()
  },
  mounted() {}
}
</script>
<style scoped>
.search-container {
  padding-bottom: 0px !important;
}
</style>
