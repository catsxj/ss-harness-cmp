<template>
  <div>
    <AdvanceTable title="分发策略" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button class="el-icon-plus" type="primary" @click="handleCreate()"> 新增 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #waitTime="waitTime">
        {{ waiteTimeFilter(waitTime) }}
      </template>
      <template #remind="remind">
        <span>{{ booleanFilter(remind) }}</span>
      </template>
      <template #secondary="secondary">
        <span>{{ booleanFilter(secondary) }}</span>
      </template>
      <template #primary="primary">
        <span>{{ booleanFilter(primary) }}</span>
      </template>
      <template #urgent="urgent">
        <span>{{ booleanFilter(urgent) }}</span>
      </template>
      <template #email="email">
        <span>{{ booleanFilter(email) }}</span>
      </template>
      <template #message="message">
        <span>{{ booleanFilter(message) }}</span>
      </template>
      <template #dingding="dingding">
        <span>{{ booleanFilter(dingding) }}</span>
      </template>
      <template #weixin="weixin">
        <span>{{ booleanFilter(weixin) }}</span>
      </template>
      <template #nativeAlarm="nativeAlarm">
        <span>{{ booleanFilter(nativeAlarm) }}</span>
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
        <common-detail-item label="延迟时间">{{ waiteTimeFilter(detailData.waitTime) }}</common-detail-item>
        <common-detail-item label="接收提示告警">{{ booleanFilter(detailData.remind) }}</common-detail-item>
        <common-detail-item label="接收次要告警">{{ booleanFilter(detailData.secondary) }}</common-detail-item>
        <common-detail-item label="接收重要告警">{{ booleanFilter(detailData.primary) }}</common-detail-item>
        <common-detail-item label="接收紧急告警">{{ booleanFilter(detailData.urgent) }}</common-detail-item>
        <common-detail-item label="邮件">{{ booleanFilter(detailData.email) }}</common-detail-item>
        <common-detail-item label="站内信">{{ booleanFilter(detailData.message) }}</common-detail-item>
        <common-detail-item label="钉钉">{{ booleanFilter(detailData.dingding) }}</common-detail-item>
        <common-detail-item label="微信">{{ booleanFilter(detailData.weixin) }}</common-detail-item>
        <common-detail-item label="VC原生告警">{{ booleanFilter(detailData.nativeAlarm) }}</common-detail-item>
        <common-detail-item label="屏蔽策略开启">{{ booleanFilter(detailData.action) }}</common-detail-item>
        <common-detail-item label="资源归属人">{{ booleanFilter(detailData.sendTargetOwner) }}</common-detail-item>
      </template>
      <el-tabs value="list">
        <el-tab-pane name="list">
          <span slot="label"><i class="el-icon-date"></i> 分发人列表</span>
          <basic-table :data="detailData.receiverInfos">
            <el-table-column prop="account" label="登录账号"> </el-table-column>
            <el-table-column prop="name" label="用户姓名"> </el-table-column>
            <el-table-column prop="email" label="邮箱"> </el-table-column>
            <el-table-column label="状态">
              <template #default="scope">
                {{ statusFilter(scope.row.status) }}
              </template>
            </el-table-column>
            <el-table-column prop="mobile" label="移动电话"> </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane name="role">
          <span slot="label"><i class="el-icon-date"></i> 角色</span>
          <basic-table :data="roleList">
            <el-table-column prop="name" label="名称"> </el-table-column>
            <el-table-column prop="remark" label="描述"> </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <!--新增-->
    <el-dialog :title="title" v-model:visible="addFlag" v-if="addFlag" width="70%">
      <add :id="id" ref="add" @refresh="refresh"></add>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="cancle">取 消</el-button>
        <el-button type="primary" @click="addSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getDistributions, getDistriDetail, removeDistri } from 'services/monitor'
import { booleanFilter, waiteTimeFilter, statusFilter } from '@/filters/index'
import { getRole } from 'services/system/role'
import add from './add'
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
    label: 'VC原生告警',
    prop: 'nativeAlarm',
    scopedSlots: { customRender: 'nativeAlarm' }
  },
  {
    label: '操作',
    disabled: true,
    prop: 'id',
    width: '220px',
    showOverflowTooltip: false,
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  components: {
    add
  },
  data() {
    return {
      booleanFilter,
      waiteTimeFilter,
      statusFilter,
      columns,
      searchConfigs,
      searchSenderConfigs,
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
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
      totalUser: 0,
      roleList: []
    }
  },
  methods: {
    getDetail(id) {
      getDistriDetail(id).then((data) => {
        if (data.success) {
          this.detailData = Object.assign({}, data.data)
          this.detailFlag = true
          this.getRoleList()
        }
      })
    },
    async getRoleList() {
      this.roleList = []
      const data = await getRole({
        page: 1,
        rows: 9999999
      })
      if (data.success) {
        const roleList = data.data.rows
        const roleIds = JSON.parse(this.detailData.roleIds || '[]')
        roleList.forEach((item) => {
          if (roleIds.indexOf(item.id) > -1) this.roleList.push(item)
        })
      }
    },
    goBack() {
      this.detailFlag = false
    },
    getList() {
      this.loading = true
      getDistributions(this.params).then((data) => {
        this.loading = false
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
          removeDistri(id).then((data) => {
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
  created() {},
  mounted() {}
}
</script>
<style scoped>
.search-container {
  padding-bottom: 0px !important;
}
</style>
