<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="{ type: 'host' }" :title="installDetail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ installDetail.name }}</common-detail-item>
        <common-detail-item label="资源组">{{ installDetail.resourceGroupName }}</common-detail-item>
        <common-detail-item label="区域">{{ installDetail.regionName }}</common-detail-item>
        <common-detail-item label="TLS 版本">{{ installDetail.minimumTlsVersion }}</common-detail-item>
        <common-detail-item label="是否允许访问此服务器的公共网络">{{ installDetail.publicNetworkAccess | booleanFilter }}</common-detail-item>
        <common-detail-item label="规格">{{ filter[installDetail.skuName] + '   ' + installDetail.skuFamily + installDetail.skuCapacity }}</common-detail-item>
        <common-detail-item label="标签">{{ installDetail.tags }}</common-detail-item>
      </template>
      <el-tabs v-model="active">
        <el-tab-pane label="防火墙" name="0">
          <el-form :inline="true">
            <el-form-item>
              <el-button type="primary" @click="addRule" :disabled="installDetail.locked">
                <Icon type="icon-add"></Icon>
                新增
              </el-button>
            </el-form-item>
          </el-form>
          <basic-table :data="ruleList" :params="ruleParams" :get-list="getRedisRule" :total="ruleTotal" class="m-t-md">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="startIp" label="起始 IP 地址" show-overflow-tooltip></el-table-column>
            <el-table-column prop="endIp" label="结束 IP 地址" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="操作">
              <template slot-scope="scope">
                <el-button type="text" @click="remove('rule', scope.row)" :disabled="installDetail.locked">删除</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="属性" name="property">
          <div v-for="(item, index) in propertyData" :key="index" class="m-t-md">
            <div>
              {{ item[0] }}
            </div>
            <div class="m-t-xs">
              <el-row :gutter="20">
                <el-col :span="20">
                  <el-input v-model="item[1]" readonly :id="`property${index}`"></el-input>
                </el-col>
                <el-col :span="4">
                  <el-button type="text" @click="copy('property', index)">复制</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="虚拟网络" name="vpc" v-if="installDetail.staticIp">
          <div v-for="(item, index) in vpcData" :key="index" class="m-t-md">
            <div>
              {{ item[0] }}
            </div>
            <div class="m-t-xs">
              <el-row :gutter="20">
                <el-col :span="20">
                  <el-input v-model="item[1]" readonly :id="`vpc${index}`"></el-input>
                </el-col>
                <el-col :span="4">
                  <el-button type="text" @click="copy('vpc', index)">复制</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="访问密钥" name="key">
          <el-form :inline="true">
            <el-form-item>
              <el-button type="primary" @click="regenerateKey('Primary')" :disabled="installDetail.locked">重新生成主密钥</el-button>
              <el-button type="primary" @click="regenerateKey('Secondary')" :disabled="installDetail.locked">重新生成辅助密钥</el-button>
            </el-form-item>
          </el-form>
          <div v-for="(item, index) in connectData" :key="index" class="m-t-md">
            <div>
              {{ item[0] }}
            </div>
            <div class="m-t-xs">
              <el-row :gutter="20">
                <el-col :span="20">
                  <el-input v-model="item[1]" readonly :id="`key${index}`"></el-input>
                </el-col>
                <el-col :span="4">
                  <el-button type="text" @click="copy('key', index)">复制</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="监控" name="monitor">
          <monitor :detail="installDetail" v-if="active == 'monitor'"></monitor>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <AdvanceTable :card-border="false" :search-configs="searchConfigs" ref="multipleTable" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @select="handleSelectItem" @select-all="handleSelectAll">
      <template v-slot:action>
        <el-button type="primary" @click="add"> 新增 </el-button>
        <el-button type="ghost" icon="el-icon-delete" @click="handleDeletes" :disabled="selectList.length == 0"> 删除 </el-button>
      </template>
      <template #account="val, record">
        <span v-if="record.status == 'BUILDING'">{{ record.name }}</span>
        <span v-else class="detail-href" @click="getDetail(record.id)">{{ record.name }}</span>
      </template>
      <template #status="status">
        <status-icon :color="status | mysqlStatusColor">{{ status | mysqlStatus }} </status-icon>
      </template>
      <template #operate="val, record">
        <lock :data="record" type="CloudRedis">
          <div class="action-divider"></div>
          <el-button type="text" @click="handleOperate({ flag: 5, imageUuid: record.imageUuid, id: record.id, azureResourceGroupName: record.azureResourceGroupName })"> 删除 </el-button>
          <div class="action-divider"></div>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link"> 更多操作<i class="el-icon-arrow-down el-icon--right"></i> </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="record.shardCount" :disabled="record.isAllDisabeld" @click.native="shardCount(record)"> 群集大小 </el-dropdown-item>
              <el-dropdown-item :disabled="record.isAllDisabeld" @click.native="setting(record)"> 高级设置 </el-dropdown-item>
              <el-dropdown-item :disabled="record.isAllDisabeld" @click.native="modifySet(record)"> 调整配置 </el-dropdown-item>
              <el-dropdown-item :disabled="record.isAllDisabeld" @click.native="setTags(record)"> 分配标签 </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </lock>
      </template>
    </AdvanceTable>
    <rule :add-data="ruleData" v-if="ruleData.dialog" @back="getRedisRule"></rule>
    <pas :add-data="pasData" v-if="pasData.dialog" @back="getList"></pas>
    <shard :add-data="shardData" v-if="shardData.dialog" @back="getList"></shard>
    <setting :add-data="settingData" v-if="settingData.dialog" @back="getList"></setting>
    <modify-set :add-data="setData" v-if="setData.dialog" @back="getList"></modify-set>
    <tags :add-data="tagData" v-if="tagData.dialog" @back="getList"></tags>
  </el-card>
</template>
<script>
import { getRedis, removeRedis, detailRedis, getRedisRule, removeRedisRule, removeDatabase, putRedis, removeRediss } from 'services/platform/azure'
import { booleanFilter } from 'filters'
import shard from './shard'
import setting from './setting'
import rule from './addRule'
import monitor from './monitor'
import pas from './modifyPas'
import modifySet from './modifySet'
import tags from '@/components/tag/index.vue'
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
      { name: 'TLS 版本', value: 'minimumTlsVersion' },
      { name: '是否允许访问此服务器的公共网络', value: 'publicNetworkAccess', filter: booleanFilter },
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
    label: 'TLS 版本',
    prop: 'minimumTlsVersion'
  },
  {
    label: '资源组',
    prop: 'resourceGroupName'
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
  components: { rule, monitor, pas, shard, setting, lock, modifySet, tags },
  data() {
    return {
      searchConfigs,
      columns,
      filter: {
        Basic: '基本',
        Standard: '标准',
        Premium: '高级'
      },
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      detailSetting,
      searchName: '',
      list: [],
      total: 0,
      detailFlag: false,
      installDetail: {},
      addData: {
        dialog: false,
        data: {}
      },
      assignData: {
        dialog: false,
        data: {}
      },
      assignsDialog: {
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
      configTotal: 0,
      ruleData: {
        dialog: false,
        data: {}
      },
      active: 0,
      pasData: {
        dialog: false,
        data: {}
      },
      connectData: [],
      propertyData: [],
      vpiData: [],
      shardData: {
        dialog: false,
        data: {}
      },
      settingData: {
        dialog: false,
        data: {}
      },
      setData: {
        dialog: false,
        data: {}
      },
      tagData: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
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
          action: 'REDIS',
          tags: tags
        }
      }
    },
    modifySet(data) {
      this.setData = {
        dialog: true,
        data: {
          id: data.id,
          skuName: data.skuName,
          skuFamily: data.skuFamily,
          skuCapacity: data.skuCapacity
        }
      }
    },
    shardCount(data) {
      this.shardData = {
        dialog: true,
        data: {
          id: data.id,
          shardCount: data.shardCount
        }
      }
    },
    setting(data) {
      this.settingData = {
        dialog: true,
        staticIp: data.staticIp,
        data: {
          id: data.id,
          enableNonSslPort: data.enableNonSslPort,
          minimumTlsVersion: data.minimumTlsVersion,
          publicNetworkAccess: data.publicNetworkAccess == 'Enabled',
          maxmemoryReserved: data.maxmemoryReserved,
          maxfragmentationmemoryReserved: data.maxfragmentationmemoryReserved,
          maxmemoryPolicy: 'volatile-lru'
        }
      }
    },
    regenerateKey(action) {
      putRedis('regenerateKey', { id: this.installDetail.id, keyType: action }).then(data => {
        if (data.success) {
          this.$message({
            type: 'success',
            message: data.message
          })
          this.getDetail(this.installDetail.id)
        }
      })
    },
    modifyPas(data) {
      this.pasData = {
        dialog: true,
        data: {
          id: data.id
        }
      }
    },
    handleDeletes() {
      this.refreshId()
      const list = this.idList
      if (list.length == 0) return this.$message.error('请选择Redis')
      this.$confirm('此操作将删除所选Redis, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRediss({ ids: list }).then(data => {
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
    addRule() {
      this.ruleData = {
        dialog: true,
        data: {
          redisId: this.installDetail.id
        }
      }
    },
    selectable(row, index) {
      if (row.projectId) {
        return false
      } else {
        return true
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
      this.$router.push({ name: 'ServiceAzureRedisCreate' })
    },
    getList() {
      this.loading = true
      this.selectList = []
      getRedis(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
        this.loading = false
      })
    },
    copy(id, index) {
      const input = document.getElementById(`${id}${index}`)
      input.select()
      document.execCommand('copy')
      this.$message.success('复制成功!')
    },
    getDetail(id) {
      if (!this.detailFlag) this.active = '0'
      detailRedis(id).then(data => {
        if (data.success) {
          this.installDetail = {
            ...data.data
          }
          this.connectData = [
            ['主要', data.data.primaryKey],
            ['辅助', data.data.secondaryKey],
            ['主连接字符串(StackExchange.Redis)', data.data.primaryConnectionString],
            ['辅助连接字符串(StackExchange.Redis)', data.data.secondaryConnectionString]
          ]
          this.propertyData = [
            ['主机名称', data.data.hostName],
            ['非SSL端口', data.data.port],
            ['SSL端口', data.data.sslPort],
            ['资源ID', data.data.uuid]
          ]
          this.vpcData = [
            ['VPC', data.data.vpcName],
            ['子网', data.data.subnetName],
            ['IP地址', data.data.staticIp],
            ['主机名称', data.data.hostName]
          ]
          this.getRedisRule()
          this.detailFlag = true
        }
      })
    },
    getRedisRule() {
      this.ruleList = []
      this.ruleParams.params = JSON.stringify([{ param: { redisId: this.installDetail.id }, sign: 'EQ' }])
      getRedisRule(this.ruleParams).then(data => {
        if (data.success) {
          this.ruleList = data.data.rows
          this.ruleTotal = data.data.total
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
      this.$confirm('该操作为不可逆操作，确定后将重启该Redis，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        putRedis('restart', { id: data.id }).then(data => {
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
      this.$confirm('该操作为不可逆操作，确定后将永久删除该Redis，是否继续！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeRedis(id).then(data => {
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
        const remove = type == 'rule' ? removeRedisRule : removeDatabase
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
