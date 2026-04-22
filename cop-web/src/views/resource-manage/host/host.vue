<template>
  <div>
    <AdvanceTable :title="`${title}主机列表`" :data="tableData" :searchConfigs="searchConfigs" :params="params" :total="total" :columns="columns" :get-list="getData" :loading="loading" :key="path">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate(null, 1)" icon="el-icon-plus">
          新增
        </el-button>
        <el-button type="primary" icon="el-icon-refresh" @click="handleSynchro(type)">同步</el-button>
        <!-- <el-button type="primary" icon="el-icon-refresh" @click="handleSynchro('RIS')">同步RIS</el-button> -->
        <el-button icon="el-icon-upload2" @click="importData"> 导入 </el-button>
      </template>
      <template #known="known">
        {{ known ? '已纳管' : '未纳管' }}
      </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColorFilter">{{ status | vmStatusFilter }}</status-icon>
      </template>
      <template #ips="ips">
        <template v-if="ips.includes('[')">
          <span v-for="item in JSON.parse(ips)" :key="item">{{ item }} <span></span></span>
        </template>
        <template v-else>
          {{ ips }}
        </template>
      </template>
      <template #operate="val, record">
        <!-- <el-button icon="el-icon-setting" type="text" @click="setSq(record)">网段配置</el-button>
        <div class="action-divider"></div> -->
        <el-button type="text" @click="handleCreate(record, 2)" icon="el-icon-edit"> 编辑 </el-button>
        <div class="action-divider" v-if="record.sourceType != 'IMS'"></div>
        <el-button type="text" @click="handleDelete(record)" icon="el-icon-delete" v-if="record.sourceType != 'IMS'"> 删除 </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item :disabled="record.sourceType != 'IMS' || record.updateMode != 'AUTO' || !record.ip" @click.native="handleUser(record, record.osCategory)"> 用户 </el-dropdown-item>
            <el-dropdown-item :disabled="record.sourceType != 'IMS' || record.updateMode != 'AUTO' || !record.ip" @click.native="handleServer(record, record.osCategory)"> 服务 </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- <div class="action-divider"></div>
        <el-button icon="el-icon-setting" type="text" v-if="record.segmentId" @click="settingAllow(record)">HostsAllow配置</el-button>
        <div class="action-divider" v-if="record.segmentId"></div>
        <el-button icon="el-icon-setting" type="text" @click="setInspect(record)">纳管巡检</el-button> -->
      </template>
    </AdvanceTable>
    <set-sq :set-data="setData" v-if="setData.dialog" @setOk="getData"></set-sq>
    <!--新增编辑脚本-->
    <el-dialog :title="textMap2[dialogStatus]" :close-on-click-modal="false" v-if="addHostVisible" :visible.sync="addHostVisible" width="35%">
      <basic-form :model="addHostData" ref="addHostData" label-width="150px">
        <div v-if="detail.sourceType != 'IMS'">
          <basic-form-item label="名称：" prop="name" validate="required">
            <el-input v-model="addHostData.name" auto-complete="off"></el-input>
          </basic-form-item>
          <basic-form-item label="系统类别：" prop="osCategory" validate="required">
            <el-input v-model="addHostData.osCategory" auto-complete="off"></el-input>
          </basic-form-item>
        </div>
        <basic-form-item label="所属网段：" prop="segmentId">
          <el-select placeholder="请选择网段" v-model="addHostData.segmentId" filterable clearable>
            <el-option v-for="item in segmentIdList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
        </basic-form-item>
        <div v-if="detail.sourceType != 'IMS'">
          <!-- <basic-form-item label="ip：" prop="ip" validate="ip">
            <el-input v-model="addHostData.ip" auto-complete="off"></el-input>
          </basic-form-item>
          <basic-form-item label="ips：" prop="ips" validate="required,ip">
            <el-input v-model="addHostData.ips" auto-complete="off"></el-input>
          </basic-form-item> -->
          <template v-if="dialogStatus == 'create'">
            <basic-form-item v-for="(ip, index) in addHostData.ipList" :label="`${index == 0 ? '所有ip' : ''}`" :key="index" :prop="'ipList.' + index + '.value'" validate="required,ip">
              <el-input v-model="ip.value" style="width: 75%" class="m-r-xs"></el-input>
              <el-button @click="addIp" v-if="index == 0" icon="el-icon-plus"></el-button>
              <el-button @click.prevent="removeIp(ip)" v-if="index != 0" icon="el-icon-minus"></el-button>
            </basic-form-item>
          </template>
          <template v-else>
            <basic-form-item v-for="(ip, index) in addHostData.ipList" :label="`${index == 0 ? '所有ip' : ''}`" :key="index" :prop="'ipList.' + index + '.value'" :rules="[ipsValidate]">
              <el-input v-model="ip.value" style="width: 75%" class="m-r-xs" @input.native="changeInput(index)"></el-input>
              <el-button @click="addIp" v-if="index == 0" icon="el-icon-plus"></el-button>
              <el-button @click.prevent="removeIp(ip)" v-if="index != 0" icon="el-icon-minus"></el-button>
            </basic-form-item>
          </template>
          <basic-form-item label="状态：" prop="status" validate="required">
            <el-select placeholder="请选择状态" v-model="addHostData.status" filterable clearable>
              <el-option v-for="item in statusList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="用户名：" prop="username">
            <el-input v-model="addHostData.username"></el-input>
          </basic-form-item>
          <basic-form-item label="密码：" prop="password">
            <el-input v-model="addHostData.password" show-password auto-complete="new-password"></el-input>
          </basic-form-item>
        </div>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addHostVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addHostSubmit">确定</el-button>
      </div>
    </el-dialog>
    <import-dialog :dialog="importDialog" v-if="importDialog.visible" ref="importDialog" @back="getData"></import-dialog>
    <user-config v-if="userConfig.visible" ref="userConfigRef" @back="getData" :userConfig="userConfig"></user-config>
  </div>
</template>

<script>
import { getHosts, HostsAllow, setBsmHostsInspect, createHost, updateBsmHost, deleteBsmHost, getBsmHostDetail, getBsmHostNetwork, syncHost } from 'services/task/resource.js'
import SetSq from '@/views/resource-manage/components/setSq'
import { columns, vmSearchConfigs, pmSearchConfigs } from './config'
// import { vmStatusFilter, vmStatusColorFilter } from '@/filters/index'
import ImportDialog from './importDialog'
import UserConfig from './UserConfig'
import crypto from 'utils/crypto.js'

export default {
  components: { SetSq, ImportDialog, UserConfig },
  data() {
    return {
      ipsValidate: {
        required: true,
        validator: (rule, value, callback) => {
          const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
          const flag = this.addHostData.ipList.every((item) => reg.test(item.value))
          if (flag) {
            callback()
          } else {
            callback(new Error('请输入正确的IP地址'))
          }
        }
      },
      columns,
      vmSearchConfigs,
      pmSearchConfigs,
      loading: false,
      tableData: [],
      total: 0,
      params: {
        page: 1,
        rows: 20,
        sorter: JSON.stringify({ gmtCreate: '1' })
      },
      setData: {
        dialog: false,
        data: {}
      },
      type: 'VM',
      searchConfigs: vmSearchConfigs,
      title: '虚拟',
      dialogStatus: '',
      // 新增编辑
      textMap2: {
        update: '主机修改',
        create: '新增主机'
      },
      addHostVisible: false,
      addHostData: {
        name: '',
        status: '',
        segmentId: '',
        osCategory: '',
        category: this.type == 'VM' ? 'LOGICAL' : 'PHYSICAL',
        ipList: [],
        ips: [],
        // ip: '',
        username: '',
        password: ''
      },
      typeName: 'ansible',
      statusList: [
        { id: 'RUNNING', name: '运行中' },
        { id: 'STOPPED', name: '已关机' },
        { id: 'SUSPENDED', name: '已挂起' },
        { id: 'PAUSED', name: '已停止' },
        { id: 'UNKNOWN', name: '已断开' },
        { id: 'EXCEPTION', name: '异常' },
        { id: 'UNKNOWSTATUS', name: '未知' }
      ],
      segmentIdList: [],
      flag: true,
      detail: {},
      importDialog: {
        visible: false
      },
      idx: '',
      userConfig: {
        visible: false
      }
    }
  },
  computed: {
    path() {
      return this.$route.path
    }
  },
  watch: {
    path(val) {
      this.judgeType(val)
    }
  },
  filters: {
    vmStatusFilter(val) {
      const statusMap = {
        RUNNING: '运行中',
        STOPPED: '已关机',
        SUSPENDED: '已挂起',
        PAUSED: '已停止',
        UNKNOWN: '已断开',
        EXCEPTION: '异常',
        UNKNOWSTATUS: '未知'
      }
      return statusMap[val] || '未知'
    },
    vmStatusColorFilter(val) {
      const statusMap = {
        RUNNING: 'success',
        STOPPED: 'danger',
        SUSPENDED: 'danger',
        PAUSED: 'danger',
        EXCEPTION: 'warning',
        UNKNOWN: 'warning'
      }
      return statusMap[val] || 'warning'
    }
  },
  created() {
    this.judgeType(this.path)
  },
  methods: {
    judgeType(val) {
      if (val.includes('pm')) {
        this.type = 'PM'
        this.title = '物理'
        this.searchConfigs = this.pmSearchConfigs
      } else {
        this.type = 'VM'
        this.title = '虚拟'
        this.searchConfigs = this.vmSearchConfigs
      }
    },
    // 导入任务
    importData() {
      this.importDialog = {
        visible: true
      }
    },
    async getsegmentIdList() {
      const { data, success } = await getBsmHostNetwork({ page: 1, rows: 999999, params: '[]' })
      if (success) this.segmentIdList = data.rows
    },
    changeInput(idx) {
      this.idx = idx
      this.$forceUpdate()
      this.$refs.addHostData.validate()
    },
    addIp() {
      this.addHostData.ipList.push({
        value: '',
        key: Date.now()
      })
      this.$forceUpdate()
    },
    removeIp(item) {
      var index = this.addHostData.ipList.indexOf(item)
      if (index !== -1) {
        this.addHostData.ipList.splice(index, 1)
      }
      this.$forceUpdate()
    },
    // 新增编辑
    async handleCreate(row, flag) {
      if (this.flag) {
        this.getsegmentIdList()
        this.flag = false
      }
      this.detail = {}
      this.addHostData = {}
      switch (flag) {
        case 1:
          this.dialogStatus = 'create'
          this.addHostData = {
            name: '',
            status: '',
            segmentId: '',
            osCategory: '',
            category: this.type == 'VM' ? 'LOGICAL' : 'PHYSICAL',
            ipList: [
              {
                value: ''
              }
            ],
            ips: [],
            // ip: '',
            username: '',
            password: '',
            updateMode: 'MANUAL'
          }
          break
        case 2:
          this.dialogStatus = 'update'
          this.detail = row
          const data = await getBsmHostDetail(row.id)
          this.addHostData = data.data
          const ips = data.data.ips.includes('[') ? JSON.parse(data.data.ips).join(' ') : data.data.ips
          this.addHostData.ipList = []
          this.addHostData.password = crypto.decrypt(this.addHostData.password || '')
          this.addHostData.ips = []
          ips.split(' ').forEach((item) => {
            this.addHostData.ipList.push({
              value: item,
              key: Date.now()
            })
          })
          break
      }
      this.addHostVisible = true
    },
    // 保存host
    addHostSubmit() {
      const that = this
      this.addHostData.ips = []
      this.addHostData.password = crypto.encrypt(this.addHostData.password)
      this.$refs.addHostData.validate((valid) => {
        if (valid) {
          let service
          switch (this.dialogStatus) {
            case 'create':
              service = createHost
              break
            case 'update':
              if (this.detail.id != this.addHostData.segmentId) this.addHostData.updateMode = 'MANUAL'
              service = updateBsmHost
              break
          }
          this.addHostData.ipList.forEach((item) => {
            this.addHostData.ips.push(item.value)
          })
          this.addHostData.ips = [...new Set(this.addHostData.ips)]
          service(this.addHostData).then((data) => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              that.addHostVisible = false
              that.getData()
            }
          })
        }
      })
    },
    setSq(row) {
      this.setData = {
        dialog: true,
        data: {
          ...row,
          ips: row.ips.includes('[') ? JSON.parse(row.ips).join('') : row.ips
        }
      }
    },
    handleSynchro(category) {
      this.$confirm('执行同步操作前，请先在【分组管理—>网段管理】页面创建网段数据，以免影响正常使用，您确定要同步?', '提示', {
        type: 'warning'
      }).then(() => {
        syncHost(this.type == 'VM' ? 'LOGICAL' : 'PHYSICAL').then((res) => {
          const type = res.success ? 'success' : 'error'
          this.$message[type](res.message)
          if (res.success) this.getData()
        })
      })
    },
    settingAllow(row) {
      this.$confirm('您确定要设置HostsAllow配置嘛?', '提示', {
        type: 'warning'
      }).then(() => {
        HostsAllow(row.id).then((res) => {
          const type = res.success ? 'success' : 'error'
          this.$message[type](res.message)
          if (res.success) this.getData()
        })
      })
    },
    handleDelete(row) {
      this.$confirm('您确定要删除该主机吗嘛?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteBsmHost(row.id).then((res) => {
          const type = res.success ? 'success' : 'error'
          this.$message[type](res.message)
          if (res.success) this.getData()
        })
      })
    },
    submitInspect(params) {
      setBsmHostsInspect(params).then((res) => {
        const type = res.success ? 'success' : 'error'
        this.$message[type](res.message)
        if (res.success) this.getData()
      })
    },
    setInspect(row) {
      if (document.querySelector('#inspect')) document.querySelector('#inspect').checked = true
      this.$confirm(`<div>您确定要对主机[${row.ip}]进行纳管巡检吗?<div> <div><input type="checkbox" id="inspect" autocomplete="off" checked>是否更新密码再进行纳管巡检</div>`, '提示', {
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        this.submitInspect({ id: row.id, force: document.querySelector('#inspect').checked })
      })
    },
    getData() {
      getHosts(this.params).then((res) => {
        if (res.success) {
          this.tableData = res.data.rows
          this.total = res.data.total
        }
      })
    },
    handleUser(data) {
      this.userConfig = { visible: true, ...data }
    },
    // 服务
    handleServer(data, osCategory) {
      let OC = null
      if (osCategory) {
        OC = osCategory.toLocaleUpperCase()
      }
      this.$router.push({ name: 'serverConfig', params: { type: 'pm', osCategory: OC, host: data.ip, segmentId: data.segmentId } })
    }
  }
}
</script>
