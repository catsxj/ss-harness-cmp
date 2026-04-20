<template>
  <a-dropdown class="system-letter">
    <span class="m-r-md">
      <a-badge :count="totalMessage" class="item cur-point">
        <MailOutlined class="message-icon" />
      </a-badge>
    </span>
    <template #overlay>
      <a-menu class="message-container list-group">
        <a-card title="我的消息">
          <template #extra>
            <a-button type="link" @click="goProfileMessage('')">查看更多</a-button>
          </template>
          <div v-for="item in messageList" :key="item.id" class="list-group-item" @click="goProfileMessage(item.id)">
            <span class="text-ellipsis">
              <i class="dot dot-warning m-r-xs"></i>
              {{ item.name }}
            </span>
            <a-tooltip :title="item.content">
              <small class="text-content">{{ item.content }}</small>
            </a-tooltip>
          </div>
          <a-empty v-if="messageList.length === 0"></a-empty>
        </a-card>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script>
import { ref } from 'vue'
import { notification } from 'ant-design-vue'
import { setToken } from 'utils/auth'
import useWebsocket from '@/hooks/useWebsocket'
import { getMessage } from '@/services/message'
import { MailOutlined } from '@ant-design/icons-vue'
import { handleSearchParam } from 'utils'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  components: { MailOutlined },
  setup() {
    // 获取站内信信息
    const messageList = ref([])
    const totalMessage = ref(0)
    async function loadMessage() {
      const data = await getMessage({
        page: 1,
        rows: 5,
        params: handleSearchParam({
          status: 'UNREAD'
        })
      })
      if (data.success) {
        messageList.value = data.data.rows
        totalMessage.value = data.data.total
      }
    }
    loadMessage()
    function handleServiceMessage(data) {
      if (data.operate === 'refresh.token') {
        setToken(data.data)
      }
    }
    function messageCommonFun(data) {
      if (data.operate !== 'HeartBeat') console.log(data)
      switch (data.category) {
        case 'MachineDiscovered': // 机器发现消息
        case 'ResourceEvent': // 云管消息
          notification[data.success ? 'success' : 'error']({
            message: data.message
          })
          break
        case 'ServiceEvent': // 服务消息
          handleServiceMessage(data)
          break
        case 'SiteMessage': // 站内信消息
          loadMessage()
          if (data.operate !== 'message.change') {
            notification.info({
              message: '您有一条新的消息！',
              description: data.message
            })
          }
          break
      }
    }
    const router = useRouter()
    const route = useRoute()
    function goProfileMessage(id) {
      if (route.path !== '/personal/message') router.push({ path: '/personal/message', query: { id } })
    }
    const { webSocket } = useWebsocket('', messageCommonFun)
    const store = useStore()
    store.commit('SET_WEBSOCKET', webSocket)
    return {
      messageList,
      totalMessage,
      goProfileMessage
    }
  }
}
</script>
<style lang="scss" scoped>
.system-letter {
  .message-icon {
    font-size: 20px;
    color: #98a6ad;
  }
  ::v-deep(.ant-badge-count) {
    box-shadow: none;
  }
}

.message-container {
  padding: 0 !important;
  width: 300px;

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
