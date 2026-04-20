<template>
  <div class="wrapper">
    <common-detail-right v-if="detail.visible" :title="detail.title" @goBack="detail.visible = false">
      <template v-slot:item_container>
        <common-detail-item label="标题">{{ detail.title }}</common-detail-item>
        <common-detail-item label="状态">
          <template>
            <status-icon :type="statusFilter('color', detail.status)">
              {{ statusFilter('text', detail.status) }}
            </status-icon>
          </template>
        </common-detail-item>
        <common-detail-item label="发布人">{{ detail.creatorName }}</common-detail-item>
        <common-detail-item label="发布范围">
          <template>
            <el-tag style="margin-right: 10px" v-for="item in detail.sendGroups.split(',')" :key="item" type="success">{{ sendGroupMap[item] }}</el-tag>
          </template>
        </common-detail-item>
        <common-detail-item label="发布方式">
          <template>
            <el-tag style="margin-right: 10px" v-for="item in detail.sendWays.split(',')" :key="item" type="success">{{ sendWayMap[item] }}</el-tag>
          </template>
        </common-detail-item>
        <common-detail-item label="创建时间">{{ detail.gmtCreate }}</common-detail-item>
        <common-detail-item label="发布时间">{{ detail.sendTime }}</common-detail-item>
        <common-detail-item label="内容">{{ detail.content }}</common-detail-item>
      </template>
    </common-detail-right>
    <AdvanceTable title="公告管理" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate('add')"> <i class="el-icon-plus"></i> 新增 </el-button>
      </template>
      <template #title="val, record">
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
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('edit', record)" :disabled="record.status === 'SEND'"> <i class="el-icon-edit"></i> 编辑 </el-button>
        <!-- <div class="action-divider"></div> -->
        <!-- <el-button type="text" @click="remove(record.id)" :disabled="record.personal"> <i class="el-icon-delete"></i> 撤回 </el-button> -->
        <div class="action-divider"></div>
        <el-button type="text" @click="handleSend(record.id)" :disabled="record.status === 'SEND'"> <i class="el-icon-s-promotion"></i> 发布 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)" :disabled="record.status === 'SEND'"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </AdvanceTable>
    <Dialog v-if="addData.visible" :addData="addData" @getList="getList"></Dialog>
  </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import { searchConfigs, columns } from './config.js'
import { getNotice, removeNotice, sendNotice } from 'services/system/notice'
import { Message, MessageBox } from 'element-ui'

import Dialog from './Dialog.vue'
function statusFilter(type, status) {
  const textMap = {
    NOTSEND: '待发布',
    SEND: '已发布'
  }
  const colorMap = {
    NOTSEND: 'warning',
    SEND: 'success'
  }
  return type === 'color' ? colorMap[status] : textMap[status]
}

const sendGroupMap = {
  ALL: '全员',
  MANAGE: '管理端用户',
  TENANT: '租户端用户',
  INPUT: '指定用户'
}

const sendWayMap = {
  EMAIL: '邮件',
  MESSAGE: '站内信',
  WECHAT: '企业微信',
  DING: '钉钉'
}

export default {
  components: { Dialog },
  setup() {
    const state = reactive({
      columns,
      searchConfigs,
      loading: false,
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      list: [],
      addData: {
        visible: false,
        sendGroups: [],
        currentTitle: 'add'
      },
      detail: {
        visible: false
      }
    })

    async function getList() {
      state.loading = true
      const res = await getNotice(state.params)
      if (res.success) {
        state.list = res.data.rows
        state.total = res.data.total
      }
      state.loading = false
    }

    function handleCreate(type, record) {
      switch (type) {
        case 'add':
          state.addData = {
            visible: false,
            sendGroups: [],
            sendWays: [],
            currentTitle: 'add'
          }
          state.addData.visible = true
          break
        case 'edit':
          state.addData = {
            ...Object.assign({}, record),
            sendGroups: record.sendGroups && record.sendGroups.split(','),
            sendWays: record.sendWays && record.sendWays.split(','),
            visible: true,
            currentTitle: 'edit'
          }
          break
        default:
          break
      }
    }

    function getDetail(record) {
      state.detail = {
        visible: true,
        ...Object.assign({}, record)
      }
    }

    async function remove(id) {
      MessageBox.confirm('您确定要删除该公告吗?', '提示', {
        type: 'warning'
      }).then(async () => {
        const res = await removeNotice(id)
        if (res.success) {
          getList()
          Message({
            type: 'success',
            message: res.message
          })
        }
      })
    }
    async function handleSend(id) {
      MessageBox.confirm('您确定要发布该公告吗?', '提示', {
        type: 'warning'
      }).then(async () => {
        const res = await sendNotice(id)
        if (res.success) {
          getList()
          Message({
            type: 'success',
            message: res.message
          })
        }
      })
    }
    return {
      ...toRefs(state),
      statusFilter,
      getList,
      handleCreate,
      getDetail,
      sendGroupMap,
      sendWayMap,
      remove,
      handleSend
    }
  }
}
</script>

<style></style>
