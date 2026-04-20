<template>
  <el-card class="wrapper">
    <div v-if="!detailFlag">
      <el-form :inline="true">
        <el-form-item>
          <el-input placeholder="名称" v-model="listQuery.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total" @select="handleSelectItem" @select-all="handleSelectAll" ref="databaseTable">
        <el-table-column type="selection"></el-table-column>

        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.status === 'BUILDING'">{{ scope.row.name }}</span>
            <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" show-overflow-tooltip prop="version"> </el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | database }} </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="服务地址" show-overflow-tooltip prop="address"> </el-table-column>
        <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
        <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.expiredTime ? scope.row.expiredTime : '无期限' }}
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="操作" width="160px">
          <template slot-scope="scope">
            <el-button type="text" @click="alarmDetail(scope.row)">告警详情</el-button>
            <div class="action-divider"></div>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link"> 更多<i class="el-icon-arrow-down el-icon--right"></i> </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleLink(scope.row.id)"> 关联规则 </el-dropdown-item>
                <el-dropdown-item @click.native="handlePolicy(scope.row)">
                  {{ `${scope.row.alarmEnable ? '屏蔽' : '开启'}告警` }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <add-policy v-if="addFlag" :resourceType="resourceType" @cancle="cancle" :add-link-flag="addFlag" :resourceId="resourceId" :ruleGroupIds="ruleGroupIds"></add-policy>
  </el-card>
</template>

<script>
import { getRuleGroupBind } from 'services/monitor'
import { getKvs } from 'services/monitor/database'
import { handleStart } from '../data'
import addPolicy from 'views/monitor/components/linkPolicy'
export default {
  data() {
    return {
      handleStart,
      categoryFilter: {
        standalone: '单机',
        cluster: '集群'
      },
      list: null,
      total: null,
      listQuery: {
        name: ''
      },
      params: {
        page: 1,
        rows: 10,
        catalog: 'MONITOR_KVS_MONGODB'
      },
      idList: [],
      selectList: [],
      detailFlag: false,
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_KVS_MONGODB'
    }
  },
  components: {
    addPolicy
  },
  created() {
    this.handleSearch()
  },
  methods: {
    getList() {
      this.refreshId()
      getKvs(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
          this.list.forEach(item => {
            const self = this
            setTimeout(function () {
              if (self.idList.indexOf(item.id) > -1) self.$refs.databaseTable.$refs.basicTable.toggleRowSelection(item, true)
            })
          })
        }
      })
    },
    // 查询
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        'name:LK': this.listQuery.name,
        type: 'MongoDB',
        'status:UEQ': 'BUILDING'
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
        this.list.forEach(item => {
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
    refreshId() {
      this.idList = []
      this.selectList.forEach(item => {
        this.idList.push(item.id)
      })
    },
    alarmDetail(row) {
      this.$router.push({
        name: 'MonitorDatabaseDetail',
        query: { id: row.id, name: row.name, type: 'MONITOR_KVS_MONGODB' }
      })
    },
    handleLink(id) {
      this.ruleGroupIds = []
      this.resourceId = id
      getRuleGroupBind(id).then(data => {
        if (data.success) {
          this.ruleGroupIds = data.data
          this.addFlag = true
        }
      })
    },
    cancle() {
      this.addFlag = false
      this.getList()
    },
    handlePolicy(data) {
      this.handleStart(this, data, this.resourceType)
    },
    getDetail(id) {
      this.$router.push({ name: 'NosqlMongodbDetail', query: { id: id } })
    }
  }
}
</script>
<style scoped>
.search-item {
  width: 12%;
}
.rule-box {
  padding: 10px;
  padding-top: 0px;
  border: 1px solid #dcdfe6;
}
</style>
