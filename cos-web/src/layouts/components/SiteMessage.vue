<template>
  <div class="system-letter">
    <el-dropdown trigger="click">
      <span>
        <el-badge :value="totalMessage" class="item cur-point">
          <i class="el-icon-message"></i>
        </el-badge>
      </span>
      <el-dropdown-menu slot="dropdown" class="message-container list-group">
        <el-card>
          <div slot="header" class="message-header">
            <span>我的消息</span>
            <el-button type="text" @click="goProfileMessage('')">查看更多</el-button>
          </div>
          <div v-for="item in messageList" :key="item.id" class="list-group-item" @click="goProfileMessage(item.id)">
            <span class="text-ellipsis"> <i class="dot dot-warning m-r-xs"></i>{{ item.name }}</span>
            <el-tooltip class="item" effect="dark" :content="item.content" placement="top-start">
              <small class="text-content">{{ item.content }}</small>
            </el-tooltip>
          </div>
          <empty v-if="messageList.length === 0"></empty>
        </el-card>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import { setToken } from 'utils/auth'
import webSocket from '@/common/mixins/webSocket'
import { getMessage } from 'services/system/message'

export default {
  mixins: [webSocket],
  data() {
    return {
      messageList: [],
      totalMessage: 0,
      detail: {
        visible: false
      }
    }
  },
  watch: {
    // 监控路由变化隐藏全局站内信详情
    $route() {
      if (this.detail.visible) this.detail.visible = false
    }
  },
  created() {
    this.loadMessage()
    this.$store.commit('SET_WEBSOCKET', this.webSocket)
  },
  methods: {
    // 获取站内信信息
    loadMessage() {
      getMessage({
        page: 1,
        rows: 5,
        params: JSON.stringify([{ param: { status: 'UNREAD' }, sign: 'EQ' }])
      }).then((data) => {
        if (data.success) {
          this.messageList = data.data.rows
          this.totalMessage = data.data.total
        }
      })
    },
    handleServiceMessage(data) {
      if (data.operate === 'refresh.token') {
        setToken(data.data)
      }
      if (data.operate === 'create.boc.tenant') {
        this.$notify({
          message: data.message,
          type: data.success ? 'success' : 'error'
        })
      }
    },
    messageCommonFun(data) {
      if (data.operate !== 'HeartBeat') console.log(data)
      switch (data.category) {
        case 'MachineDiscovered': // 机器发现消息
        case 'ResourceEvent': // 云管消息
          this.$notify({
            message: data.message,
            type: data.success ? 'success' : 'error'
          })
          break
        case 'ServiceEvent': // 服务消息
          this.handleServiceMessage(data)
          break
        case 'SiteMessage': // 站内信消息
          this.loadMessage()
          if (data.operate !== 'message.change') {
            this.$notify({
              message: '您有一条新的消息！',
              type: 'info'
            })
          }
          break
      }
    },
    goProfileMessage(id) {
      if (this.$route.name !== 'ProfileMessage') this.$router.push({ name: 'ProfileMessage', query: { id } })
    }
  }
}
</script>
<style lang="scss" scoped>
.system-letter {
  i {
    font-size: 18px;
  }
  ::v-deep .el-badge__content.is-fixed {
    border: none;
    top: 12px !important;
  }
}

.message-container {
  padding: 0 !important;
  width: 300px;
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  ::v-deep .popper__arrow {
    display: none !important;
  }

  .list-group-item {
    position: relative;
    display: block;
    padding: 10px 0;
    background-color: #fff;
    border-bottom: 1px solid #e7ecee;
    cursor: pointer;
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border-width: 3px;
      display: inline-block;
    }
    .dot-warning {
      background-color: #fad733;
    }
    .text-content {
      margin-top: 5px;
      margin-left: 15px;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #98a6ad;
    }
  }
}
</style>
