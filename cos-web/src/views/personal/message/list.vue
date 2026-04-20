<template>
  <el-card>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane :label="`所有消息(${messageCount.total || 0})`" name="ALL"></el-tab-pane>
      <el-tab-pane :label="`未读消息(${messageCount.unreadCount || 0})`" name="UNREAD"></el-tab-pane>
      <el-tab-pane :label="`已读消息(${messageCount.readCount || 0})`" name="READ"></el-tab-pane>
    </el-tabs>
    <AdvanceTable ref="tableRef" :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button v-if="searchConfigs[3].initValue !== 'READ'" type="primary" @click="readAll()">全部标为已读</el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="val">
        <status-icon :type="val | messageStatusFilter('color')">
          {{ val | messageStatusFilter('status') }}
        </status-icon>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <detail-dialog :dialog="detailConfig" v-if="detailConfig.visible"></detail-dialog>
  </el-card>
</template>
<script>
import { Message } from 'element-ui'
import detailDialog from './detail.vue'
import { getMessage, getMessageStats, readAllMessage } from 'services/system/message'
import { searchConfigs as searchConfig, columns } from './config'
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import useTable from 'hooks/useTable'
import useWebsocket from 'hooks/useWebsocket'
export default defineComponent({
  components: { detailDialog },
  setup(props, context) {
    const { list, params, total, loading, getList } = useTable({
      getService: getMessage
    })
    const searchConfigs = ref(searchConfig)
    // 统计信息
    const messageCount = ref({})
    async function getMessageInfo() {
      const data = await getMessageStats()
      if (data.success) {
        messageCount.value = data.data
      }
    }
    getMessageInfo()
    // tab切换
    const activeName = ref('ALL')
    const tableRef = ref()
    function handleClick() {
      searchConfigs.value[3].initValue = activeName.value === 'ALL' ? '' : activeName.value
      tableRef.value.handleSearch()
      getMessageInfo()
    }
    // 详情
    const detailConfig = ref({
      visible: false,
      id: 0
    })
    function getDetail(id) {
      detailConfig.value = {
        visible: true,
        id
      }
    }
    // 已读
    async function readAll() {
      const data = await readAllMessage()
      if (data.success) {
        Message.success(data.message)
        getList()
        getMessageInfo()
      }
    }
    function updateData() {
      getMessageInfo()
      getList()
    }
    useWebsocket((data) => {
      if (data.operate === 'message.change') {
        updateData()
      }
    })
    function goMessageDetail(id) {
      activeName.value = 'UNREAD'
      searchConfigs.value[3].initValue = 'UNREAD'
      getDetail(id)
    }
    console.log(`这是cos站内信id:${context.root.$route.query.id}`)
    const ProfileMessageId = computed(() => context.root.$route.query.id)
    if (ProfileMessageId.value) {
      goMessageDetail(ProfileMessageId)
    } else {
      activeName.value = 'ALL'
      searchConfigs.value[3].initValue = ''
    }
    watch(ProfileMessageId, (id) => {
      getDetail(id)
    })
    return {
      list,
      params,
      total,
      loading,
      getList,
      columns,
      searchConfigs,
      // tab
      activeName,
      tableRef,
      handleClick,
      // 统计信息
      messageCount,
      detailConfig,
      getDetail,
      readAll
    }
  }
})
</script>
