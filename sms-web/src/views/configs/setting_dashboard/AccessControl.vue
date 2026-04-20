<template>
  <div>
    <div class="control-wrapper">
      <div class="control-cell">
        <!-- TODO: i18n -->
        <span>用户数</span>
        <router-link :to="{ name: 'SystemUserManager' }">
          <span class="cell-value">{{ data.userNum }}</span>
        </router-link>
      </div>

      <div class="control-cell">
        <!-- TODO: i18n -->
        <span>租户数</span>
        <router-link :to="{ name: 'TenantManager' }">
          <span class="cell-value">{{ data.tenantNum }}</span>
        </router-link>
      </div>

      <div class="control-cell">
        <span>{{ appStore.systemConfig.serviceConfigLabel }}</span>
        <router-link :to="{ name: 'BusinessSetting' }">
          <span class="cell-value">{{ data.businessNum }}</span>
        </router-link>
      </div>

      <div class="control-cell">
        <span>{{ appStore.systemConfig.projectConfigLabel }}</span>
        <router-link :to="{ name: 'ProjectAdmin' }">
          <span class="cell-value">{{ data.projectNum }}</span>
        </router-link>
      </div>
    </div>
    <div class="m-t-md">
      <!-- TODO: i18n -->
      <span>控制台登录链接：</span>
      <a class="console-url" :href="consoleUrl" target="_blank">{{ consoleUrl }}</a>
      <img class="copy-icon" :src="copyIcon" alt="" @click="copyUrl(consoleUrl, $event)" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { copyText } from 'utils/index'
import { ElMessage } from 'element-plus'
import { getSystemCount } from 'services/system/portal'
import { useAppStore } from '@/stores'
import copyIcon from '@/assets/copy.png'

interface CountData {
  userNum: number
  tenantNum: number
  businessNum: number
  projectNum: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineProps<{
  itemData: { config?: any }
}>()

const appStore = useAppStore()

const { hostname, protocol } = location
const data = ref<CountData>({
  userNum: 0,
  tenantNum: 0,
  businessNum: 0,
  projectNum: 0
})

;(async function () {
  const res = await getSystemCount()
  data.value = res.data
})()

const consoleUrl = `${protocol}//${hostname}:60008`

function copyUrl(url: string, event: Event) {
  copyText(url, event, () => {
    // TODO: i18n
    ElMessage.success('控制台地址复制成功')
  })
}
</script>
<style lang="scss" scoped>
.control-wrapper {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 20px 20px 20px;
  justify-content: space-between;
  .control-cell {
    display: flex;
    flex-direction: column;
    span:nth-child(1) {
      color: #707274;
    }
    span.cell-value {
      font-size: 28px;
      color: #393b3e;
      &:hover {
        color: $--color-primary;
      }
    }
  }
}
.console-url {
  color: $--color-primary;
}
.copy-icon {
  cursor: pointer;
  margin-left: 2px;
  width: 16px;
  height: 16px;
}
</style>
