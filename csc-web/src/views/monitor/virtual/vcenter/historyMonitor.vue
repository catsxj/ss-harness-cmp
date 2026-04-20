<template>
  <div>
    <el-form :inline="true">
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
    <basic-table :data="tableData" :params="params" :get-list="getList" :total="total" @select="handleSelectItem" @select-all="handleSelectAll" ref="historyMonitorTable">
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
      <el-table-column label="告警触发时间" show-overflow-tooltip prop="gmtTrigger"></el-table-column>
      <el-table-column label="已持续时长" show-overflow-tooltip prop="duration"></el-table-column>
      <el-table-column label="确认人" prop="confirmer" show-overflow-tooltip></el-table-column>
      <el-table-column label="确认时间" prop="gmtConfirm" show-overflow-tooltip></el-table-column>
      <el-table-column label="操作" width="160px">
        <template slot-scope="scope">
          <el-button type="text" @click="handleConfirm(scope.row.id)" :disabled="scope.row.confirmed"> <Icon type="icon-ok"></Icon> 确认 </el-button>
        </template>
      </el-table-column>
    </basic-table>
    <common-detail-right v-if="detailFlag" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="告警名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="告警级别">
          <level-icon :color="detailData.level | alarmLevelColor">
            {{ detailData.level | alarmLevel }}
          </level-icon>
        </common-detail-item>
        <common-detail-item label="告警源">{{ detailData.targetName }}</common-detail-item>
        <common-detail-item label="资源类型">
          {{ detailData.type | resourceTypeMonitor }}<span v-if="detailData.type == 'VM'">({{ detailData.osCategory }}) </span>
        </common-detail-item>
        <common-detail-item label="告警状态">{{ detailData.status1 }}</common-detail-item>
        <common-detail-item label="告警内容">{{ detailData.remark }}</common-detail-item>
        <common-detail-item label="告警触发时间">{{ detailData.gmtTrigger }}</common-detail-item>
        <common-detail-item label="已持续时长">{{ detailData.duration }}</common-detail-item>
        <common-detail-item label="确认人">{{ detailData.confirmer }}</common-detail-item>
        <common-detail-item label="确认时间">{{ detailData.gmtConfirm }}</common-detail-item>
        <common-detail-item label="解决人">{{ detailData.solver }}</common-detail-item>
        <common-detail-item label="解决时间">{{ detailData.gmtSolve }}</common-detail-item>
        <common-detail-item label="解决详情">{{ detailData.dealResult }}</common-detail-item>
      </template>
    </common-detail-right>
  </div>
</template>

<script>
import { alarmLevel, alarmLevelColor, resourceType } from 'filters'
import { getAlarmList, getAlarmDetail, alarmConfirm } from 'services/monitor'
import levelIcon from 'views/monitor/components/statusIcon.vue'
const alarmLevelData = [
  { name: '提示告警', value: 'REMIND' },
  { name: '次要告警', value: 'SECONDARY' },
  { name: '重要告警', value: 'PRIMARY' },
  { name: '紧急告警', value: 'URGENT' }
]
export default {
  components: {
    levelIcon
  },
  props: {
    target: {
      type: Number
    },
    typeName: {
      type: String
    }
  },
  data() {
    return {
      alarmLevelData,
      id: '',
      listQuery: {
        level: '',
        date: ''
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
    this.id = this.$route.query.id
    this.handleSearch()
  },
  beforeDestroy() {},
  methods: {
    getList() {
      getAlarmList(this.params).then(data => {
        if (data.success) {
          this.tableData = data.data.rows
          this.total = data.data.total
          this.tableData.forEach(item => {
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.historyMonitorTable.$refs.basicTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    // 查询
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        target: this.target,
        type: this.typeName,
        level: this.listQuery.level,
        eventAlarm: 0,
        status: 'SOLVED',
        'gmtTrigger:RANGE': this.listQuery.date
      })
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
