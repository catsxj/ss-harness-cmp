<template>
  <component :is="is" :title-name="`【${$route.query.name}】`" @goBack="goBack">
    <AdvanceTable :title="'执行列表'" :data="list" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="taskColumns" :get-list="getList" :loading="loading">
      <template #name="val, record">
        <router-link class="detail-href" tag="span" :to="{ name: 'TaskHistoryPreview', params: { id: record.id } }">
          {{ record.name }}
        </router-link>
      </template>
      <template #status="status">
        <status-icon :type="status | taskExeStatusFilter('color')">
          {{ status | taskExeStatusFilter() }}
        </status-icon>
      </template>
      <template #executeMode="val, record">
        <el-tag type="primary">{{ executeModeOptions[record.executeMode] }}</el-tag>
      </template>
      <template #tenantName="val, record">
        {{ record.tenantName || '--' }}
      </template>
      <template #operate="val, record">
        <span v-if="record.isBackup">
          <el-button type="text" icon="el-icon-refresh" @click="handleRecovery(record)">申请恢复</el-button>
          <div class="action-divider"></div>
          <el-button type="text" icon="el-icon-document" @click="handleFile(record.id, 'delete')">文件</el-button>
          <div class="action-divider"></div>
        </span>
        <el-dropdown trigger="click" @command="exportFile">
          <span class="el-dropdown-link"> 导出文件<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :command="{ filetype: 'pdf', id: record.id }" :disabled="!judgeIsImport(record.status)"> PDF </el-dropdown-item>
            <el-dropdown-item :command="{ filetype: 'word', id: record.id }" :disabled="!judgeIsImport(record.status)"> WORD </el-dropdown-item>
            <el-dropdown-item :command="{ filetype: 'excel', id: record.id }" :disabled="!judgeIsImport(record.status)"> EXCEL </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog title="下载文件列表" :close-on-click-modal="false" :visible.sync="dialogVisible" width="50%">
      <smart-table :data="fileList">
        <el-table-column label="IP" prop="host" show-overflow-tooltip> </el-table-column>
        <el-table-column label="文件名称" prop="filename"> </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="downloadFile(scope.row.path)"> <Icon type="icon-xiazai1-copy-copy"></Icon>下载 </el-button>
          </template>
        </el-table-column>
      </smart-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </component>
</template>
<script>
import { taskExeOptions } from '@/common/commonData'
import webSocket from '@/common/mixins/getGlobalSocket'
import { getInstance, getInstanceDetail, exportInstance, operateInstance, checkInstanceFile, exportInstanceFile } from 'services/task/task'

const objToArr = (obj) => {
  const arr = []
  for (const a in obj) {
    arr.push({
      id: a,
      name: obj[a]
    })
  }
  return arr
}
const executeModeOptions = {
  WEB: '页面执行',
  // API: 'API调用',
  CRON: '定时执行'
}
const searchConfigs = [
  {
    label: '任务名称',
    value: 'name',
    type: 'Input'
  },
  {
    label: '任务状态',
    value: 'status',
    type: 'Select',
    data: objToArr(taskExeOptions)
  },
  {
    label: '执行',
    value: 'gmtStart',
    type: 'DateRange'
  },
  {
    label: '启动任务',
    value: 'executeMode',
    type: 'Select',
    data: objToArr(executeModeOptions)
  }
  // {
  //   label: '所属租户',
  //   value: 'tenantId',
  //   type: 'Select',
  //   data: [],
  //   service: {
  //     api: getTenant,
  //     params: { simple: true },
  //     attr: 'data.rows'
  //   }
  // }
]
export default {
  mixins: [webSocket],
  data() {
    return {
      taskColumns: [
        { label: '任务名称', prop: 'name', scopedSlots: { customRender: 'name' } },
        { label: '启动人', prop: 'operator' },
        { label: '任务状态', prop: 'status', scopedSlots: { customRender: 'status' } },
        { label: '开始时间', prop: 'gmtStart', minWidth: '110px' },
        { label: '结束时间', prop: 'gmtFinish', minWidth: '110px' },
        { label: '启动方式', prop: 'executeMode', scopedSlots: { customRender: 'executeMode' } },
        { label: '总耗时（s）', prop: 'cost' },
        // { label: '所属租户', prop: 'tenantName' },
        { label: '操作', disabled: true, width: '255px', scopedSlots: { customRender: 'operate' } }
      ],
      searchConfigs: [],
      is: 'div',
      loading: false,
      taskExeOptions,
      executeModeOptions,
      showBack: false,
      executeDialog: {
        visible: false
      },
      historyType: '',
      applyData: {},
      dialogApplyVisible: false,
      dialogVisible: false,
      list: null,
      total: null,
      fileList: [],
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  created() {
    this.init()
  },
  watch: {
    $route() {
      this.init()
    }
  },
  methods: {
    onmessage(data) {
      if (data.category === 'TaskResult') {
        this.getList()
      }
    },
    getDetail(id) {
      this.$router.push(`${this.$route.meta.route}/${id}`)
    },
    init() {
      const {
        params: { id },
        query: { key }
      } = this.$route
      this.is = id ? 'PageLayout' : 'div'
      this.searchConfigs = [...searchConfigs]
      if (id) {
        this.searchConfigs.push({
          type: 'Const',
          value: key,
          initValue: id
        })
      }
    },
    // 判断是否可以导出
    judgeIsImport(status) {
      const statusArr = ['SUCCESS', 'FAILED']
      return statusArr.includes(status)
    },
    goBack() {
      this.$router.go(-1)
    },
    // 导出文件
    exportFile(command) {
      const { id, filetype } = command
      exportInstance(id, { filetype })
    },
    // 下载备份文件
    downloadFile(path) {
      checkInstanceFile({ path }).then((data) => {
        if (data.success) {
          exportInstanceFile(path)
        }
      })
    },
    handleRecovery(record) {
      this.$confirm(`您确定要恢复【${record.name}】吗?`, '提示', {
        type: 'warning'
      }).then(async () => {
        const data = await operateInstance(record.id, 'apply_recover', {
          startMode: 'Auto'
        })
        if (data.success) {
          this.$message.success(data.message)
          this.getList()
        }
      })
    },
    handleFile(id) {
      getInstanceDetail(id).then((data) => {
        if (data.success) {
          this.fileList = data.data.results
          this.fileList.forEach((item) => {
            item.filename = item.path.split('/').pop()
          })
          this.dialogVisible = true
        }
      })
    },
    getList() {
      this.loading = true
      getInstance(this.params)
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
    handleSearch(params) {
      this.params.page = 1
      this.params.params = params
      this.getList()
    }
  }
}
</script>
