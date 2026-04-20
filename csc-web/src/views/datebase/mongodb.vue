<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="版本">{{ detail.version }}</common-detail-item>
        <common-detail-item label="当前状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | database }}</status-icon>
        </common-detail-item>
        <common-detail-item label="配置">{{ detail.spec }}</common-detail-item>
        <common-detail-item label="数据盘">{{ detail.diskValue }}</common-detail-item>
        <common-detail-item label="类型">{{ detail.categoryName }}</common-detail-item>
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
        <el-tab-pane label="用户管理" name="2">
          <basic-table :data="detail.users">
            <el-table-column prop="username" label="用户" show-overflow-tooltip></el-table-column>
            <el-table-column prop="status" label="状态" show-overflow-tooltip>
              <template> 正常 </template>
            </el-table-column>
            <el-table-column label="操作" width="230px">
              <template slot-scope="scope">
                <el-button type="text" @click="resetPassword(scope.row)"> 重置密码 </el-button>
              </template>
            </el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="备份与恢复" name="3" v-if="false">
          <copy :detail="detail" v-if="active == '3'" url="kvs"></copy>
        </el-tab-pane>
        <el-tab-pane label="数据库连接" name="4" v-if="false">
          <join :detail="detail" v-if="active == '4'"></join>
        </el-tab-pane>
        <!-- <el-tab-pane label="数据安全性" name="6">
          <FirewallItem :detail-data="detail" v-if="active == '6'"></FirewallItem>
        </el-tab-pane> -->
        <el-tab-pane label="参数设置" name="7">
          <argument :detail="detail" v-if="active == '7'" url="kvs"></argument>
        </el-tab-pane>
        <el-tab-pane label="日志管理" name="8">
          <log :detail="detail" v-if="active == '8'" url="kvs"></log>
        </el-tab-pane>
        <el-tab-pane label="数据库连接" name="connection">
          <DbConnect :connections="detail.connections"></DbConnect>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <div>
      <table-search :configs="searchConfigs" :onSearch="handleSearch" style="margin-bottom: 20px">
        <template v-slot:operate>
          <router-link :to="{ name: 'ServiceMongodbCreate' }">
            <el-button type="primary">订购实例</el-button>
          </router-link>
        </template>
      </table-search>
      <basic-table :data="list" :params="params" :get-list="getList" :total="total">
        <el-table-column label="名称" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.status == 'BUILDING'">{{ scope.row.name }}</span>
            <span v-else class="detail-href" @click="getDetail(scope.row)">{{ scope.row.name }}</span>
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
            <UnsubscribeService url="kvs" :data="scope.row" @getList="getList"> </UnsubscribeService>
            <modifySpec :detail="scope.row" service="kvs.mongodb"></modifySpec>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <resetPassword :add-data="resetPasswordData" v-if="resetPasswordData.dialog" @back="getList"></resetPassword>
  </el-card>
</template>

<script>
import webSocket from '@/common/mixins/getGlobalSocket'
import { getKvs, getKvsDetail, patchActionKvsNodes } from 'services/resource/datebase'
import copy from './copy/index.vue'
import join from './join/index.vue'
import log from './log/audit.vue'
import argument from './argument/index.vue'
import DbConnect from './connection/index.vue'
import modifySpec from '@/components/modifySpecs.vue'
import resetPassword from './mongodbUser/resetPassword.vue'
import UnsubscribeService from '@/views/resource/vm/UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import { mapGetters } from 'vuex'
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Const', value: 'type', initValue: 'MongoDB' },
  { type: 'Const', value: 'isRecycle', initValue: 0 }
]
export default {
  components: { resetPassword, copy, join, log, argument, modifySpec, UnsubscribeService, DelayService, DbConnect },
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
      active: 0,
      resetPasswordData: {
        dialog: false,
        data: {}
      }
    }
  },
  computed: {
    ...mapGetters(['userData', 'serviceIcon'])
  },
  methods: {
    resetPassword(data) {
      this.resetPasswordData = {
        dialog: true,
        data: {
          id: data.id
        }
      }
    },
    confirm(tip, action, id) {
      this.$confirm('是否确认' + tip + '?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchActionKvsNodes(action, {
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
      if (data.operate.indexOf('volume') > -1 || data.operate.indexOf('mongodb') > -1 || data.operate.indexOf('change') > -1 || data.operate.indexOf('SoftwareInstall') > -1) {
        this.getList()
      }
      if (data.operate.indexOf('change') > -1 && this.detailFlag) this.getDetail(this.detail)
    },
    goBack() {
      this.detailFlag = false
      this.getList()
    },
    // 详情
    getDetail(obj) {
      getKvsDetail(obj.id).then(data => {
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
      getKvs(this.params).then(data => {
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
