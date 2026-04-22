<template>
  <div class="system-letter">
    <el-dropdown trigger="click">
      <span>
        <el-badge :value="totalMessage" class="item cur-point">
          <el-icon><Message /></el-icon>
        </el-badge>
      </span>
      <template #dropdown>
        <el-dropdown-menu class="message-container list-group">
          <el-card>
            <template #header>
              <div class="message-header">
                <span>我的消息</span>
                <el-button link>查看更多</el-button>
              </div>
            </template>
            <div v-for="item in messageList" :key="item.id" class="list-group-item">
              <span class="text-ellipsis">
                <i class="dot dot-warning m-r-xs" />{{ item.name }}
              </span>
              <el-tooltip class="item" effect="dark" :content="item.content" placement="top-start">
                <small class="text-content">{{ item.content }}</small>
              </el-tooltip>
            </div>
            <!-- TODO: cmp-element - empty 组件来自自研包，保留 DOM 占位 -->
            <empty v-if="messageList.length === 0" />
          </el-card>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { setToken } from 'utils/auth'
import useGlobalWebsocket from '@/common/hooks/useGlobalWebsocket'
import { getMessage } from 'services/system/message'

interface SiteMessageItem {
  id: string | number
  name: string
  content: string
  [key: string]: unknown
}

interface ServiceMessageData {
  operate?: string
  category?: string
  message?: string
  success?: boolean
  data?: unknown
  [key: string]: unknown
}

const route = useRoute()

const messageList = ref<SiteMessageItem[]>([])
const totalMessage = ref<number>(0)
const detail = ref<{ visible: boolean }>({ visible: false })

async function loadMessage(): Promise<void> {
  const data = await getMessage({
    page: 1,
    rows: 5,
    params: JSON.stringify([{ param: { status: 'UNREAD' }, sign: 'EQ' }])
  })
  if (data.success) {
    messageList.value = data.data.rows as SiteMessageItem[]
    totalMessage.value = data.data.total as number
  }
}

function handleServiceMessage(data: ServiceMessageData): void {
  if (data.operate === 'refresh.token') {
    setToken(data.data as string)
  }
  if (data.operate === 'create.boc.tenant') {
    ElNotification({
      message: data.message ?? '',
      type: data.success ? 'success' : 'error'
    })
  }
}

function messageCommonFun(data: ServiceMessageData): void {
  if (data.operate !== 'HeartBeat') console.log(data)
  switch (data.category) {
    case 'MachineDiscovered':
    case 'ResourceEvent':
      ElNotification({
        message: data.message ?? '',
        type: data.success ? 'success' : 'error'
      })
      break
    case 'ServiceEvent':
      handleServiceMessage(data)
      break
    case 'SiteMessage':
      loadMessage()
      if (data.operate !== 'message.change') {
        ElNotification({
          message: '您有一条新的消息！',
          type: 'info'
        })
      }
      break
  }
}

watch(
  () => route.path,
  () => {
    if (detail.value.visible) detail.value.visible = false
  }
)

loadMessage()

useGlobalWebsocket((event: MessageEvent) => {
  try {
    const payload = typeof event.data === 'string' ? (JSON.parse(event.data) as ServiceMessageData) : (event.data as ServiceMessageData)
    messageCommonFun(payload)
  } catch {
    /* ignore malformed payload */
  }
})
</script>

<style lang="scss" scoped>
.system-letter {
  i {
    font-size: 18px;
  }
  .el-icon {
    font-size: 18px;
  }
  :deep(.el-badge__content.is-fixed) {
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
  :deep(.popper__arrow) {
    display: none !important;
  }

  .list-group-item {
    position: relative;
    display: block;
    padding: 10px 0;
    background-color: #fff;
    border-bottom: 1px solid #e7ecee;
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
