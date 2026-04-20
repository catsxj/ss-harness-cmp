<template>
  <el-card class="wrapper">
    <table-search class="m-b" :configs="searchConfigs" :onSearch="handleSearch">
      <template v-slot:operate>
        <router-link :to="{ name: 'ServiceMySqlCreate', params: { code: 'rds.mysql' } }">
          <el-button type="primary">订购实例</el-button>
        </router-link>
      </template>
    </table-search>
    <basic-table :data="list" :params="params" :get-list="getList" :total="total">
      <el-table-column label="名称" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.status == 'BUILDING'">{{ scope.row.name }}</span>
          <span v-else class="detail-href" @click="goDetail(scope.row)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资源UUID" show-overflow-tooltip prop="uuid"> </el-table-column>
      <el-table-column label="版本" show-overflow-tooltip prop="version"> </el-table-column>
      <el-table-column label="状态" show-overflow-tooltip>
        <template slot-scope="scope">
          <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | database }} </status-icon>
        </template>
      </el-table-column>
      <el-table-column label="服务地址" show-overflow-tooltip prop="address"> </el-table-column>
      <el-table-column label="类型" show-overflow-tooltip prop="categoryName"> </el-table-column>
      <el-table-column label="配置" show-overflow-tooltip prop="spec">
        <template slot-scope="scope">
          <div>
            {{ scope.row.spec }}
          </div>
          <div>数据盘:{{ scope.row.dataDisk ? scope.row.dataDisk + 'GB' : '' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="gmtCreate" show-overflow-tooltip> </el-table-column>
      <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.expiredTime ? (scope.row.expiredTime.indexOf('2099') > -1 ? '无限期' : scope.row.expiredTime) : scope.row.expiredTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220px">
        <template slot-scope="scope">
          <DelayService :data="scope.row" @getList="getList"> </DelayService>
          <UnsubscribeService url="rds" :data="scope.row" @getList="getList"> </UnsubscribeService>
          <modifySpec :detail="scope.row" service="rds.mysql"></modifySpec>
        </template>
      </el-table-column>
    </basic-table>
    <common-detail v-if="detailFlag" :data="detail" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="版本">{{ detail.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | database }}</status-icon>
        </common-detail-item>
        <common-detail-item label="配置">{{ detail.spec }}</common-detail-item>
        <common-detail-item label="数据盘">{{ detail.diskValue }}</common-detail-item>
        <common-detail-item label="类型">{{ detail.categoryName }}</common-detail-item>
        <common-detail-item label="服务地址">{{ detail.address }}</common-detail-item>
        <common-detail-item label="资源UUID">{{ detail.uuid }}</common-detail-item>
        <common-detail-item label="过期时间">{{ detail.expiredTime }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs v-model="active">
        <el-tab-pane label="节点列表" name="0">
          <basic-table :data="detail.nodes">
            <el-table-column prop="address" label="IP" show-overflow-tooltip></el-table-column>
            <el-table-column prop="port" label="端口" show-overflow-tooltip></el-table-column>
            <el-table-column prop="role" label="角色" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.status | vmStatusColor">{{ scope.row.status | database }} </status-icon>
              </template>
            </el-table-column>
            <!-- <el-table-column label="操作" width="220px">
              <template slot-scope="scope">
                <el-button type="text" v-if="scope.row.status == 'STOPPED'" @click="confirm('开启服务', 'start', scope.row.id)">开启服务</el-button>
                <el-button type="text" v-if="scope.row.status == 'RUNNING'" @click="confirm('关闭服务', 'stop', scope.row.id)">关闭服务</el-button>
                <el-button type="text" @click="confirm('重启服务', 'restart', scope.row.id)">重启服务</el-button>
              </template>
            </el-table-column> -->
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="数据库列表" name="1">
          <dbs :detail="detail" v-if="active == '1'"></dbs>
        </el-tab-pane>
        <el-tab-pane label="用户列表" name="2">
          <user :detail="detail" v-if="active == '2'"></user>
        </el-tab-pane>
        <el-tab-pane label="备份与恢复" name="3" v-if="false">
          <copy :detail="detail" v-if="active == '3'" url="rds"></copy>
        </el-tab-pane>
        <el-tab-pane label="数据库连接" name="4">
          <join :detail="detail" v-if="active == '4'" url="rds"></join>
        </el-tab-pane>
        <!-- <el-tab-pane label="数据安全性" name="6">
          <FirewallItem :detail-data="detail" v-if="active == '6'"></FirewallItem>
        </el-tab-pane> -->
        <el-tab-pane label="参数设置" name="7">
          <argument :detail="detail" v-if="active == '7'" url="rds"></argument>
        </el-tab-pane>
        <el-tab-pane label="日志管理" name="8">
          <log :detail="detail" v-if="active == '8'" url="rds"></log>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import webSocket from '@/common/mixins/getGlobalSocket'
import { vmStatusColor, database, isTrue } from 'filters'
import { getRds, getRdsDetail, patchRds, patchActionRdsNodes } from 'services/resource/datebase'
import modifySpec from '@/components/modifySpecs.vue'
import dbs from './dbs/index.vue'
import user from './mysqlUser/index.vue'
import copy from './copy/index.vue'
import join from './join/index.vue'
// import group from './group/index'
import log from './log/audit.vue'
import argument from './argument/index.vue'
import UnsubscribeService from '@/views/resource/vm/UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Input', label: 'UUID', value: 'uuid' },
  { type: 'Const', value: 'type', initValue: 'MySQL' },
  { type: 'Const', value: 'isRecycle', initValue: 0 }
]
export default {
  components: { modifySpec, dbs, user, copy, join, log, argument, UnsubscribeService, DelayService },
  mixins: [webSocket],
  data() {
    return {
      searchConfigs,
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
        rows: 10
      },
      addDatatime: {},
      detailFlag: false,
      detail: {},
      active: '0'
    }
  },
  computed: {
    ...mapGetters(['userData', 'serviceIcon'])
  },
  methods: {
    confirm(tip, action, id) {
      this.$confirm('是否确认' + tip + '?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchActionRdsNodes(action, {
          id: id
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getDetail(this.detail)
            this.getList()
          }
        })
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('volume') > -1 || data.operate.indexOf('mysql') > -1 || data.operate.indexOf('change') > -1 || data.operate.indexOf('SoftwareInstall') > -1) {
        this.getList()
      }
      if (data.operate.indexOf('change') > -1 && this.detailFlag) this.getDetail(this.detail)
    },
    goBack() {
      this.detailFlag = false
      this.getList()
    },
    // 去详情界面
    goDetail(data) {
      this.active = '0'
      this.getDetail(data)
    },
    // 获取详情
    getDetail(obj) {
      getRdsDetail(obj.id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detail.category = this.categoryFilter[this.detail.category]
          this.detail.expiredTime = this.detail.expiredTime ? (this.detail.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detail.expiredTime) : this.detail.expiredTime
          this.detail.diskValue = this.detail.dataDisk ? `${this.detail.dataDisk}GB` : '--'
          if (this.detail.diskCategory) this.detail.diskValue = this.detail.diskValue + '(' + this.detail.diskCategory + ')'
          this.detailFlag = true
        }
      })
    },
    getList() {
      getRds(this.params).then(data => {
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
    }
  }
}
</script>
<style scoped>
.detail_icon {
  font-size: 25px;
  margin: 10px;
  color: #409eff;
}
</style>
