<template>
  <div class="wrapper">
    <!-- TODO: cmp-element - 自研包在 compat 层处理：common-detail-right / common-detail-item / AdvanceTable / status-icon -->
    <common-detail-right v-if="detail.visible" :title="detail.title" @goBack="detail.visible = false">
      <template #item_container>
        <common-detail-item label="标题">{{ detail.title }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="statusFilter('color', detail.status)">
            {{ statusFilter('text', detail.status) }}
          </status-icon>
        </common-detail-item>
        <common-detail-item label="发布人">{{ detail.creatorName }}</common-detail-item>
        <common-detail-item label="发布范围">
          <el-tag style="margin-right: 10px" v-for="item in (detail.sendGroups || '').split(',')" :key="item" type="success">{{ sendGroupMap[item] }}</el-tag>
        </common-detail-item>
        <common-detail-item label="发布方式">
          <el-tag style="margin-right: 10px" v-for="item in (detail.sendWays || '').split(',')" :key="item" type="success">{{ sendWayMap[item] }}</el-tag>
        </common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
        <common-detail-item label="发布时间">{{ detail.sendTime }}</common-detail-item>
        <common-detail-item label="内容">{{ detail.content }}</common-detail-item>
      </template>
    </common-detail-right>
    <AdvanceTable title="公告管理" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate('add')"> <el-icon><Plus /></el-icon> 新增 </el-button>
      </template>
      <template #title="{ val, record }">
        <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
      </template>
      <template #status="status">
        <status-icon :type="statusFilter('color', status)">
          {{ statusFilter('text', status) }}
        </status-icon>
      </template>
      <template #sendGroups="sendGroups">
        <el-tag style="margin-right: 10px" v-for="item in sendGroups.split(',')" :key="item" type="success">{{ sendGroupMap[item] }}</el-tag>
      </template>
      <template #sendWays="sendWays">
        <el-tag style="margin-right: 10px" v-for="item in sendWays.split(',')" :key="item" type="success">{{ sendWayMap[item] }}</el-tag>
      </template>
      <template #operate="{ val, record }">
        <el-button type="text" @click="handleCreate('edit', record)" :disabled="record.status === 'SEND'"> <el-icon><Edit /></el-icon> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleSend(record.id)" :disabled="record.status === 'SEND'"> <el-icon><Promotion /></el-icon> 发布 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)" :disabled="record.status === 'SEND'"> <el-icon><Delete /></el-icon> 删除 </el-button>
      </template>
    </AdvanceTable>
    <Dialog v-if="addData.visible" :addData="addData" @getList="getList"></Dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Promotion } from '@element-plus/icons-vue'
import { searchConfigs, columns } from './config.js'
import { getNotice, removeNotice, sendNotice } from 'services/system/notice'
import Dialog from './Dialog.vue'

function statusFilter(type: string, status: string): string {
  const textMap: Record<string, string> = { NOTSEND: '待发布', SEND: '已发布' }
  const colorMap: Record<string, string> = { NOTSEND: 'warning', SEND: 'success' }
  return type === 'color' ? colorMap[status] : textMap[status]
}

const sendGroupMap: Record<string, string> = {
  ALL: '全员',
  MANAGE: '管理端用户',
  TENANT: '租户端用户',
  INPUT: '指定用户'
}

const sendWayMap: Record<string, string> = {
  EMAIL: '邮件',
  MESSAGE: '站内信',
  WECHAT: '企业微信',
  DING: '钉钉'
}

const loading = ref(false)
const params = reactive<Record<string, any>>({ page: 1, rows: 10 })
const total = ref(0)
// TODO: type - 公告行类型后续补 interface
const list = ref<any[]>([])
const addData = reactive<Record<string, any>>({
  visible: false,
  sendGroups: [],
  currentTitle: 'add'
})
const detail = reactive<Record<string, any>>({ visible: false })

async function getList() {
  loading.value = true
  const res = await getNotice(params)
  if (res.success) {
    list.value = res.data.rows
    total.value = res.data.total
  }
  loading.value = false
}

function handleCreate(type: string, record?: any) {
  switch (type) {
    case 'add':
      Object.keys(addData).forEach((k) => delete addData[k])
      Object.assign(addData, {
        visible: true,
        sendGroups: [],
        sendWays: [],
        currentTitle: 'add'
      })
      break
    case 'edit':
      Object.keys(addData).forEach((k) => delete addData[k])
      Object.assign(addData, {
        ...record,
        sendGroups: record.sendGroups && record.sendGroups.split(','),
        sendWays: record.sendWays && record.sendWays.split(','),
        visible: true,
        currentTitle: 'edit'
      })
      break
    default:
      break
  }
}

function getDetail(record: any) {
  Object.keys(detail).forEach((k) => delete detail[k])
  Object.assign(detail, { visible: true, ...record })
}

function remove(id: number | string) {
  ElMessageBox.confirm('您确定要删除该公告吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await removeNotice(id as any)
    if (res.success) {
      getList()
      ElMessage.success(res.message)
    }
  })
}

function handleSend(id: number | string) {
  ElMessageBox.confirm('您确定要发布该公告吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await sendNotice(id as any)
    if (res.success) {
      getList()
      ElMessage.success(res.message)
    }
  })
}

// 模板中需要访问这些常量
defineExpose({ searchConfigs, columns })
</script>

<style></style>
