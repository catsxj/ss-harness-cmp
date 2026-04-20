<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="installDetail" @goBack="goBack">
      <el-tabs v-model="active">
        <el-tab-pane label="防火墙" name="0">
          <el-form :inline="true">
            <el-form-item>
              <el-button type="primary" @click="addRule" :disabled="installDetail.locked"> 新增 </el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="ruleList" :params="ruleParams" :get-list="getRule" :total="ruleTotal" class="m-t-md">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="startIpAddress" label="起始 IP 地址" show-overflow-tooltip></el-table-column>
            <el-table-column prop="endIpAddress" label="结束 IP 地址" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="remove('rule', scope.row)" :disabled="installDetail.locked">删除</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="VNET规则" name="2" v-if="installDetail.serviceLevelObjective.edition !== 'Basic'">
          <el-form :inline="true">
            <el-form-item>
              <el-button type="primary" @click="addVnet" :disabled="installDetail.locked"> 新增 </el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="vnetList" :params="vnetParams" :get-list="getVnet" :total="vnetTotal" class="m-t-md">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="vpcName" label="虚拟网络" show-overflow-tooltip></el-table-column>
            <el-table-column prop="subnetName" label="子网" show-overflow-tooltip></el-table-column>
            <el-table-column prop="subnetCidr" label="地址范围" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="removeVnet(scope.row)" :disabled="installDetail.locked">删除</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="日志" name="3">
          <smart-table :data="logList" class="m-t-md">
            <el-table-column prop="name" label="日志文件名" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="资源类型" show-overflow-tooltip></el-table-column>
            <el-table-column prop="logSize" label="文件大小" show-overflow-tooltip></el-table-column>
            <el-table-column prop="logLastModifiedTime" label="上次修改时间" show-overflow-tooltip></el-table-column>
            <el-table-column prop="logType" label="文件类型" show-overflow-tooltip></el-table-column>
            <el-table-column prop="logUrl" label="操作" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-button type="text" @click="downloadLog(scope.row)" :disabled="installDetail.locked">下载</el-button>
              </template>
            </el-table-column>
          </smart-table>
        </el-tab-pane>
        <el-tab-pane label="服务器参数" name="server">
          <el-alert :closable="false" title="参数更改立即生效，请谨慎操作" type="warning"> </el-alert>
          <basic-table :data="configList" :params="configParams" :get-list="getConfig" :total="configTotal" class="m-t-md">
            <el-table-column prop="name" label="参数名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="configurationValue" label="值" show-overflow-tooltip width="300px">
              <template slot-scope="scope">
                <el-input @blur="putConfigurations(scope.row)" v-model="record.configurationValue" v-if="record.dataType == 'String'" style="width: 200px"></el-input>
                <el-input-number @blur="putConfigurations(record)" :controls="false" v-model="record.configurationValue" v-if="record.dataType == 'Integer'" style="width: 200px"></el-input-number>
                <el-select @change="putConfigurations(record)" v-model="record.configurationValue" v-if="record.dataType == 'Enumeration'" style="width: 200px">
                  <el-option v-for="(item, index) in record.list" :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
                <el-select @change="putConfigurations(record)" v-model="record.configurationValue" v-if="record.dataType == 'Set'" style="width: 200px" multiple>
                  <el-option v-for="(item, index) in record.list" :key="index" :label="item.name" :value="item.value"></el-option>
                </el-select>
                <el-radio-group @change="putConfigurations(record)" v-model="record.configurationValue" v-if="record.dataType == 'Boolean'" style="width: 200px">
                  <el-radio v-for="(item, index) in record.list" :key="index" :label="item.name">{{ item.name }}</el-radio>
                </el-radio-group>
                <el-tooltip class="item" effect="dark" placement="top-start" v-if="record.dataType == 'String' || record.dataType == 'Integer'">
                  <div slot="content">{{ `允许的值应为${record.allowedValues}` }}</div>
                  <i class="el-icon-question m-l-md"></i>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="defaultValue" label="系统默认值" show-overflow-tooltip></el-table-column>
            <el-table-column prop="source" label="参数类型" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ soueceFilter[scope.row.source] }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" show-overflow-tooltip></el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="数据库连接" name="str">
          <div v-for="(item, index) in connectData" :key="index" class="m-t-md">
            <el-divider content-position="left" v-if="index == 0">客户端连接</el-divider>
            <el-divider content-position="left" v-if="index == 3">连接字符串</el-divider>
            <div>
              {{ item[0] }}
            </div>
            <div class="m-t-xs">
              <el-row :gutter="20">
                <el-col :span="20">
                  <el-input v-model="item[1]" readonly :id="`copy${index}`"></el-input>
                </el-col>
                <el-col :span="4">
                  <el-button type="text" @click="copy(index)">复制</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="连接安全性" name="ssl">
          <el-divider content-position="left">SSL设置</el-divider>
          <div>
            <el-alert :closable="false" title="可能需要对连接到服务器的应用程序进行其他配置，才能在服务器上强制执行 SSL 连接。" type="warning"> </el-alert>
            <el-form label-width="150px" label-position="left" class="m-t-md">
              <el-form-item label="强制执行 SSL 连接">
                <el-radio-group v-model="installDetail.sslEnforcement">
                  <el-radio label="Enabled">已启用</el-radio>
                  <el-radio label="Disabled">已禁用</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="TLS 版本：" required v-if="installDetail.sslEnforcement == 'Enabled'">
                <el-select v-model="installDetail.minimalTlsVersion">
                  <el-option label="1.0" value="TLS1_0"></el-option>
                  <el-option label="1.1" value="TLS1_1"></el-option>
                  <el-option label="1.2" value="TLS1_2"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="setSsl()">保存</el-button>
                <el-button @click="getDetail(installDetail.id)">重置</el-button>
              </el-form-item>
              <el-form-item label="SSL根证书">
                <el-button type="text" @click="downloadKey()" :disabled="installDetail.locked">下载</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="副本" name="copy" v-if="installDetail.isMaster">
          <basic-table :data="copyList" :params="copyParams" :get-list="getCopy" :total="copyTotal" class="m-t-md">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态">
              <template slot-scope="scope">
                <status-icon :color="scope.row.status | mysqlStatusColor">{{ scope.row.status | mysqlStatus }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column label="详细规格">
              <template slot-scope="scope">
                {{ scope.row.serviceLevelObjective.uuid }}
              </template>
            </el-table-column>
            <el-table-column prop="regionName" label="位置"></el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="主服务器" name="master" v-if="!installDetail.isMaster">
          <basic-table :data="masterList" :params="masterParams" :get-list="getMaster" :total="masterTotal" class="m-t-md">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态">
              <template slot-scope="scope">
                <status-icon :color="scope.row.status | mysqlStatusColor">{{ scope.row.status | mysqlStatus }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column label="详细规格">
              <template slot-scope="scope">
                {{ scope.row.serviceLevelObjective.uuid }}
              </template>
            </el-table-column>
            <el-table-column prop="regionName" label="位置"></el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="监控" name="monitor">
          <monitor :detail="installDetail" v-if="active == 'monitor'"></monitor>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable ref="multipleTable" :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll">
      <template v-slot:action>
        <el-button type="primary" @click="add"> 新增 </el-button>
        <el-button type="ghost" @click="handleDeletes" :disabled="selectList.length == 0"> 删除 </el-button>
      </template>
      <template #name="val, record">
        <span v-if="record.status == 'BUILDING'">{{ record.name }}</span>
        <span v-else class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
      </template>
      <template #status="status">
        <status-icon :color="status | mysqlStatusColor">{{ status | mysqlStatus }} </status-icon>
      </template>
      <template #operate="val, record">
        <lock :data="record" type="AzureDatabaseServer" @back="getList">
          <div class="action-divider"></div>
          <el-button type="text" @click="handleOperate({ flag: 5, imageUuid: record.imageUuid, id: record.id, azureResourceGroupName: record.azureResourceGroupName })"> 删除 </el-button>
          <div class="action-divider"></div>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link"> 更多操作<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :disabled="record.isAllDisabeld" @click.native="restart(record)"> 重启 </el-dropdown-item>
              <el-dropdown-item :disabled="record.isAllDisabeld" @click.native="modifyPas(record)"> 修改密码 </el-dropdown-item>
              <el-dropdown-item :disabled="record.isAllDisabeld" @click.native="modifySet(record.id)"> 调整配置 </el-dropdown-item>
              <el-dropdown-item :disabled="record.isAllDisabeld || record.serviceLevelObjective.edition == 'Basic'" @click.native="modifyAccess(record)"> 修改公共访问级别 </el-dropdown-item>
              <el-dropdown-item v-if="record.isMaster" :disabled="record.isAllDisabeld || record.serviceLevelObjective.edition == 'Basic'" @click.native="addReplica(record)"> 添加从属实例 </el-dropdown-item>
              <el-dropdown-item :disabled="record.isAllDisabeld" @click.native="setTags(record)"> 分配标签 </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </lock>
      </template>
    </AdvanceTable>
    <rule :add-data="ruleData" v-if="ruleData.dialog" @back="getRule"></rule>
    <database :add-data="databaseData" v-if="databaseData.dialog" @back="getDatabase"></database>
    <vnet :add-data="vnetData" v-if="vnetData.dialog" @back="getVnet"></vnet>
    <pas :add-data="pasData" v-if="pasData.dialog" @back="getList"></pas>
    <setting :add-data="setData" v-if="setData.dialog" @back="getList"></setting>
    <replica :add-data="replicaData" v-if="replicaData.dialog" @back="getList"></replica>
    <access :add-data="accessData" v-if="accessData.dialog" @back="getList"></access>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getList"></tags>
  </el-card>
</template>
<script>
import { getMysql, removeMysql, detailMysql, getRule, removeRule, getDatabase, removeDatabase, getVnet, removeVnet, getLogs, getConnects, getConfigurations, putConfigurations, putMysql, removeMysqls } from 'services/platform/azure'
import rule from './addRule.vue'
import database from './database.vue'
import vnet from './vnet.vue'
import monitor from './monitor.vue'
import pas from './modifyPas.vue'
import setting from './modifySet.vue'
import replica from './addReplica.vue'
import access from './modifyAccess.vue'
import tags from '@/components/tag/index.vue'
import { booleanFilter, redundancyFilter, specFilter } from 'filters'
import webSocket from '@/common/mixins/getGlobalSocket'
import lock from '@/components/lock.vue'
const detailSetting = {
  type: 'host',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '资源组', value: 'resourceGroupName' },
      { name: '区域', value: 'regionName' }
    ],
    [
      { name: '版本', value: 'version' },
      { name: '是否允许访问此服务器的公共网络', value: 'publicNetworkAccess', filter: booleanFilter },
      { name: '显示服务器是否启用了基础结构加密的状态', value: 'infrastructureEncryption', filter: booleanFilter }
    ],
    [
      { name: '启用存储自动增长', value: 'publicNetworkAccess', filter: booleanFilter },
      { name: '规格', value: 'edition', filter: specFilter },
      { name: '详细规格', value: 'detailEdition' }
    ],
    [
      { name: '冗余类型', value: 'geoRedundantBackup', filter: redundancyFilter },
      { name: '主服务器', value: 'isMaster', filter: booleanFilter },
      { name: '标签', value: 'tags' }
    ]
  ]
}
const columns = [
  {
    type: 'selection'
  },
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '资源组',
    prop: 'resourceGroupName'
  },
  {
    label: '版本',
    prop: 'version'
  },
  {
    label: '区域',
    prop: 'regionName'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
const searchConfigs = [{ label: '名称', value: 'name', type: 'Input' }]
export default {
  mixins: [webSocket],
  components: { rule, database, monitor, pas, setting, lock, vnet, replica, access, tags },
  data() {
    return {
      columns,
      searchConfigs,
      // 自定义镜像分页
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      detailSetting,
      searchName: '',
      // 自定义镜像
      list: [],
      // 自定义镜像分页
      total: 0,
      // 镜像总显隐
      detailFlag: false,
      installDetail: {},
      azureResourceGroupName: '',
      addData: {
        dialog: false,
        data: {}
      },
      idList: [],
      selectList: [],
      ruleList: [],
      ruleParams: {
        page: 1,
        rows: 10
      },
      ruleTotal: 0,
      databaseList: [],
      databaseParams: {
        page: 1,
        rows: 10
      },
      databaseTotal: 0,
      vnetList: [],
      vnetParams: {
        page: 1,
        rows: 10
      },
      vnetTotal: 0,
      copyList: [],
      copyParams: {
        page: 1,
        rows: 10
      },
      copyTotal: 0,
      masterList: [],
      masterParams: {
        page: 1,
        rows: 10
      },
      masterTotal: 0,
      logList: [],
      configList: [],
      configParams: {
        page: 1,
        rows: 10
      },
      configTotal: 0,
      ruleData: {
        dialog: false,
        data: {}
      },
      databaseData: {
        dialog: false,
        data: {}
      },
      vnetData: {
        dialog: false,
        data: {}
      },
      active: 0,
      connectData: [],
      soueceFilter: {
        'system-default': '系统默认',
        'user-override': '用户重置'
      },
      specFilter: {
        Basic: '基本',
        GeneralPurpose: '常规用途',
        MemoryOptimized: '优化内存'
      },
      pasData: {
        dialog: false,
        data: {}
      },
      setData: {
        dialog: false,
        data: {}
      },
      replicaData: {
        dialog: false,
        data: {}
      },
      accessData: {
        dialog: false,
        data: {}
      },
      tagData: {
        dialog: false,
        data: {}
      },
      detailData: {}
    }
  },
  methods: {
    modifyAccess(data) {
      this.accessData = {
        dialog: true,
        data: {
          id: data.id
        }
      }
      if (data.publicNetworkAccess == 'Enabled') {
        this.$set(this.accessData.data, 'publicNetworkAccess', true)
      } else {
        this.$set(this.accessData.data, 'publicNetworkAccess', false)
      }
    },
    setTags(data) {
      const tags = []
      if (data.tags) {
        const tag = JSON.parse(data.tags)
        for (const i in tag) {
          tags.push({ key: i, value: tag[i] })
        }
      }
      this.tagData = {
        dialog: true,
        data: {
          resourceId: data.id,
          action: 'MYSQL',
          tags: tags
        }
      }
    },
    modifyPas(data) {
      this.pasData = {
        dialog: true,
        data: {
          id: data.id
        }
      }
    },
    modifySet(id) {
      detailMysql(id).then(data => {
        if (data.success) {
          this.detailData = {
            ...data.data,
            performanceTierId: data.data.serviceLevelObjective.performanceTierId
          }
          this.setData = {
            dialog: true,
            vendorId: this.detailData.vendorId,
            regionId: this.detailData.regionId,
            specId: this.detailData.performanceTierId,
            data: {
              id: this.detailData.id,
              sloId: this.detailData.sloId,
              storageMb: this.detailData.storageMb / 1024,
              storageAutogrow: this.detailData.storageAutogrow === 'Enabled',
              backupRetentionDays: this.detailData.backupRetentionDays
            }
          }
        }
      })
    },
    addReplica(data) {
      this.replicaData = {
        dialog: true,
        data: {
          ...data,
          name: ''
        }
      }
    },
    handleDeletes() {
      this.refreshId()
      const list = this.idList
      if (list.length == 0) return this.$message.error('请选择mysql')
      this.$confirm('此操作将删除所选mysql, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeMysqls({ ids: list }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getList()
            this.selectList = []
          }
        })
      })
    },
    setSsl() {
      const params = {
        id: this.installDetail.id,
        sslEnforcement: this.installDetail.sslEnforcement
      }
      if (this.installDetail.sslEnforcement == 'Enabled') {
        params.minimalTlsVersion = this.installDetail.minimalTlsVersion
      }
      putMysql('sslEnforcement', params).then(data => {
        if (data.success) {
          // this.getDetail(this.installDetail.id)
          this.$message.success(data.message)
        }
      })
    },
    downloadLog(row) {
      location.href = row.logUrl
    },
    downloadKey() {
      location.href = 'https://www.digicert.com/CACerts/BaltimoreCyberTrustRoot.crt.pem'
    },
    putConfigurations(row) {
      putConfigurations(row.id, { value: row.configurationValue }).then(data => {
        if (data.success) {
          this.getConfig()
          this.$message.success(data.message)
        }
      })
    },
    copy(index) {
      const input = document.getElementById(`copy${index}`)
      input.select()
      document.execCommand('copy')
      this.$message.success('复制成功!')
    },
    addRule() {
      this.ruleData = {
        dialog: true,
        data: {
          databaseServerId: this.installDetail.id
        }
      }
    },
    addDatabase() {
      this.databaseData = {
        dialog: true,
        data: {
          databaseServerId: this.installDetail.id,
          dbCharset: 'utf8'
        }
      }
    },
    addVnet() {
      this.vnetData = {
        dialog: true,
        data: {
          databaseServerId: this.installDetail.id,
          vendorId: this.installDetail.vendorId,
          regionId: this.installDetail.regionId,
          ignoreMissingVnetServiceEndpoint: true
        }
      }
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
    add() {
      this.$router.push({ name: 'ServiceAzureMysqlCreate' })
    },
    getList() {
      this.loading = true
      this.selectList = []
      getMysql(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    },
    getDetail(id) {
      detailMysql(id).then(data => {
        if (data.success) {
          this.installDetail = {
            ...data.data,
            edition: data.data.serviceLevelObjective.edition,
            detailEdition: data.data.serviceLevelObjective.uuid
          }
          this.getRule()
          this.getDatabase()
          this.getVnet()
          this.getLogs()
          this.getConnects()
          if (this.installDetail.isMaster) {
            this.getCopy()
          } else {
            this.getMaster()
          }
          this.getConfig()
          this.detailFlag = true
        }
      })
    },
    getConnects() {
      getConnects(this.installDetail.id).then(data => {
        if (data.success) {
          this.connectData = [
            ['连接服务器', this.installDetail.fullyQualifiedDomain],
            ['端口', '3306'],
            ['连接登录名', `${this.installDetail.administratorName}@${this.installDetail.name}`]
          ]
          this.connectData = this.connectData.concat(Object.entries(data.data))
          console.log(this.connectData)
        }
      })
    },
    getLogs() {
      this.logList = []
      getLogs(this.installDetail.id).then(data => {
        if (data.success) {
          this.logList = data.data
        }
      })
    },
    setConfigList(item) {
      let ary = []
      switch (item.dataType) {
        case 'Integer':
          ary = item.allowedValues.split('-')
          break
        case 'String':
          ary = ['']
          break
        case 'Set':
          ary = item.allowedValues.split(',').map(item1 => {
            return {
              name: item1,
              value: item1
            }
          })
          break
        case 'Enumeration':
          ary = item.allowedValues.split(',').map(item1 => {
            return {
              name: item1,
              value: item1
            }
          })
          break
        case 'Boolean':
          ary = item.allowedValues.split(',').map(item1 => {
            return {
              name: item1.replace(' ', '')
            }
          })
          break
      }
      return ary
    },
    setConfigValue(item) {
      let ary = null
      switch (item.dataType) {
        case 'Integer':
          ary = item.configurationValue
          break
        case 'String':
          ary = item.configurationValue
          break
        case 'Set':
          const list = item.configurationValue.split(',')
          ary = list[0] == '' ? [] : list
          break
        case 'Enumeration':
          ary = item.configurationValue
          break
        case 'Boolean':
          ary = item.configurationValue
          break
      }
      return ary
    },
    getConfig() {
      this.configList = []
      this.configParams.params = JSON.stringify([{ param: { databaseServerId: this.installDetail.id }, sign: 'EQ' }])
      getConfigurations(this.configParams).then(data => {
        if (data.success) {
          this.configList = data.data.rows.map(item => {
            return {
              ...item,
              configurationValue: this.setConfigValue(item),
              list: this.setConfigList(item)
            }
          })
          this.configTotal = data.data.total
        }
      })
    },
    getRule() {
      this.ruleList = []
      this.ruleParams.params = JSON.stringify([{ param: { databaseServerId: this.installDetail.id }, sign: 'EQ' }])
      getRule(this.ruleParams).then(data => {
        if (data.success) {
          this.ruleList = data.data.rows
          this.ruleTotal = data.data.total
        }
      })
    },
    getDatabase() {
      this.databaseList = []
      this.databaseParams.params = JSON.stringify([{ param: { databaseServerId: this.installDetail.id }, sign: 'EQ' }])
      getDatabase(this.databaseParams).then(data => {
        if (data.success) {
          this.databaseList = data.data.rows
          this.databaseTotal = data.data.total
        }
      })
    },
    getVnet() {
      this.vnetList = []
      this.vnetParams.params = JSON.stringify([{ param: { databaseServerId: this.installDetail.id }, sign: 'EQ' }])
      getVnet(this.vnetParams).then(data => {
        if (data.success) {
          this.vnetList = data.data.rows
          this.vnetTotal = data.data.total
        }
      })
    },
    getCopy() {
      this.copyList = []
      this.copyParams.params = JSON.stringify([{ param: { masterServerId: this.installDetail.id, isMaster: false }, sign: 'EQ' }])
      getMysql(this.copyParams).then(data => {
        if (data.success) {
          this.copyList = data.data.rows
          this.copyTotal = data.data.total
        }
      })
    },
    getMaster() {
      this.masterList = []
      this.masterParams.params = JSON.stringify([{ param: { id: this.installDetail.masterServerId, isMaster: true }, sign: 'EQ' }])
      getMysql(this.masterParams).then(data => {
        if (data.success) {
          this.masterList = data.data.rows
          this.masterTotal = data.data.total
        }
      })
    },
    goBack() {
      this.detailFlag = false
    },
    handleOperate(command) {
      switch (command.flag / 1) {
        case 5:
          this.handleDelete(command.imageUuid, command.id, command.azureResourceGroupName)
          break
      }
    },
    restart(data) {
      this.$confirm('该操作为不可逆操作，确定后将重启该mysql，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        putMysql('restart', { id: data.id }).then(data => {
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
    // 删除
    handleDelete(imageUuid, id, azureResourceGroupName) {
      this.$confirm('该操作为不可逆操作，确定后将永久删除该mysql，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeMysql(id).then(data => {
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
    remove(type, data) {
      this.$confirm('该操作为不可逆操作，确定后将永久删除该数据，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const remove = type == 'rule' ? removeRule : removeDatabase
        remove(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
          }
        })
      })
    },
    removeVnet(data) {
      this.$confirm('该操作为不可逆操作，确定后将永久删除该数据，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeVnet(data.id).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
          }
        })
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('azure') > -1) {
        this.getList()
        if (this.detailFlag) {
          this.getDetail(this.installDetail.id)
        }
      }
    }
  },
  mounted() {
    this.getList()
  },
  created() {
    if (this.$route.query.id) {
      this.getDetail(this.$route.query.id)
    }
  }
}
</script>

<style scoped></style>
