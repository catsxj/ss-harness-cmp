<template>
  <el-card class="wrapper-sm">
    <div>
      <el-form :inline="true">
        <!-- <el-form-item>
          <el-select  placeholder="资源类别" clearable v-model="listQuery.category" @change="changeCategory">
            <el-option v-for="(item, index) in MONITOR_CATEGORY" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select  placeholder="资源类型" clearable v-model="listQuery.type">
            <el-option v-for="(item, index) in typeData" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-select placeholder="资源类型" clearable v-model="listQuery.type">
            <el-option v-for="(item, index) in resourceList" :key="index" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input placeholder="告警源" v-model="listQuery.target"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-select placeholder="告警级别" clearable v-model="listQuery.level">
            <el-option v-for="item in alarmLevelData" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker v-model="listQuery.date" type="datetimerange" start-placeholder="开始时间" end-placeholder="结束时间" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm"> </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button type="ghost" @click="handleConfirm()" :disabled="!this.selectList.length"> 批量确认 </el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="tableData" :params="params" :get-list="getList" :total="total" @select="handleSelectItem" @select-all="handleSelectAll" ref="currentMonitorTable">
        <el-table-column type="selection"> </el-table-column>
        <el-table-column label="告警名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="告警级别" show-overflow-tooltip>
          <template slot-scope="scope">
            <level-icon :color="scope.row.level | alarmLevelColor">
              {{ scope.row.level | alarmLevel }}
            </level-icon>
          </template>
        </el-table-column>
        <el-table-column label="告警源" show-overflow-tooltip prop="targetName"></el-table-column>
        <el-table-column label="资源类型" show-overflow-tooltip prop="type">
          <template slot-scope="scope">
            {{ scope.row.type | resourceTypeMonitor }}<span v-if="scope.row.type == 'VM'">({{ scope.row.osCategory }})</span>
          </template>
        </el-table-column>
        <el-table-column label="告警状态" show-overflow-tooltip>
          <template slot-scope="scope"> {{ scope.row.confirmed ? '已确认' : '未确认' }}，{{ scope.row.solved ? '已清除' : '未清除' }} </template>
        </el-table-column>
        <!--<el-table-column label="告警状态" show-overflow-tooltip>-->
        <!--<template slot-scope="scope">-->
        <!--<status-icon :type="scope.row.status | alarmStatusColor">-->
        <!--{{scope.row.status | alarmStatus}}-->
        <!--</status-icon>-->
        <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column label="告警内容" show-overflow-tooltip prop="remark"></el-table-column>
        <el-table-column label="产生时间" show-overflow-tooltip prop="gmtCreate"></el-table-column>
        <el-table-column label="已持续时长" show-overflow-tooltip prop="duration"></el-table-column>
        <el-table-column label="确认人" prop="confirmer" show-overflow-tooltip></el-table-column>
        <el-table-column label="确认时间" prop="gmtConfirm" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="160px">
          <template slot-scope="scope">
            <el-button type="text" @click="handleConfirm(scope.row.id)" :disabled="scope.row.confirmed"> <Icon type="icon-ok"></Icon> 确认 </el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <common-detail-right v-if="detailFlag" :setting="{ type: 'host' }" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="告警名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="告警级别">
          <level-icon :color="detailData.level | alarmLevelColor">{{ detailData.level | alarmLevel }} </level-icon>
        </common-detail-item>
        <common-detail-item label="告警源">{{ detailData.targetName }}</common-detail-item>
        <common-detail-item label="资源类型">{{ detailData.type | resourceTypeMonitor }}</common-detail-item>
        <common-detail-item label="告警状态">{{ detailData.status1 }}</common-detail-item>
        <common-detail-item label="告警内容">{{ detailData.remark }}</common-detail-item>
        <common-detail-item label="告警恢复值">{{ detailData.recoveryVal }}</common-detail-item>
        <common-detail-item label="告警触发时间">{{ detailData.gmtTrigger }}</common-detail-item>
        <common-detail-item label="已持续时长">{{ detailData.duration }}</common-detail-item>
        <common-detail-item label="确认人">{{ detailData.confirmer }}</common-detail-item>
        <common-detail-item label="确认时间">{{ detailData.gmtConfirm }}</common-detail-item>
        <common-detail-item label="解决人">{{ detailData.solver }}</common-detail-item>
        <common-detail-item label="解决时间">{{ detailData.gmtSolve }}</common-detail-item>
        <common-detail-item label="解决详情">{{ detailData.dealResult }}</common-detail-item>
      </template>
    </common-detail-right>
  </el-card>
</template>

<script>
import levelIcon from 'views/monitor/components/statusIcon.vue'
import { getAlarmList, getAlarmDetail, alarmConfirm } from 'services/monitor'
import { getResourceList } from 'services/platform/index'
// import { resourceList } from '@/views/monitor/data'
const statusData = [
  { name: '未确认', value: 'UNCONFIRMED' },
  { name: '已确认', value: 'CONFIRMED' }
]
const alarmLevelData = [
  { name: '提示告警', value: 'REMIND' },
  { name: '次要告警', value: 'SECONDARY' },
  { name: '重要告警', value: 'PRIMARY' },
  { name: '紧急告警', value: 'URGENT' }
]
export default {
  components: { levelIcon },
  data() {
    return {
      resourceList: [],
      statusData,
      alarmLevelData,
      MONITOR_CATEGORY: [
        { name: 'vCenter', value: 'MONITOR_VCENTER' },
        { name: 'OpenStack', value: 'MONITOR_OPENSTACK' },
        { name: 'ManageOne', value: 'MONITOR_FUSIONCLOUD' },
        { name: '阿里云', value: 'MONITOR_ALIYUN' },
        { name: '关系型数据库', value: 'MONITOR_RDS' },
        { name: 'NoSQL数据库', value: 'MONITOR_KVS' },
        { name: '消息队列', value: 'MONITOR_CMS' },
        { name: '配置中心', value: 'MONITOR_CCS' }
      ],
      resourceTypeMap: {
        MONITOR_VCENTER: [
          {
            name: '云主机',
            value: 'MONITOR_VCENTER_VM'
          }
        ],
        MONITOR_OPENSTACK: [
          {
            name: '云主机',
            value: 'MONITOR_OPENSTACK_VM'
          }
        ],
        MONITOR_FUSIONCLOUD: [
          {
            name: '云主机',
            value: 'MONITOR_FUSIONCLOUD_VM'
          }
        ],
        MONITOR_ALIYUN: [
          {
            name: '云主机',
            value: 'MONITOR_ALIYUN_VM'
          }
        ],
        MONITOR_RDS: [
          {
            name: '云数据库（MySQL）',
            value: 'MONITOR_RDS_MYSQL'
          },
          {
            name: '云数据库（SQL Server）',
            value: 'MONITOR_RDS_SQLSERVER'
          },
          {
            name: '云数据库（PostGreSQL）',
            value: 'MONITOR_RDS_POSTGRESQL'
          }
        ],
        MONITOR_KVS: [
          {
            name: '云数据库（Redis）',
            value: 'MONITOR_KVS_REDIS'
          },
          {
            name: '云数据库（Mongodb）',
            value: 'MONITOR_KVS_MONGODB'
          },
          {
            name: '云数据库（MemCached）',
            value: 'MONITOR_KVS_MEMCACHED'
          }
        ],
        MONITOR_CMS: [
          {
            name: '消息队列（Kafka）',
            value: 'MONITOR_CMS_KAFKA'
          },
          {
            name: '消息队列（RabbitMQ）',
            value: 'MONITOR_CMS_RABBITMQ'
          }
        ],
        MONITOR_CCS: [
          {
            name: '配置中心（Zookeeper）',
            value: 'MONITOR_CCS_ZOOKEEPER'
          },
          {
            name: '配置中心（Etcd）',
            value: 'MONITOR_CCS_ETCD'
          }
        ]
      },
      typeData: [],
      listQuery: {
        category: '',
        target: '',
        level: '',
        date: '',
        type: ''
      },
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      tableData: [],
      idList: [],
      selectList: [],
      detailFlag: false,
      detailData: {}
    }
  },
  created() {
    this.handleSearch()
    this.changeCategory()
    this.getResources()
  },
  beforeDestroy() {},
  methods: {
    getResources() {
      getResourceList().then(({ data, success }) => {
        if (success) {
          this.resourceList = data.rows.map(item => ({ ...item, value: item.resourceType }))
        }
      })
    },
    changeCategory(value) {
      this.listQuery.type = ''
      this.typeData = this.resourceTypeMap[value]
    },
    getList() {
      getAlarmList(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
          this.tableData.forEach(item => {
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.currentMonitorTable.$refs.basicTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    // 查询
    handleSearch() {
      let types = []
      if (this.listQuery.category == 'MONITOR_VCENTER') {
        types = ['MONITOR_VCENTER_VM']
      } else if (this.listQuery.category == 'MONITOR_RDS') {
        types = ['MONITOR_RDS_MYSQL', 'MONITOR_RDS_SQLSERVER', 'MONITOR_RDS_POSTGRESQL']
      } else if (this.listQuery.category == 'MONITOR_KVS') {
        types = ['MONITOR_KVS_REDIS', 'MONITOR_KVS_MONGODB', 'MONITOR_KVS_MEMCACHED']
      } else if (this.listQuery.category == 'MONITOR_CMS') {
        types = ['MONITOR_CMS_KAFKA', 'MONITOR_CMS_RABBITMQ']
      } else if (this.listQuery.category == 'MONITOR_OPENSTACK') {
        types = ['MONITOR_OPENSTACK_VM']
      } else if (this.listQuery.category == 'MONITOR_FUSIONCLOUD') {
        types = ['MONITOR_FUSIONCLOUD_VM']
      } else if (this.listQuery.category == 'MONITOR_ALIYUN') {
        types = ['MONITOR_ALIYUN_VM']
      } else if (this.listQuery.category == 'MONITOR_CCS') {
        types = ['MONITOR_CCS_ZOOKEEPER', 'MONITOR_CCS_ETCD']
      }
      if (this.listQuery.type && this.listQuery.category) {
        types = ''
      }
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        status: 'SOLVED',
        level: this.listQuery.level || '',
        type: this.listQuery.type || '',
        eventAlarm: 0,
        'targetName:LK': this.listQuery.target,
        'gmtTrigger:RANGE': this.listQuery.date
      })
      if (types) {
        const params = { param: { types: types }, sign: 'EQ' }
        this.params.params = JSON.parse(this.params.params)
        this.params.params.push(params)
        this.params.params = JSON.stringify(this.params.params)
      }
      this.getList()
    },
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
    handleSelectAll(selection) {
      this.refreshId()
      if (selection.length) {
        // 全选情况下
        this.tableData.forEach(item => {
          if (this.idList.indexOf(item.id) == -1) {
            this.selectList.push(item)
          }
        })
      } else {
        // 全不选情况下
        this.tableData.forEach(item => {
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
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    handleConfirm(id) {
      this.refreshId()
      let list = []
      if (id) {
        list.push(id)
      } else {
        list = this.idList
      }
      this.$confirm('确定要确认告警吗?', '提示', {
        confirmButtonText: '确认',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      })
        .then(() => {
          alarmConfirm({
            ids: list
          }).then(data => {
            if (data.success) {
              this.$message.success({
                message: data.message
              })
              this.getList()
            }
          })
        })
        .catch(() => {})
    },
    getDetail(id) {
      getAlarmDetail(id).then(data => {
        if (data.success) {
          this.detailData = data.data
          let str1, str2
          if (this.detailData.confirmed) {
            str1 = '已确认'
          } else {
            str1 = '未确认'
          }
          if (this.detailData.solved) {
            str2 = '已清除'
          } else {
            str2 = '未清除'
          }
          this.detailData.status1 = str1 + '，' + str2
          this.detailFlag = true
        }
      })
    },
    goBack() {
      this.detailFlag = false
    }
  }
}
</script>
<style scoped></style>
