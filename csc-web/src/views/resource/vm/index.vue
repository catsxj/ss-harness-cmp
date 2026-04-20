<template>
  <el-card class="wrapper">
    <AdvanceTable :card-border="false" :searchConfigs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" ref="multipleTable" @select="handleSelectItem" @select-all="handleSelectAll">
      <template v-slot:action>
        <router-link :to="{ name: 'ServiceEcsCreate', params: { type: 'EFC' }, query: { EFC: true } }" class="m-r-md">
          <el-button type="primary">订购云主机</el-button>
        </router-link>
        <el-button type="ghost" @click="handle(1)" :disabled="selectList.length == 0">
          <i class="el-icon-switch-button"></i>
          开机
        </el-button>
        <el-button type="ghost" @click="handle(2)" :disabled="selectList.length == 0">
          <i class="el-icon-switch-button"></i>
          关机
        </el-button>
        <el-button type="ghost" @click="handle(3)" :disabled="selectList.length == 0">
          <i class="el-icon-switch-button"></i>
          重启
        </el-button>
        <el-button type="ghost" @click="handleImport" icon="el-icon-download"> 导出 </el-button>
        <!-- <el-button type="ghost" @click="removeVms()" :disabled="selectList.length == 0">
          <i class="el-icon-delete"></i>
          移入回收站
        </el-button> -->
      </template>
      <template #account="val, record">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #ip="val, record">
        <div v-if="record.vendorType == 'OPENSTACK' || record.vendorType == 'EASYSTACK' || record.vendorType == 'MANAGEONE' || record.vendorType == 'FUSIONCLOUD'">
          <span v-for="item in record.privateIpsList" :key="item.networkId">
            <div v-for="(items1, index) in item.addresses" :key="index">(内网){{ items1.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
          </span>
        </div>
        <div v-else-if="record.vendorType == 'VMWARE' || record.vendorType == 'INSPURRAIL' || record.vendorType == 'CNWARE' || record.vendorType == 'ZSTACK' || record.vendorType == 'CECSTACK' || record.vendorType == 'H3C' || record.vendorType == 'SANGFOR' || record.vendorType == 'CLOUDTOWER'">
          <div v-for="item in record.privateIpsList" :key="item.address">(内网){{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </div>
        <div v-else-if="record.vendorType == 'HUAWEI' || record.vendorType == 'HCSO'">
          <div v-for="item in record.privateIpsList" :key="item.address">{{ item.type == 'floating' ? '(公网)' : '(内网)' }}{{ !item.address ? '' : item.address + (!item.networkName ? '' : '(' + item.networkName + ')') }}</div>
        </div>
        <div v-else-if="record.vendorType == 'QCLOUD'">
          <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.address }}</div>
        </div>
        <div v-else-if="record.vendorType == 'AZURE' || record.vendorType == 'AWS'">
          <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
        </div>
        <div v-else-if="record.vendorType == 'JDCLOUD'">
          <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item }}</div>
        </div>
        <div v-else-if="record.vendorType == 'VOLCENGINE'">
          <!-- <div v-for="(item, index) in record.privateIpsList" :key="index">(内网){{ item.primaryIpAddress }}</div> -->
          <div v-if="JSON.parse(record.privateIps)[0].primaryIpAddress">{{ JSON.parse(record.privateIps)[0].primaryIpAddress }}(内网)</div>
          <div v-if="JSON.parse(record.privateIps)[0].eipAddress">{{ JSON.parse(record.privateIps)[0].eipAddress }}(公网)</div>
        </div>
        <div v-else-if="record.vendorType == 'SMARTX'">
          <div>{{ record.managerIp ? '(内网)' + record.managerIp : '--' }}</div>
        </div>
        <div v-else>
          <div v-for="item in record.privateIpsList" :key="item">(内网){{ item }}</div>
        </div>
        <div v-if="record.floatingIp">(公网){{ record.floatingIp }}</div>
        <div v-if="record.vendorType == 'CNWARE' || record.vendorType == 'CECSTACK'">
          <div v-for="(item, index) in record.publicIps" :key="index">(公网){{ item.address }}</div>
        </div>
      </template>
      <template #spec="val, record"> {{ (record.cpu ? record.cpu : 0) + 'C/' + (record.memory ? record.memory : 0) + 'GB/' }}{{ record.disk == null ? 0 : record.disk + 'GB' }} </template>
      <template #status="status">
        <status-icon :type="status | vmStatusColor">{{ status | openstackServer }}</status-icon>
      </template>
      <template #os="val, record">
        <div v-if="record.vendorType == 'SMARTX' || record.vendorType == 'ZSTACK'">
          {{ record.osVersion ? record.osVersion : '' }}
        </div>
        <div v-else>
          {{ (record.osCategory ? record.osCategory : '') + ' ' + (record.osName ? record.osName : '') + ' ' + (record.osVersion ? record.osVersion : '') }}
        </div>
      </template>
      <template #memory="val"> {{ val }} GB </template>
      <template #operate="val, record">
        <operate :obj="record" @getList="getList" v-if="(record.vendorType == 'VMWARE' && !record.software) || record.vendorType != 'VMWARE'"></operate>
      </template>
    </AdvanceTable>
    <detail :data="installDetail" v-if="detailFlag" @goBack="goBack" ref="detail" @back="getDetail"></detail>
    <selection-service router="ServiceEcsCreate" code="compute" v-if="dialog.dialog" :dialog="dialog"></selection-service>
  </el-card>
</template>

<script>
import operate from './operate/index.vue'
import detail from './detail/index.vue'
import webSocket from '@/common/mixins/getGlobalSocket'
import selectionService from '@/components/selectionService.vue'
import { getVm, detailVm, conditionService, patchVms, recycleVms } from 'services/platform/index'
import { getClient } from 'services/platform/security'
import { conditionProject } from 'services/system/project'
import { getTags } from 'services/system/tag'
import { downloadFile } from 'utils'
import { vendorName } from 'filters'
export default {
  mixins: [webSocket],
  data() {
    return {
      columns: [
        {
          type: 'selection',
          selectable: this.selectable
        },
        {
          label: '名称',
          prop: 'name',
          sortable: 'custom',
          scopedSlots: { customRender: 'account' }
        },
        {
          label: 'IP',
          prop: 'privateIps',
          sortable: 'custom',
          scopedSlots: { customRender: 'ip' }
        },
        {
          label: '状态',
          prop: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          label: '规格',
          prop: 'spec',
          scopedSlots: { customRender: 'spec' }
        },
        {
          label: '操作系统',
          prop: 'os',
          scopedSlots: { customRender: 'os' }
        },
        {
          label: '过期时间',
          prop: 'expiredTime'
        },
        {
          label: this.$store.getters.systemConfig.projectConfigLabel,
          prop: 'projectName'
        },
        {
          label: '唯一标识',
          prop: 'uniqueId'
        },
        {
          label: '所属平台',
          prop: 'vendorName'
        },
        {
          label: '操作',
          disabled: true,
          width: '260px',
          showOverflowTooltip: false,
          scopedSlots: { customRender: 'operate' }
        }
      ],
      searchConfigs: [
        { label: '平台类型', value: ' vendorType', type: 'Select', data: [] },
        { label: '名称', value: 'name', type: 'Input' },
        { label: 'IP', value: 'privateIps', type: 'Input' },
        {
          label: '状态',
          value: 'status',
          type: 'Select',
          data: [
            { id: 'RUNNING', name: '运行中' },
            { id: 'BUILDING', name: '创建中' },
            { id: 'STOPPED', name: '关机' },
            { id: 'SUSPENDED', name: '挂起' },
            { id: 'EXCEPTION', name: '异常' },
            { id: 'UNKNOWN', name: '断开' }
          ]
        },
        { label: this.$store.getters.systemConfig.projectConfigLabel, value: 'projectId', type: 'Select', data: [] },
        { label: '标签', value: 'labelContent', type: 'Cascade', props: { value: 'id', label: 'name', children: 'children', checkStrictly: false }, data: [] },
        { label: 'UUID', value: 'uuid', type: 'Input' },
        { value: 'isRecycle', type: 'Const', initValue: 0 }
      ],
      list: null,
      total: null,
      params: {
        page: 1,
        rows: 10
      },
      detailFlag: false,
      //        详情数据
      installDetail: {
        id: '',
        title: '云主机详情',
        header: '基本信息'
      },
      dialog: {
        dialog: false
      },
      ClientUrl: '',
      typelist: [],
      idList: [],
      selectList: [],
      props: {
        label: 'name',
        value: 'id',
        children: 'children',
        emitPath: false
      }
    }
  },
  components: {
    operate,
    detail,
    selectionService
  },
  created() {
    this.getProject()
    this.getTag()
    conditionService('server').then(data => {
      if (data.success) {
        this.searchConfigs.find(({ label }) => label === '平台类型').data = data.data.map(item => {
          return {
            name: vendorName(item),
            id: item
          }
        })
      }
    })
    const resourceId = this.$route.query.resourceId
    if (!resourceId) return
    this.getDetail({ id: resourceId })
  },
  methods: {
    handleImport() {
      this.$refs.multipleTable.handleSearch()
      downloadFile('/ims/v1/vms/download', {
        action: 'createAllVmXls',
        params: this.params.params
      })
    },
    async getProject() {
      const data = await conditionProject({
        condition: JSON.stringify({
          condition: 'listApplyProjects'
        })
      })
      if (data.success) {
        this.searchConfigs.find(({ label }) => label === this.$store.getters.systemConfig.projectConfigLabel).data = data.data
      }
    },
    getTag() {
      getTags({
        page: 1,
        rows: 9999
      }).then(data => {
        if (data.success) {
          data.data.rows.forEach(item => {
            this.recursion(item)
          })
          this.searchConfigs.find(({ label }) => label === '标签').data = data.data.rows
        }
      })
    },
    recursion(data) {
      if (!data.content) {
        this.$set(data, 'children', '')
      } else {
        const ary = JSON.parse(data.content)
        data.children = ary.map(item => {
          return {
            name: item,
            id: `${data.name}:${item}`
          }
        })
      }
    },
    removeVms() {
      const idList = []
      this.selectList.forEach(item => {
        idList.push(item.uuid)
      })
      this.$confirm('此操作将所选云主机移入回收站, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        recycleVms(idList).then(data => {
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
    handle(index) {
      // 批量操作
      let str = ''
      let action = ''
      const idList = []
      this.selectList.forEach(item => {
        idList.push(item.id)
      })
      switch (index) {
        case 1:
          str = '开机'
          action = 'start'
          break
        case 2:
          str = '关机'
          action = 'stop'
          break
        case 3:
          str = '重启'
          action = 'reboot'
          break
      }
      this.$confirm('此操作将' + str + '所选云主机, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchVms(action, idList).then(data => {
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
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    // 单选
    handleSelectItem(selection, row) {
      this.refreshId()
      if (this.idList.indexOf(row.id) > -1) {
        for (let j = 0; j < this.selectList.length; j++) {
          const item = this.selectList[j]
          if (item.id == row.id) {
            this.selectList.splice(j, 1)
            break
          }
        }
      } else {
        this.selectList.push(row)
      }
    },
    // 全选
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        selection.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.list.forEach(item => {
          if (this.idList.indexOf(item.id) > -1) {
            for (let j = 0; j < this.selectList.length; j++) {
              const row = this.selectList[j]
              if (item.id == row.id) {
                this.selectList.splice(j, 1)
                break
              }
            }
          }
        })
      }
    },
    Create() {
      this.dialog.dialog = true
    },
    onmessage(data) {
      if (data.operate.indexOf('vm') > -1 || data.operate.indexOf('computer') > -1) {
        this.getList()
      }
      if (data.message) {
        this.getList()
      }
    },
    judgeOperate(data) {
      // 组合云主机配置
      data.hostConfig = data.cpu + 'C/' + data.memory + 'GB/' + (data.disk ? data.disk : 0) + 'GB'
      // if (data.vendorType != 'VMWARE') data.disSnap = true;
      switch (data.status) {
        case 'STOPPING':
          data.allDisabled = true
          break
        case 'STARTING':
          data.allDisabled = true
          break
        case 'SUSPENDING':
          data.allDisabled = true
          break
        case 'RESTARTING':
          data.allDisabled = true
          break
        case 'PAUSED':
          data.disControl = true
          data.disMonitor = true
          data.disStart = true
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disSuspended = true
          data.disRecover = true
          data.disActive = false
          data.disPostpone = false
          data.disSnapshot = false
          data.disPassword = true
          data.disPaused = true
          break
        case 'ACTIVING':
          data.allDisabled = true
          break
        case 'INACCESSIBLE':
          data.disControl = true
          data.disStart = true
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disActive = true
          data.disSuspended = true
          data.isExpired = true
          data.disPassword = true
          data.isSHELVED = true
          data.disPostpone = true
          break
        case 'SYNSEXCEPTION':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'BUILDING':
          data.allDisabled = true
          break
        case 'EXCEPTION':
          data.disControl = true
          data.disMonitor = true
          data.disStart = true
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disActive = true
          data.disSuspended = true
          data.disRecover = true
          data.disPostpone = true
          data.disPassword = true
          data.disSnapshot = true
          data.isSHELVED = true
          break
        case 'RUNNING':
          data.disControl = false
          data.disMonitor = false
          data.disStart = true
          data.disStop = false
          data.disRestart = false
          data.disShutoff = false
          data.disActive = true
          data.disSuspended = false
          data.disRecover = true
          data.disPostpone = false
          data.disPassword = false
          data.disSnapshot = false
          break
        case 'STOPPED':
          data.disControl = true
          data.disMonitor = true
          data.disStart = false
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disSuspended = true
          data.disRecover = true
          data.disActive = true
          data.disPostpone = false
          data.disSnapshot = false
          data.disPassword = true
          data.disPaused = true
          break
        case 'SUSPENDED':
          data.disControl = true
          data.disMonitor = true
          data.disStart = false
          data.disStop = true
          data.disRestart = true
          data.disShutoff = true
          data.disSuspended = true
          data.disRecover = false
          data.disActive = true
          data.disPostpone = false
          data.disSnapshot = false
          data.disPassword = true
          break
        case 'HIBERNATED':
          data.disPaused = true
          data.disRestart = true
          data.disSuspended = true
          data.disStop = true
          break
        case 'UNKNOWN':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'UNKNOWNON':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'UNKNOWNOFF':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'UNKNOWNSUSPEND':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'RECOVERING':
          data.allDisabled = true
          break
        case 'PAUSING':
          data.allDisabled = true
          break
        case 'SHELVED':
          data.allDisabled = true
          data.disPostpone = true
          break
        case 'RESTORING':
          data.allDisabled = true
          break
      }
    },
    getList() {
      getVm(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.selectList = []
          this.list.forEach(item => {
            const nowTime = new Date()
            const nowDate = nowTime.getTime()
            this.judgeOperate(item)
            item.isExpired = false
            const expiredTimeDate = new Date(item.expiredTime).getTime()
            if (expiredTimeDate < nowDate) {
              item.isExpired = true
            }
            if (item.vendorType === 'SANGFOR' && item.privateIps) {
              item.privateIps = JSON.stringify(Object.values(JSON.parse(item.privateIps)).map(item => ({ address: Object.keys(item)[0] })))
            }
            if (item.privateIps) item.privateIpsList = JSON.parse(item.privateIps)
            if (item.publicIps) item.publicIps = JSON.parse(item.publicIps)
          })
        }
      })
    },
    // 跳转详情页
    getDetail(row) {
      detailVm(row.id).then(data => {
        if (data.success) {
          if (row.vendorType === 'SANGFOR') {
            data.data = {
              ...data.data,
              detail: JSON.parse(data.data.detail || '{}'),
              sangforNetworks: JSON.parse(data.data.sangforNetworks || '[]').map(item => {
                // 将下划线命名转为驼峰命名
                const newItem = {}
                Object.keys(item).forEach(key => {
                  const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
                  newItem[newKey] = item[key]
                })
                return newItem
              })
            }
            // 改成和其他平台类型的格式
            if (data.data.privateIps) {
              data.data.privateIps = JSON.stringify(Object.values(JSON.parse(data.data.privateIps)).map(item => ({ address: Object.keys(item)[0] })))
            }
          }
          this.installDetail = data.data
          this.installDetail.configuration = this.installDetail.cpu + 'C/' + this.installDetail.memory + 'GB/' + this.installDetail.disk + 'GB'
          this.installDetail.osConfig = this.installDetail.osName ? this.installDetail.osName : '' + ' ' + this.installDetail.osVersion ? this.installDetail.osVersion : ''
          this.installDetail.privateIpsList = data.data.privateIps ? JSON.parse(data.data.privateIps) : []
          this.installDetail.publicIpsList = data.data.publicIps ? JSON.parse(data.data.publicIps) : []
          this.judgeOperate(this.installDetail)
          this.installDetail.expiredTime = row.expiredTime
          if (this.installDetail.vendorType == 'VMWARE' && this.installDetail.software) this.installDetail.showBtn = false
          else this.installDetail.showBtn = true
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
      this.getList()
    },
    handleClientDownlod() {
      getClient({
        type: navigator.platform
      }).then(data => {
        if (data.success) {
          this.ClientUrl = data.data
        }
      })
    }
  }
}
</script>
