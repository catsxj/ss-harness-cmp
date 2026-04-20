<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :setting="detailSetting" :data="detail" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | database }} </status-icon>
        </common-detail-item>
        <common-detail-item label="版本">{{ detail.version }}</common-detail-item>
        <common-detail-item label="部署类型">{{ detail.categoryName }}</common-detail-item>
        <common-detail-item label="配置" v-if="detail.tenantId">{{ detail.spec }}</common-detail-item>
        <common-detail-item label="数据盘">{{ detail.diskValue }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
        <common-detail-item label="过期时间" v-if="detail.tenantId">{{ detail.expiredTime }}</common-detail-item>
        <common-detail-item label="资源UUID">{{ detail.uuid }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel">{{ detail.projectName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.serviceConfigLabel">{{ detail.businessName }}</common-detail-item>
        <common-detail-item label="创建者">{{ detail.creatorName }}</common-detail-item>
        <common-detail-item label="所有者">{{ detail.ownerName }}</common-detail-item>
        <common-detail-item label="维护者">{{ detail.menderName }}</common-detail-item>
      </template>
      <el-tabs v-model="active" @tab-click="handleClick">
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
        <el-tab-pane label="Topics" name="1">
          <el-button class="m-b" type="ghost" @click="handlCreateTopic"> <Icon type="icon-Added"></Icon>新增 </el-button>
          <basic-table :data="topicsList" :params="topicsParams" :get-list="getTopicsList" :total="topicsTotal">
            <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
            <el-table-column prop="partitions" label="分区数" show-overflow-tooltip></el-table-column>
            <el-table-column prop="replicas" label="副本数" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" width="160px">
              <template slot-scope="scope">
                <el-button type="text" @click="createPartition(scope.row)">新增分区</el-button>
                <div class="action-divider"></div>
                <el-button type="text" @click="handleDeleteTopic(scope.row.id)"> <Icon type="icon-delete"></Icon>删除主题 </el-button>
              </template>
            </el-table-column>
          </basic-table>
          <!--新增界面-->
          <el-dialog title="新增Topic" :close-on-click-modal="false" v-if="addTopicVisible" :visible.sync="addTopicVisible" width="600px" append-to-body>
            <basic-form :model="addTopicData" ref="addTopicData">
              <basic-form-item label="名称：" prop="name" validate="required">
                <el-input v-model="addTopicData.name" auto-complete="off"></el-input>
              </basic-form-item>
              <basic-form-item label="分区数：" prop="partitions" validate="required,number">
                <el-input v-model.number="addTopicData.partitions" auto-complete="off"></el-input>
              </basic-form-item>
              <basic-form-item label="副本数：" prop="replicas" validate="required,number">
                <el-input-number style="width: 100%" :max="detail.nodes.length" v-model.number="addTopicData.replicas" auto-complete="off"></el-input-number>
              </basic-form-item>
            </basic-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="ghost" @click.native="addTopicVisible = false">取消</el-button>
              <el-button type="primary" :loading="loading" @click.native="addTopicSubmit">确定</el-button>
            </div>
          </el-dialog>
          <el-dialog title="新增分区" :close-on-click-modal="false" v-if="addPartitionVisible" :visible.sync="addPartitionVisible" width="600px" append-to-body>
            <basic-form :model="addPartitionData" ref="addPartitionData" label-width="130px">
              <basic-form-item label="Topic名称：" prop="name" validate="required">
                <el-input disabled v-model="addPartitionData.name" auto-complete="off"></el-input>
              </basic-form-item>
              <basic-form-item label="分区数：" prop="partitions" validate="required,number">
                <el-input v-model.number="addPartitionData.partitions" auto-complete="off"></el-input>
              </basic-form-item>
            </basic-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="ghost" @click.native="addPartitionVisible = false">取消</el-button>
              <el-button type="primary" @click.native="addPartitionSubmit">确定</el-button>
            </div>
          </el-dialog>
        </el-tab-pane>
        <!-- <el-tab-pane label="数据安全性" name="6">
          <FirewallItem :detail-data="detail" v-if="active == '6'"></FirewallItem>
        </el-tab-pane> -->
        <el-tab-pane label="备份与恢复" name="3" v-if="false">
          <copy :detail="detail" v-if="active == '3'"></copy>
        </el-tab-pane>
        <el-tab-pane label="日志管理" name="2">
          <log :detail-id="detail.id" v-if="active == '2'"></log>
        </el-tab-pane>
        <el-tab-pane label="中间件连接" name="connection">
          <DbConnect :connections="detail.connections"></DbConnect>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
    <div>
      <table-search :configs="searchConfigs" :onSearch="handleSearch" class="m-b">
        <template v-slot:operate>
          <router-link :to="{ name: 'ServiceKafkaCreate', params: { code: 'cms.kafka' } }">
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
        <el-table-column :label="$store.getters.systemConfig.projectConfigLabel" show-overflow-tooltip prop="projectName"> </el-table-column>
        <el-table-column :label="$store.getters.systemConfig.serviceConfigLabel" show-overflow-tooltip prop="businessName"> </el-table-column>
        <el-table-column label="创建者" show-overflow-tooltip prop="creatorName"> </el-table-column>
        <el-table-column label="所有者" show-overflow-tooltip prop="ownerName"> </el-table-column>
        <el-table-column label="维护者" prop="menderName" show-overflow-tooltip> </el-table-column>
        <el-table-column label="过期时间" prop="expiredTime" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.expiredTime ? (scope.row.expiredTime.indexOf('2099') > -1 ? '无限期' : scope.row.expiredTime) : scope.row.expiredTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <DelayService :data="scope.row" @getList="getList"> </DelayService>
            <UnsubscribeService url="cms" :data="scope.row" @getList="getList"> </UnsubscribeService>
            <modifySpec :detail="scope.row" service="cms.kafka"></modifySpec>
          </template>
        </el-table-column>
      </basic-table>
    </div>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import webSocket from '@/common/mixins/getGlobalSocket'
import { vmStatusColor, database } from 'filters'
import log from './log.vue'
import copy from './copy/index.vue'
import UnsubscribeService from '@/views/resource/vm/UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import modifySpec from '@/components/modifySpecs.vue'
import FirewallItem from './../datebase/firewall/index.vue'
import DbConnect from './../datebase/connection/index.vue'

import { getCms, getCmsDetail, getCmsTopics, createMqsTopics, removeMqsTopics, createTopicsPartitions, patchActionCmsNodes } from 'services/resource/middleware'
const detailSetting = {
  type: 'firewall',
  columns: [
    [
      { name: '名称', value: 'name' },
      { name: '版本', value: 'version' },
      { name: '当前状态', value: 'status', filter: database, icon: vmStatusColor }
    ],
    [
      { name: '配置', value: 'spec' },
      { name: '数据盘', value: 'diskValue' },
      { name: '类型', value: 'categoryName' }
    ],
    [
      { name: '创建时间', value: 'gmtCreate' },
      { name: '过期时间', value: 'expiredTime' }
    ]
  ]
}
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Input', label: 'UUID', value: 'uuid' },
  { type: 'Const', value: 'type', initValue: 'Kafka' },
  { type: 'Const', value: 'isRecycle', initValue: 0 }
]

export default {
  components: { log, copy, UnsubscribeService, DelayService, modifySpec, DbConnect },
  mixins: [webSocket],
  data() {
    return {
      searchConfigs,
      detailSetting,
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
      active: '0',
      topicsList: null,
      topicsTotal: null,
      topicsParams: {
        page: 1,
        rows: 10
      },
      addTopicVisible: false,
      addTopicData: {},
      addPartitionVisible: false,
      partitions: 0,
      addPartitionData: {},
      loading: false
    }
  },
  computed: {
    ...mapGetters(['userData', 'serviceIcon'])
  },
  created() {
    this.detailSetting.image = this.serviceIcon['cms.kafka']
  },
  methods: {
    confirm(tip, action, id) {
      this.$confirm('是否确认' + tip + '?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        patchActionCmsNodes(action, {
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
    elasticStoreIndent(data) {
      this.$router.push({
        name: 'datebaseIndent',
        query: { uuid: data.uuid }
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('volume') > -1 || data.operate.indexOf('kafka') > -1 || data.operate.indexOf('SoftwareInstall') > -1) {
        this.getList()
      }
      if (this.detailFlag && data.operate === 'resource.kafka') this.getTopicsList()
      if (data.operate.indexOf('change') > -1 && this.detailFlag) this.getDetail(this.detail)
    },
    goBack() {
      this.detailFlag = false
      this.getList()
    },
    handleClick() {
      switch (this.active) {
        case '0':
          this.getDetail(this.detail)
          break
        case '1':
          this.getTopicsList()
      }
    },
    // 详情
    getDetail(obj) {
      getCmsDetail(obj.id).then(data => {
        if (data.success) {
          this.detail = data.data
          this.detail.category = this.categoryFilter[this.detail.category]
          this.detail.expiredTime = this.detail.expiredTime ? (this.detail.expiredTime.indexOf('2099') > -1 ? '无限期' : this.detail.expiredTime) : this.detail.expiredTime
          this.detail.diskValue = this.detail.dataDisk ? `${this.detail.dataDisk}GB` : '--'
          if (this.detail.diskCategory) this.detail.diskValue = this.detail.diskValue + '(' + this.detail.diskCategory + ')'
          if (!this.detailFlag) this.active = '0'
          this.detailFlag = true
        }
      })
    },
    getTopicsList() {
      this.topicsParams.params = JSON.stringify([{ param: { mqId: this.detail.id }, sign: 'EQ' }])
      getCmsTopics(this.detail.id, this.topicsParams).then(data => {
        if (data.success) {
          this.topicsList = data.data.rows
          this.topicsTotal = data.data.total
        }
      })
    },
    handleDeleteTopic(id) {
      this.$confirm('您确定要删除该Topic吗?', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        removeMqsTopics({
          mqId: this.detail.id,
          topicId: id
        }).then(data => {
          if (data.success) {
            this.$message.success(data.message)
            this.getTopicsList()
          }
        })
      })
    },
    handlCreateTopic() {
      this.addTopicData = {
        mqId: this.detail.id
      }
      this.addTopicVisible = true
    },
    addTopicSubmit() {
      this.$refs.addTopicData.validate(valid => {
        if (valid) {
          this.loading = true
          createMqsTopics(this.addTopicData).then(data => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              this.addTopicVisible = false
              this.getTopicsList()
            }
            this.loading = false
          })
        }
      })
    },
    createPartition(row) {
      this.partitions = row.partitions
      this.addPartitionData = {
        mqId: this.detail.id,
        topicId: row.id,
        partitions: '',
        name: row.name
      }
      this.addPartitionVisible = true
    },
    addPartitionSubmit() {
      this.$refs.addPartitionData.validate(valid => {
        if (valid) {
          if (this.addPartitionData.partitions <= this.partitions) {
            return this.$message.error('分区数必须大于' + this.partitions)
          }
          createTopicsPartitions(this.addPartitionData).then(data => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              this.getTopicsList()
              this.addPartitionVisible = false
            }
          })
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
