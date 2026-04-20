<template>
  <common-detail :data="dataDetail.details" @goBack="goBack">
    <template v-slot:item_container>
      <common-detail-item label="Client-provided name">{{ dataDetail.details.clientProvidedName }}</common-detail-item>
      <common-detail-item label="State">
        <status-icon :type="stateFliter(dataDetail.details.state, 'color')">
          {{ stateFliter(dataDetail.details.state) }}
        </status-icon>
      </common-detail-item>
      <common-detail-item label="Username">{{ dataDetail.details.user }}</common-detail-item>
      <common-detail-item label="Heartbeat">{{ dataDetail.details.timeout }}s</common-detail-item>
      <common-detail-item label="Protocol">{{ dataDetail.details.protocol }}</common-detail-item>
      <common-detail-item label="Frame max">{{ dataDetail.details.frameMax }}bytes</common-detail-item>
      <common-detail-item label="Connected at">{{ dataDetail.details.connectedAt }}</common-detail-item>
      <common-detail-item label="Channel limit">{{ dataDetail.details.channelMax }}channels</common-detail-item>
      <common-detail-item label="Authentication">{{ dataDetail.details.authMechanism }}</common-detail-item>
    </template>
    <div class="vm-card">
      <div class="vm-card-header">
        <span class="text-blue">Channels</span>
        <span class="hide-down pull-right" @click="isShow('channelsFlag')">
          <i class="el-icon-arrow-down" style="font-size: 18px" />
        </span>
      </div>
      <div v-show="channelsFlag">
        <basic-table class="m-t-xs m-b-xs" :data="dataDetail.channels">
          <el-table-column prop="name" label="Channel" show-overflow-tooltip></el-table-column>
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
          <el-table-column prop="publishRates" label="publish" show-overflow-tooltip></el-table-column>
          <el-table-column prop="confirmRates" label="confirm" show-overflow-tooltip></el-table-column>
          <el-table-column prop="deliverGetRates" label="deliver / get" show-overflow-tooltip></el-table-column>
          <el-table-column prop="ackRates" label="ack" show-overflow-tooltip></el-table-column>
          <div slot="pagination"></div>
        </basic-table>
      </div>
    </div>
    <div class="vm-card">
      <div class="vm-card-header">
        <span class="text-blue">Client properties</span>
        <span class="hide-down pull-right" @click="isShow('clientFlag')">
          <i class="el-icon-arrow-down" style="font-size: 18px" />
        </span>
      </div>
      <div v-show="clientFlag">
        <div class="basic-info m-t">
          <el-row class="m-l m-r">
            <el-col :span="24" class="attr">
              <span class="attr-name" title="connection_name">connection_name：</span>
              <span class="attr-value" :title="dataDetail.clientProperties.connectionName">{{ dataDetail.clientProperties.connectionName }}</span>
            </el-col>
            <el-col :span="24" class="attr">
              <span class="attr-name" title="product">product：</span>
              <span class="attr-value" :title="dataDetail.clientProperties.product">{{ dataDetail.clientProperties.product }}</span>
            </el-col>
            <el-col :span="24" class="attr">
              <span class="attr-name" title="copyright">copyright：</span>
              <span class="attr-value" :title="dataDetail.clientProperties.copyright">{{ dataDetail.clientProperties.copyright }}</span>
            </el-col>
            <el-col :span="24" class="attr">
              <span class="attr-name" title="capabilities">capabilities：</span>
              <span class="attr-value">
                <span v-for="(item, key) in dataDetail.clientProperties.capabilities" :key="key" :title="key + ':' + item">{{ key }}:{{ item }}<br /></span>
              </span>
            </el-col>
            <el-col :span="24" class="attr">
              <span class="attr-name" title="information">information：</span>
              <span class="attr-value" :title="dataDetail.clientProperties.information">{{ dataDetail.clientProperties.information }}</span>
            </el-col>
            <el-col :span="24" class="attr">
              <span class="attr-name" title="version">version：</span>
              <span class="attr-value" :title="dataDetail.clientProperties.version">{{ dataDetail.clientProperties.version }}</span>
            </el-col>
            <el-col :span="24" class="attr">
              <span class="attr-name" title="platform">platform：</span>
              <span class="attr-value" :title="dataDetail.clientProperties.platform">{{ dataDetail.clientProperties.platform }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </common-detail>
</template>
<script>
import { stateFliter } from 'filters'
export default {
  props: {
    dataDetail: {
      type: Object
    }
  },
  data() {
    return {
      channelsFlag: true,
      clientFlag: true
    }
  },
  methods: {
    stateFliter,
    goBack() {
      this.$emit('goBackDetail', 'connectionDetailFlag')
    },
    isShow(flag) {
      this[flag] = !this[flag]
    }
  }
}
</script>
<style scoped lang="scss">
.vm-card {
  -webkit-transition: 0.3s;
  transition: 0.3s;
  border: 1px solid #dcdfe6 !important;
  margin-bottom: 10px;
  .vm-card-header {
    padding: 10px 20px !important;
    border-bottom: 1px solid #ebeef5;
  }
  .text-blue {
    color: #409eff;
  }
}
.attr-name {
  width: 200px;
  display: inline-block;
}
.attr-value {
  display: inline-block;
  width: calc(100% - 200px);
}
</style>
