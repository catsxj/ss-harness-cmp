<template>
  <div class="item-card">
    <div class="item-title">
      <span>{{ configs.name }}</span>
      <UploadButton :data="data" :codes="codes"></UploadButton>
      <!-- TODO: i18n -->
      <el-button v-if="showTest" text class="pull-right" style="margin-top: 2px" @click="testLink">测试连接</el-button>
      <!-- TODO: i18n -->
      <el-button v-if="configs.name === 'LDAP配置'" text class="pull-right" style="margin-top: 2px" @click="syncLdap">同步</el-button>
    </div>
    <div class="item-body">
      <basic-form label-position="left" label-suffix="：" label-width="230px">
        <basic-form-item :label="item.name" v-for="item in configs.values" :key="item.id">
          <el-input v-model="item.value" :maxlength="maxlength" :show-password="item.type === 'PASSWORD'"></el-input>
        </basic-form-item>
      </basic-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { testLinkApi, syncLdapApi } from 'services/system'
import UploadButton from '../components/UploadButton.vue'
import { ElMessage } from 'element-plus'

interface ConfigValue {
  id?: string | number
  code: string
  value: unknown
  name?: string
  type?: string
}

interface ConfigsProp {
  name: string
  values: ConfigValue[]
  [key: string]: unknown
}

const props = defineProps<{
  configs: ConfigsProp
  showTest?: boolean
}>()

const maxlength = ref(1000)
setTimeout(() => {
  maxlength.value = 1001
}, 1000)

const codes = computed(() => props.configs.values.map((item) => item.code))
const data = computed(() => {
  const map: Record<string, unknown> = {}
  props.configs.values.forEach((item) => {
    const { code, value } = item
    map[code] = value
  })
  return map
})

// TODO: i18n
const map: Record<string, string> = {
  邮箱配置: 'email',
  钉钉配置: 'dingtalk',
  企业微信配置: 'wechat',
  LDAP配置: 'ldap'
}

async function testLink() {
  const res = await testLinkApi(map[props.configs.name] || ' ')
  if (res.success) {
    ElMessage.success(res.message)
  }
}
async function syncLdap() {
  const res = await syncLdapApi()
  if (res.success) {
    ElMessage.success(res.message)
  }
}
</script>
<style scoped lang="scss">
@import '../components/index';
</style>
