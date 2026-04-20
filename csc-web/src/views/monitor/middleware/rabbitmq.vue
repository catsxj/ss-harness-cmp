<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="{ type: 'RabbitMQ' }" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detail.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | database }} </status-icon>
        </common-detail-item>
        <common-detail-item label="部署方式">{{ detail.category }}</common-detail-item>
        <common-detail-item label="配置">{{ detail.spec ? detail.spec : '--' }}</common-detail-item>
        <common-detail-item label="数据盘">{{ detail.dataDisk ? detail.dataDisk + 'GB' : '--' }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
        <common-detail-item label="过期时间">{{ detail.expiredTime ? detail.expiredTime : '无限期' }}</common-detail-item>
      </template>
      <detail :detail-id="detail.id" :detail="detail"></detail>
    </common-detail>
    <div>
      <el-form :inline="true">
        <el-form-item>
          <el-input class="search-item" placeholder="名称" v-model="listQuery.name"> </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="ghost" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total">
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="detail-href" @click="getDetail(scope.row.id)">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="版本" show-overflow-tooltip prop="version"> </el-table-column>
        <el-table-column label="状态" show-overflow-tooltip>
          <template slot-scope="scope">
            <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | openstackServer }} </status-icon>
          </template>
        </el-table-column>
        <el-table-column label="服务地址" show-overflow-tooltip prop="address"> </el-table-column>
        <el-table-column label="配置" show-overflow-tooltip prop="spec">
          <template slot-scope="scope">
            {{ scope.row.spec ? scope.row.spec : '--' }}
          </template>
        </el-table-column>
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
import webSocket from '@/common/mixins/getGlobalSocket'
import { vmStatusColor, openstackServer } from 'filters'
import { getRuleGroupBind } from 'services/monitor'
import { getCms, getCmsDetail } from 'services/monitor/middleware'
import detail from './rabbitmqDetail'
import { handleStart } from 'views/monitor/data'
import addPolicy from 'views/monitor/components/linkPolicy'
export default {
  components: { detail, addPolicy },
  mixins: [webSocket],
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
        catalog: 'MONITOR_CMS_RABBITMQ'
      },
      idList: [],
      selectList: [],
      detailFlag: false,
      detail: {},
      loading: false,
      addFlag: false,
      resourceId: 0,
      ruleGroupIds: [],
      resourceType: 'MONITOR_CMS_RABBITMQ'
    }
  },
  filters: {},
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  created() {
    this.handleSearch()
  },
  methods: {
    onmessage(data) {
      if (data.operate.indexOf('rabbitmq') > -1) {
        this.getList()
      }
    },
    goBack() {
      this.detailFlag = false
    },
    // 详情
    getDetail(id) {
      getCmsDetail(id).then(data => {
        if (data.success) {
          this.detail = data.data
          if (this.detail.spec) {
            this.detail.spec = JSON.parse(this.detail.spec)
            this.detail.dataDisk = this.detail.spec.dataDisk
            this.detail.spec = this.detail.spec.cpu + '核/' + this.detail.spec.memory + 'GB/' + this.detail.spec.disk + 'GB'
          }
          this.detail.category = this.categoryFilter[this.detail.category]
          this.detail.expiredTime = this.detail.expiredTime ? (this.detail.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detail.expiredTime) : this.detail.expiredTime
          this.detailFlag = true
        }
      })
    },
    getList() {
      getCms(this.params).then(data => {
        if (data.success) {
          this.list = data.data.rows
          this.total = data.data.total
        }
      })
    },
    handleSearch() {
      this.params.page = 1
      this.params.params = this.$tools.handleSearchParam({
        type: 'RabbitMQ',
        'name:LK': this.listQuery.name,
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
        name: 'MonitorMiddlewareDetail',
        query: { id: row.id, name: row.name, type: 'MONITOR_CMS_RABBITMQ' }
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
    }
  }
}
</script>
