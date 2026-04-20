<template>
  <el-card class="wrapper">
    <common-detail v-if="detailFlag" :title="detail.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detail.name }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="detail.status | vmStatusColor">{{ detail.status | database }} </status-icon>
        </common-detail-item>
        <common-detail-item label="版本">{{ detail.version }}</common-detail-item>
        <common-detail-item label="部署类型">{{ detail.categoryName }}</common-detail-item>
        <common-detail-item label="配置" v-if="detail.tenantId">{{ detail.spec }}</common-detail-item>
        <common-detail-item label="数据盘">{{ detail.diskValue }}</common-detail-item>
        <common-detail-item label="资源UUID">{{ detail.uuid }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.projectConfigLabel">{{ detail.projectName }}</common-detail-item>
        <common-detail-item :label="$store.getters.systemConfig.serviceConfigLabel">{{ detail.businessName }}</common-detail-item>
        <common-detail-item label="创建者">{{ detail.creatorName }}</common-detail-item>
        <common-detail-item label="所有者">{{ detail.ownerName }}</common-detail-item>
        <common-detail-item label="维护者">{{ detail.menderName }}</common-detail-item>
        <common-detail-item label="过期时间" v-if="detail.tenantId">{{ detail.expiredTime }}</common-detail-item>
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
        <el-tab-pane label="Connections" name="7">
          <basic-table :data="connectionsList" :params="connectionsParams" :get-list="getConnections" :total="connectionsTotal">
            <el-table-column prop="vhost" label="Virtual host" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="Name" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="detail-href" @click="getConnectionDetail(scope.row.name)">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="user" label="User Name" show-overflow-tooltip></el-table-column>
            <el-table-column prop="state" label="State" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.state | stateFliter('color')">{{ scope.row.state | stateFliter('status') }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column prop="ssl" label="SSL / TLS" show-overflow-tooltip>
              <template slot-scope="scope">{{ JSON.stringify(scope.row.ssl) }}</template>
            </el-table-column>
            <el-table-column prop="protocol" label="Protocol" show-overflow-tooltip></el-table-column>
            <el-table-column prop="channels" label="Channels" show-overflow-tooltip></el-table-column>
            <el-table-column prop="fromClient" label="From client" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.fromClient || scope.row.fromClient == 0">{{ scope.row.fromClient }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="toClient" label="To client" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.toClient || scope.row.toClient == 0">{{ scope.row.toClient }}B/s</span></template
              >
            </el-table-column>
            <el-table-column label="操作" width="160px">
              <template slot-scope="scope">
                <el-button type="text" @click="closeConnection(scope.row.name)">关闭连接</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="Channels" name="1">
          <basic-table :data="channelsList" :params="channelsParams" :get-list="getChannels" :total="channelsTotal">
            <el-table-column prop="name" label="Channel" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="detail-href" @click="getChannelDetail(scope.row.name)">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="user" label="User name" show-overflow-tooltip></el-table-column>
            <el-table-column prop="mode" label="Mode" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tooltip v-if="scope.row.confirm" class="item" effect="light" content="confirm: true" placement="top-end"><span>C </span> </el-tooltip>
                <el-tooltip v-if="scope.row.transactional" class="item" effect="light" content="transactional: true" placement="top-end"><span>T </span> </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="State" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.state | stateFliter('color')">{{ scope.row.state | stateFliter('status') }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column prop="messages_unconfirmed" label="Unconfirmed" show-overflow-tooltip></el-table-column>
            <el-table-column prop="prefetch_count" label="Prefetch" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.prefetch_count && scope.row.prefetch_count != 0">{{ scope.row.prefetch_count }}</span></template
              >
            </el-table-column>
            <el-table-column prop="messages_unacknowledged" label="Unacked" show-overflow-tooltip></el-table-column>
            <el-table-column prop="publishRates" label="publish" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.publishRates || scope.row.publishRates == 0">{{ scope.row.publishRates }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="confirmRates" label="confirm" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.confirmRates || scope.row.confirmRates == 0">{{ scope.row.confirmRates }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="deliverGetRates" label="deliver / get" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.deliverGetRates || scope.row.deliverGetRates == 0">{{ scope.row.deliverGetRates }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="ackRates" label="ack" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.ackRates || scope.row.ackRates == 0">{{ scope.row.ackRates }}B/s</span></template
              >
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="Exchanges" name="2">
          <basic-table :data="exchangesList" :params="exchangesParams" :get-list="getExchanges" :total="exchangesTotal">
            <el-table-column prop="vhost" label="Virtual host" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="Name" show-overflow-tooltip> </el-table-column>
            <el-table-column prop="type" label="Type" show-overflow-tooltip></el-table-column>
            <el-table-column label="Features" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tooltip v-if="scope.row.internal" class="item" effect="light" content="internal: true" placement="top-end"><span>I </span> </el-tooltip>
                <el-tooltip v-if="scope.row.durable" class="item" effect="light" content="durable: true" placement="top-end"><span>D </span> </el-tooltip>
                <el-tooltip v-if="scope.row.autoDelete" class="item" effect="light" content="auto-delete: true" placement="top-end"><span>AD </span> </el-tooltip>
                <el-tooltip v-if="scope.row.arguments['x-ha-policy']" class="item" effect="light" placement="top-end">
                  <div slot="content">
                    <span v-for="(item, key) in scope.row.arguments" :key="key">{{ key }}: {{ item }}<br /></span>
                  </div>
                  <span>Args</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="publishInRate" label="Message rate in" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.publishInRate || scope.row.publishInRate == 0">{{ scope.row.publishInRate }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="publishOutRate" label="Message rate out" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.publishOutRate || scope.row.publishOutRate == 0">{{ scope.row.publishOutRate }}B/s</span></template
              >
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="Queues" name="3">
          <basic-table :data="queuesList" :params="queuesParams" :get-list="getQueues" :total="queuesTotal">
            <el-table-column prop="vhost" label="Virtual host" show-overflow-tooltip></el-table-column>
            <el-table-column prop="name" label="Name" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="detail-href" @click="getQueueDetail(scope.row.vhost, scope.row.name)">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="features" label="Features" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tooltip v-if="scope.row.internal" class="item" effect="light" content="internal: true" placement="top-end"><span>I </span> </el-tooltip>
                <el-tooltip v-if="scope.row.durable" class="item" effect="light" content="durable: true" placement="top-end"><span>D </span> </el-tooltip>
                <el-tooltip v-if="scope.row.autoDelete" class="item" effect="light" content="auto-delete: true" placement="top-end"><span>AD </span> </el-tooltip>
                <el-tooltip v-if="scope.row.arguments['x-ha-policy']" class="item" effect="light" placement="top-end">
                  <div slot="content">
                    <span v-for="(item, key) in scope.row.arguments" :key="key">{{ key }}: {{ item }}<br /></span>
                  </div>
                  <span>Args</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column prop="state" label="State" show-overflow-tooltip>
              <template slot-scope="scope">
                <status-icon :type="scope.row.state | stateFliter('color')">{{ scope.row.state | stateFliter('status') }} </status-icon>
              </template>
            </el-table-column>
            <el-table-column prop="messages_ready" label="Ready" show-overflow-tooltip></el-table-column>
            <el-table-column prop="messages_unacknowledged" label="Unacked" show-overflow-tooltip></el-table-column>
            <el-table-column prop="messages" label="Total" show-overflow-tooltip></el-table-column>
            <el-table-column prop="publishInRate" label="incoming" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.publishInRate || scope.row.publishInRate == 0">{{ scope.row.publishInRate }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="deliverGetRate" label="deliver / get" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.deliverGetRate || scope.row.deliverGetRate == 0">{{ scope.row.deliverGetRate }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="ackRate" label="ack" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.ackRate || scope.row.ackRate == 0">{{ scope.row.ackRate }}B/s</span></template
              >
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="Users" name="4">
          <el-button class="m-b-md" type="primary" @click="addDetailUser">新增</el-button>
          <basic-table :data="usersList" :params="usersParams" :get-list="getUsers" :total="usersTotal">
            <el-table-column prop="name" label="Name" show-overflow-tooltip></el-table-column>
            <el-table-column prop="tags" label="Tags" show-overflow-tooltip></el-table-column>
            <el-table-column prop="vhost" label="Can access virtual hosts" show-overflow-tooltip>
              <template v-slot="scope">
                {{ scope.row.vhost === 'null' ? 'No access' : scope.row.vhost }}
              </template>
            </el-table-column>
            <el-table-column prop="passwordHash" label="Has password" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="text-success" :class="{ 'el-icon-check': !!scope.row.passwordHash }"></i>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220px">
              <template slot-scope="scope">
                <el-button type="text" @click="modifyUser(scope.row)">编辑</el-button>
                <el-button type="text" @click="removeUser(scope.row)" :disabled="scope.row.name === 'zeus'">删除</el-button>
                <el-button type="text" @click="setUserAuth(scope.row)">设置权限</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="Virtual Hosts" name="5">
          <el-button class="m-b-md" type="primary" @click="addDetailVhost">新增</el-button>
          <basic-table :data="hostsList" :params="hostsParams" :get-list="getVhosts" :total="hostsTotal">
            <el-table-column prop="name" label="Name" show-overflow-tooltip></el-table-column>
            <el-table-column prop="users" label="Users" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.users == 'null' ? '' : scope.row.users }}
              </template>
            </el-table-column>
            <el-table-column prop="messages_ready" label="Ready" show-overflow-tooltip></el-table-column>
            <el-table-column prop="messages_unacknowledged" label="Unacked" show-overflow-tooltip></el-table-column>
            <el-table-column prop="messages" label="Total" show-overflow-tooltip></el-table-column>
            <el-table-column prop="recvOctRate" label="From client" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.recvOctRate || scope.row.recvOctRate == 0">{{ scope.row.recvOctRate }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="sendOctRate" label="To client" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.sendOctRate || scope.row.sendOctRate == 0">{{ scope.row.sendOctRate }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="publishRate" label="Publish" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.publishRate || scope.row.publishRate == 0">{{ scope.row.publishRate }}B/s</span></template
              >
            </el-table-column>
            <el-table-column prop="deliverRate" label="deliver / get" show-overflow-tooltip>
              <template slot-scope="scope"
                ><span v-if="scope.row.deliverRate || scope.row.deliverRate == 0">{{ scope.row.deliverRate }}B/s</span></template
              >
            </el-table-column>
            <el-table-column label="操作" width="220px">
              <template slot-scope="scope">
                <el-button type="text" @click="removeVhosts(scope.row)" :disabled="scope.row.name === '/'">删除</el-button>
                <el-button type="text" @click="setVhostsAuth(scope.row)">设置权限</el-button>
              </template>
            </el-table-column>
          </basic-table>
        </el-tab-pane>
        <el-tab-pane label="备份与恢复" name="8" v-if="false">
          <copy :detail="detail" v-if="active == '8'"></copy>
        </el-tab-pane>
        <el-tab-pane label="日志管理" name="6">
          <log :detail-id="detail.id" v-if="active == '6'"></log>
        </el-tab-pane>
        <el-tab-pane label="服务地址" name="9">
          <basic-table :data="detail.connections">
            <el-table-column prop="role" label="角色" show-overflow-tooltip width="200px"></el-table-column>
            <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
            <div slot="pagination"></div>
          </basic-table>
        </el-tab-pane>
      </el-tabs>
      <el-dialog title="关闭连接" :close-on-click-modal="false" v-if="closeConnectionsVisible" :visible.sync="closeConnectionsVisible" width="600px" append-to-body>
        <basic-form :model="closeConnectionsData" ref="closeConnectionsData">
          <basic-form-item label="Reason：" prop="xReason">
            <el-input v-model="closeConnectionsData.xReason" auto-complete="off"></el-input>
          </basic-form-item>
        </basic-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" @click.native="closeConnectionsVisible = false">取消</el-button>
          <el-button type="primary" @click.native="closeConnectionsSubmit">确定</el-button>
        </div>
      </el-dialog>
    </common-detail>
    <connections-detail v-if="connectionDetailFlag" :data-detail="connectionDetail" @goBackDetail="goBackDetail"></connections-detail>
    <channels-detail v-if="channelDetailFlag" :data-detail="channelDetail" @goBackDetail="goBackDetail"></channels-detail>
    <queues-detail v-if="queueDetailFlag" :data-detail="queueDetail" @goBackDetail="goBackDetail"></queues-detail>
    <div>
      <table-search class="m-b" :configs="searchConfigs" :onSearch="handleSearch">
        <template v-slot:operate>
          <router-link :to="{ name: 'ServiceRabbitMqCreate' }">
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
            <modifySpec :detail="scope.row" service="cms.rabbitmq"></modifySpec>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <add-user :add-data="addUserData" v-if="addUserData.dialog" @back="getUsers"></add-user>
    <add-vhost :add-data="addVhostData" v-if="addVhostData.dialog" @back="getVhosts"></add-vhost>
    <modify-user :add-data="modifyUserData" v-if="modifyUserData.dialog" @back="getUsers"></modify-user>
    <set-userauth :add-data="setUserAuthData" v-if="setUserAuthData.dialog" @back="getUsers"></set-userauth>
    <set-vhostsauth :add-data="setVhoutsAuthData" v-if="setVhoutsAuthData.dialog" @back="getVhosts"></set-vhostsauth>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import webSocket from '@/common/mixins/getGlobalSocket'
import connectionsDetail from './connectionDetail.vue'
import channelsDetail from './channelDetail.vue'
import queuesDetail from './queueDetail.vue'
import log from './log.vue'
import copy from './copy/index.vue'
import UnsubscribeService from '@/views/resource/vm/UnsubscribeService.vue'
import DelayService from '@/components/DelayService.vue'
import modifySpec from '@/components/modifySpecs.vue'
import addUser from './mqUser/add.vue'
import modifyUser from './mqUser/modify.vue'
import addVhost from './vhosts/add.vue'
import setUserauth from './mqUser/setAuth.vue'
import setVhostsauth from './vhosts/setAuth.vue'
import {
  removeMqVhosts,
  removeMqUser,
  patchActionCmsNodes,
  getCms,
  getCmsDetail,
  getCmsConnections,
  getCmsConnectionsDetail,
  removeMqsConnections,
  getCmsChannels,
  getCmsChannelsDetail,
  getCmsExchanges,
  getCmsQueues,
  getCmsVhosts,
  getCmsUsers,
  getCmsQueuesDetail,
  getCmsExchangesDetail
} from 'services/resource/middleware'
const searchConfigs = [
  { type: 'Input', label: '名称', value: 'name' },
  { type: 'Input', label: 'UUID', value: 'uuid' },
  { type: 'Const', value: 'type', initValue: 'RabbitMQ' },
  { type: 'Const', value: 'isRecycle', initValue: 0 }
]
export default {
  components: { setVhostsauth, setUserauth, addVhost, modifyUser, addUser, modifySpec, connectionsDetail, channelsDetail, queuesDetail, log, copy, UnsubscribeService, DelayService },
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
      active: '0',
      connectionsList: null,
      connectionsTotal: null,
      connectionsParams: {
        page: 1,
        rows: 10
      },
      channelsList: null,
      channelsTotal: null,
      channelsParams: {
        page: 1,
        rows: 10
      },
      exchangesList: null,
      exchangesTotal: null,
      exchangesParams: {
        page: 1,
        rows: 10
      },
      queuesList: [],
      queuesTotal: null,
      queuesParams: {
        page: 1,
        rows: 10
      },
      usersList: [],
      usersTotal: null,
      usersParams: {
        page: 1,
        rows: 10
      },
      hostsList: [],
      hostsTotal: null,
      hostsParams: {
        page: 1,
        rows: 10
      },
      connectionDetailFlag: false,
      connectionDetail: {},
      closeConnectionsVisible: false,
      closeConnectionsData: {},
      channelDetailFlag: false,
      channelDetail: {},
      queueDetailFlag: false,
      queueDetail: {},
      addUserData: {
        dialog: false,
        data: {}
      },
      modifyUserData: {
        dialog: false,
        data: {}
      },
      addVhostData: {
        dialog: false,
        data: {}
      },
      setUserAuthData: {
        dialog: false,
        data: {}
      },
      setVhoutsAuthData: {
        dialog: false,
        data: {}
      }
    }
  },
  filters: {},
  computed: {
    ...mapGetters(['userData', 'serviceIcon'])
  },
  created() {},
  methods: {
    addDetailUser() {
      this.addUserData = {
        dialog: true,
        data: {
          id: this.detail.id
        }
      }
    },
    modifyUser(data) {
      this.modifyUserData = {
        dialog: true,
        data: {
          id: this.detail.id,
          name: data.name,
          password: '',
          tags: data.tags
        }
      }
    },
    setUserAuth(data) {
      this.setUserAuthData = {
        dialog: true,
        data: {
          id: this.detail.id,
          name: data.name
        }
      }
    },
    setVhostsAuth(data) {
      this.setVhoutsAuthData = {
        dialog: true,
        data: {
          id: this.detail.id,
          name: data.name === '/' ? 'virgule' : data.name
        }
      }
    },
    addDetailVhost() {
      this.addVhostData = {
        dialog: true,
        data: {
          id: this.detail.id
        }
      }
    },
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
    removeUser(data) {
      this.$confirm('是否确认删除该Users?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeMqUser({
          id: this.detail.id,
          name: data.name
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getUsers()
          }
        })
      })
    },
    removeVhosts(data) {
      this.$confirm('是否确认删除该Virtual Hosts?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeMqVhosts({
          id: this.detail.id,
          name: data.name
        }).then(data => {
          if (data.success) {
            this.$message({
              type: 'success',
              message: data.message
            })
            this.getVhosts()
          }
        })
      })
    },
    onmessage(data) {
      if (data.operate.indexOf('volume') > -1 || data.operate.indexOf('rabbitmq') > -1 || data.operate.indexOf('SoftwareInstall') > -1) {
        this.getList()
      }
      if (data.operate.indexOf('change') > -1 && this.detailFlag) this.getDetail(this.detail)
    },
    goBack() {
      this.detailFlag = false
      this.getList()
    },
    goBackDetail(flag) {
      this[flag] = false
      this.detailFlag = true
    },
    handleClick(tab, event) {
      switch (this.active) {
        case '7':
          this.getConnections()
          break
        case '1':
          this.getChannels()
          break
        case '2':
          this.getExchanges()
          break
        case '3':
          this.getQueues()
          break
        case '4':
          this.getUsers()
          break
        case '5':
          this.getVhosts()
          break
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
          // this.getConnections()
          this.detailFlag = true
        }
      })
    },
    getConnections() {
      getCmsConnections(this.detail.id, this.connectionsParams).then(data => {
        if (data.success) {
          this.connectionsList = data.data.rows
          this.connectionsTotal = data.data.total
        }
      })
    },
    getChannels() {
      getCmsChannels(this.detail.id, this.channelsParams).then(data => {
        if (data.success) {
          this.channelsList = data.data.rows
          this.channelsTotal = data.data.total
        }
      })
    },
    getExchanges() {
      getCmsExchanges(this.detail.id, this.exchangesParams).then(data => {
        if (data.success) {
          this.exchangesList = data.data.rows
          this.exchangesTotal = data.data.total
        }
      })
    },
    getQueues() {
      getCmsQueues(this.detail.id, this.queuesParams).then(data => {
        if (data.success) {
          this.queuesList = data.data.rows
          this.queuesTotal = data.data.total
        }
      })
    },
    getUsers() {
      getCmsUsers(this.detail.id, this.usersParams).then(data => {
        if (data.success) {
          this.usersList = data.data.rows
          this.usersTotal = data.data.total
        }
      })
    },
    getVhosts() {
      getCmsVhosts(this.detail.id, this.hostsParams).then(data => {
        if (data.success) {
          this.hostsList = data.data.rows
          this.hostsTotal = data.data.total
        }
      })
    },
    getConnectionDetail(name) {
      getCmsConnectionsDetail(this.detail.id, name).then(data => {
        if (data.success) {
          this.connectionDetail = data.data
          this.connectionDetailFlag = true
          this.detailFlag = false
        }
      })
    },
    getChannelDetail(name) {
      getCmsChannelsDetail(this.detail.id, name).then(data => {
        if (data.success) {
          this.channelDetail = data.data
          this.channelDetailFlag = true
          this.detailFlag = false
        }
      })
    },
    getQueueDetail(vhost, name) {
      getCmsQueuesDetail(this.detail.id, vhost === '/' ? 'virgule' : vhost, name).then(data => {
        if (data.success) {
          this.queueDetail = data.data
          this.queueDetail.consumerUtilisation = this.queueDetail.consumerUtilisation * 100 + '%'
          this.queueDetailFlag = true
          this.detailFlag = false
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
    },
    closeConnection(name) {
      this.closeConnectionsData = {
        name: name,
        xReason: ''
      }
      this.closeConnectionsVisible = true
    },
    closeConnectionsSubmit() {
      this.$refs.closeConnectionsData.validate(valid => {
        if (valid) {
          removeMqsConnections(this.detail.id, this.closeConnectionsData).then(data => {
            if (data.success) {
              this.$message({
                message: data.message,
                type: 'success'
              })
              this.getConnections()
              this.closeConnectionsVisible = false
            }
          })
        }
      })
    }
  }
}
</script>
