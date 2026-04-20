<template>
  <div>
    <AdvanceTable v-show="!detailVisible" title="SLA列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" ref="tableRef" @selection-change="handleSelectionChange">
      <template v-slot:action>
        <el-button type="primary" @click="handleCreate()" icon="el-icon-plus"> 新增 </el-button>
        <el-button @click="batchOperate('enable')" :disabled="!selectionIds.length" icon="el-icon-video-pause">批量启用 </el-button>
        <el-button @click="batchOperate('disable')" :disabled="!selectionIds.length"> <svg-icon icon-name="svg-disabled" /> 批量禁用 </el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="getDetail(record.id)">{{ val }}</span>
      </template>
      <template #status="val">
        <status-icon :type="skuStatusFilter(val, 'color')">
          {{ skuStatusFilter(val) }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" :disabled="record.status == 'enable'" @click="handleCreate(record)"><i class="el-icon-edit"></i> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" :disabled="record.status == 'enable'" @click="handleDelete(record)"><i class="el-icon-delete"></i> 删除 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" v-if="record.status === 'disable'" @click="handleOperate(record, 'enable')"><i class="el-icon-video-pause"></i> 启用</el-button>
        <el-button type="text" v-else @click="handleOperate(record, 'disable')"> <svg-icon icon-name="svg-disabled"></svg-icon> 禁用 </el-button>
      </template>
    </AdvanceTable>
    <!--详情界面-->
    <common-detail v-if="detailVisible" :title="detailData.name" @goBack="goBack">
      <template v-slot:item_container>
        <common-detail-item label="名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="服务分类">{{ detailData.catalogName }}</common-detail-item>
        <common-detail-item label="服务名称">{{ detailData.serviceName }}</common-detail-item>
        <common-detail-item label="状态">
          <status-icon :type="skuStatusFilter(detailData.status, 'color')">{{ skuStatusFilter(detailData.status) }} </status-icon>
        </common-detail-item>
        <common-detail-item label="创建人">{{ detailData.creatorName }}</common-detail-item>
        <common-detail-item label="创建时间">{{ detailData.gmtCreate }}</common-detail-item>
      </template>
      <el-tabs ref="tab" value="content">
        <el-tab-pane label="SLA内容" name="content">
          <div v-html="detailData.content"></div>
        </el-tab-pane>
      </el-tabs>
    </common-detail>
  </div>
</template>
<script lang="ts">
import useTable from 'hooks/useTable'
import useSelection from 'hooks/useSelection'
import { columns, searchConfigs as searchConfig } from './config'
import { getSla, removeSla, getSlaDetail, operateSla, batchOperateSla } from 'services/services/sla'
import { getCatalog } from 'services/services/spec'
import { getService } from 'services/services/service'
import { defineComponent, ref } from '@vue/composition-api'
import { MessageBox, Message } from 'element-ui'
import { ISla } from '@/models/sla'
import { skuStatusFilter } from '../sku/filter'

export default defineComponent({
  setup(props, context) {
    const { list, params, total, loading, getList, handleDelete } = useTable<ISla>({
      getService: getSla,
      removeService: removeSla
    })
    function handleCreate(data: ISla) {
      if (data) {
        context.root.$router.push({
          name: 'sla_update',
          query: { id: String(data.id) }
        })
      } else {
        context.root.$router.push({
          name: 'sla_create'
        })
      }
    }
    function handleOperate(record: ISla, action: string) {
      let tip
      switch (action) {
        case 'enable':
          tip = '启用'
          break
        case 'disable':
          tip = '禁用'
          break
        default:
          break
      }
      MessageBox.confirm(`您确定要${tip}【${record.name}】吗？`, '提示', {
        confirmButtonText: '确定',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        operateSla(action, record.id as number).then((data) => {
          if (data.success) {
            Message({
              message: data.message,
              type: 'success'
            })
            getList()
          }
        })
      })
    }
    // 批量操作
    const { selectionIds, handleSelectionChange } = useSelection()
    function batchOperate(action: string) {
      let tip: string = ''
      switch (action) {
        case 'enable':
          tip = '是否启用这些SLA？'
          break
        case 'disable':
          tip = '是否禁用这些SLA？'
          break
      }
      MessageBox.confirm(tip, '提示', {
        type: 'warning'
      }).then(async () => {
        const res = await batchOperateSla(selectionIds.value, action)
        if (res.success) {
          Message.success(res.message)
          getList()
        }
      })
    }
    // 详情
    const detailVisible = ref(false)
    const detailData = ref({})
    async function getDetail(id: number) {
      detailVisible.value = true
      const data = await getSlaDetail(id)
      if (data.success) {
        detailData.value = data.data
      }
    }
    function goBack() {
      detailVisible.value = false
    }
    // 搜索
    const tableRef = ref(null)
    const searchConfigs = ref(searchConfig)
    ;(async function () {
      const res = await getCatalog({ simple: true })
      if (res.success) {
        searchConfigs.value[0].data = res.data.rows
      }
    })()
    searchConfigs.value[0].onChange = async (val: string, listQuery: any) => {
      if (listQuery.serviceId) listQuery.serviceId = ''
      if (!val) {
        searchConfigs.value[1].data = []
        return
      }
      const res = await getService({
        simple: true,
        params: context.root.$tools.handleSearchParam({
          catalogId: val
        })
      })
      if (res.success) {
        searchConfigs.value[1].data = res.data.rows
      }
    }
    return {
      list,
      params,
      total,
      loading,
      getList,
      tableRef,
      columns,
      searchConfigs,
      handleCreate,
      handleDelete,
      // 操作
      handleOperate,
      batchOperate,
      selectionIds,
      handleSelectionChange,
      detailData,
      detailVisible,
      getDetail,
      goBack,
      skuStatusFilter
    }
  }
})
</script>
