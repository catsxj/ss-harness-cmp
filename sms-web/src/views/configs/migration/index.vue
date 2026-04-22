<template>
  <el-card class="box-card">
    <!-- TODO: cmp-element - 自研包在 compat 层处理：basic-form / basic-form-item / AdvanceTable / status-icon -->
    <basic-form :model="form" label-width="110px">
      <el-row :gutter="10">
        <el-col :span="24">
          <basic-form-item label="数据库地址：" prop="url" validate="required" required-message="请输入数据库地址">
            <el-input v-model="form.url" clearable></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <basic-form-item label="数据库用户：" prop="user" validate="required" required-message="请输入数据库用户">
            <el-input v-model="form.user" clearable></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="数据库密码: " prop="pass" :validate="pwdRule" required-message="请输入数据库密码">
            <el-input v-model="form.pass" show-password auto-complete="off" clearable></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-button style="position: absolute; right: 20px" type="primary" @click="gotoMigration">迁移</el-button>
      </el-row>
    </basic-form>
    <AdvanceTable :style="{ marginTop: '20px' }" v-if="!detail.visible" :card-border="false" title="迁移记录列表" :show-tools="false" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #id="{ val, record }">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="{ val: status, record }">
        <status-icon :type="getStatus('color', status)">
          {{ getStatus('text', status) }}
        </status-icon>
      </template>
      <template #percent="{ val, record }">
        <el-progress :percentage="getProgress(record)"></el-progress>
      </template>
      <template #operate="{ val, record }">
        <el-button link :disabled="record.status !== 'FAILED'" @click="refreshItem(detail.id, record.id)">重试</el-button>
      </template>
    </AdvanceTable>
    <Detail v-if="detail.visible" :detail="detail" @goBack="detail.visible = false"></Detail>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores'
import { getMeta, migrationData, getMigrationData } from 'services/system/migration'
import crypto from 'utils/crypto'
import Detail from './detail.vue'
import { getStatus, columns } from './configs'

const appStore = useAppStore()

interface FormData {
  url: string
  user: string
  pass: string
}
interface DetailState {
  visible: boolean
  id?: number | string
  [key: string]: unknown
}

const form = reactive<FormData>({ url: '', user: '', pass: '' })
// TODO: type - 迁移记录行类型后续补 interface
const list = ref<any[]>([])
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })
const total = ref(0)
const loading = ref(false)
const interNum = ref<number | null>(null)
const detail = reactive<DetailState>({ visible: false })

// TODO: type - pwdStrength 类型后续由 app store 补全
const pwdRule = computed(() => (appStore.systemConfig as any).pwdStrength)

const visible = computed(() => detail.visible)

async function loadMeta() {
  const res = await getMeta()
  if (res.success) {
    form.url = res.data.url
    form.user = res.data.user
    form.pass = crypto.decrypt(res.data.pass)
  }
}
loadMeta()

async function gotoMigration() {
  const pass = crypto.encrypt(form.pass)
  const res = await migrationData({ ...form, pass })
  if (res.success) {
    ElMessage.success(res.message)
    getList()
  }
}

function refresh() {
  interNum.value = window.setInterval(() => {
    if (!visible.value) {
      getList()
    }
  }, 5000)
}

async function getList() {
  console.log('page: ', params.page)
  loading.value = true
  const res = await getMigrationData(params)
  if (res.success) {
    list.value = res.data.rows
    total.value = res.data.total
  }
  loading.value = false
}

getList()
refresh()

function getDetail(record: any) {
  Object.assign(detail, { visible: true, ...record })
}

function getProgress({ totalCnt = 0, completeCnt = 0 }: { totalCnt?: number; completeCnt?: number }) {
  return Number(((completeCnt / totalCnt) * 100).toFixed(1))
}

// 占位函数：此处未实现但原模板引用该方法。行内按钮禁用时 record.status !== 'FAILED' 才可点击
// TODO: type - 迁移 detail 行重试接口后续由 services 提供
function refreshItem(_recordId: unknown, _taskId: unknown) {
  /* noop */
}

onBeforeUnmount(() => {
  if (interNum.value != null) clearInterval(interNum.value)
})
</script>

<style scoped lang="scss"></style>
