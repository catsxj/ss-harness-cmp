<template>
  <div class="sku-container">
    <el-card class="left-menu" shadow="never">
      <div slot="header">服务分类</div>
      <el-tree highlight-current node-key="key" :default-expanded-keys="defaultExpandedKeys" icon-class="el-icon-arrow-right" :data="serviceTree" :props="{ label: 'name' }" @node-click="selectService" ref="treeRef">
        <span class="custom-tree-node" slot-scope="{ node }" :title="node.label">
          {{ node.label }}
        </span>
      </el-tree>
    </el-card>
    <div class="right-panel">
      <AdvanceTable title="规格列表" ref="tableRef" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" @selection-change="handleSelectionChange">
        <template v-slot:action>
          <el-button type="primary" @click="handleCreate()" :disabled="!serviceItem.id" icon="el-icon-plus"> 新增 </el-button>
          <el-button @click="batchOperate('enable')" :disabled="!selectionIds.length" icon="el-icon-video-pause">批量启用 </el-button>
          <el-button @click="batchOperate('disable')" :disabled="!selectionIds.length"> <svg-icon icon-name="svg-disabled" /> 批量禁用 </el-button>
        </template>
        <template #code="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #status="status">
          <status-icon :type="skuStatusFilter(status, 'color')">
            {{ skuStatusFilter(status) }}
          </status-icon>
        </template>
        <template #reserved="reserved">
          {{ reserved | booleanFilter }}
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="handleCreate(record)" :disabled="record.status === 'enable'"><i class="el-icon-edit"></i> 编辑</el-button>
          <div class="action-divider"></div>
          <el-button type="text" @click="handleDelete(record)" :disabled="record.status === 'enable'"><i class="el-icon-delete"></i> 删除</el-button>
          <div class="action-divider"></div>
          <el-button type="text" v-if="record.status === 'disable'" @click="handleOperate(record, 'enable')"><i class="el-icon-video-pause"></i> 启用</el-button>
          <el-button type="text" v-else @click="handleOperate(record, 'disable')"> <svg-icon icon-name="svg-disabled"></svg-icon> 禁用 </el-button>
        </template>
      </AdvanceTable>
      <!--详情界面-->
      <SkuDetail v-if="detailVisible" :detail-data="detailData" :service-item="serviceItem" @goBack="detailVisible = false"></SkuDetail>
      <AddDialog v-if="addDialog.visible" :dialog="addDialog" @getData="getList"></AddDialog>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, nextTick, ref, Ref } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import { skuStatusFilter } from './filter'
import useTable from 'hooks/useTable'
import useSelection from 'hooks/useSelection'
import { columns, searchConfigs as searchConfig } from './config'
import { getServiceTree, getServiceDetail } from 'services/services/service'
import { getSku, removeSku, batchOperateSku } from 'services/services/spec'
import AddDialog from './addDialog.vue'
import SkuDetail from './SkuDetail.vue'
import { ISku } from '@/models/sku'
function handleTreeData(data: any) {
  return data.map((item: any) => {
    let children = null
    if (item.children?.length) {
      children = handleTreeData(item.children)
    }
    return {
      ...item,
      children,
      key: `${item.name}${item.id}`
    }
  })
}
export default defineComponent({
  components: { AddDialog, SkuDetail },
  setup(props, context) {
    const { list, total, getList, params, loading, handleDelete } = useTable<ISku>({
      getService: getSku,
      removeService: removeSku,
      deleteTipKey: 'code'
    })
    const { selectionIds, handleSelectionChange } = useSelection()
    //
    const serviceTree = ref([])
    const treeRef = ref()
    const defaultExpandedKeys: Ref<string[]> = ref([])
    ;(async function () {
      const res = await getServiceTree()
      const result: any = handleTreeData(res.data)
      serviceTree.value = result
      defaultExpandedKeys.value = [result[0]?.key, result[0]?.children[0]?.key]
      selectService(result[0]?.children[0]?.children[0])
      await nextTick()
      treeRef.value.setCurrentKey(result[0]?.children[0]?.children[0].key)
    })()
    // 获取服务
    const serviceItem = ref({})
    async function selectService(item: any) {
      // 非最终服务类型，直接return
      if (!item.code) return
      searchConfigs.value[1].initValue = item.id
      await nextTick()
      ;(tableRef.value as any).handleSearch()
      const res = await getServiceDetail(item.serviceId)
      if (res.success) {
        serviceItem.value = {
          ...res.data,
          categoryId: item.id
        }
      }
    }
    // 详情
    const detailVisible = ref(false)
    const detailData = ref({})
    async function getDetail(record: any) {
      detailData.value = record
      detailVisible.value = true
    }
    // 新增产品
    const addDialog = ref({
      visible: false,
      record: {},
      serviceItem: {}
    })
    function handleCreate(record = {}) {
      addDialog.value = {
        visible: true,
        record: { ...record },
        serviceItem
      }
    }
    // 操作
    async function operate(tip: string, ids: number[], action: string) {
      MessageBox.confirm(tip, '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const res = await batchOperateSku(ids, action)
        if (res.success) {
          Message.success(res.message)
          getList()
        }
      })
    }
    function handleOperate(record: any, action: string) {
      let tip
      switch (action) {
        case 'enable':
          tip = '启用'
          break
        case 'disable':
          tip = '禁用'
          break
      }
      operate(`您确定要${tip}【${record.code}】吗?`, [record.id], action)
    }
    // 批量操作
    function batchOperate(action: string) {
      let tip: string = ''
      switch (action) {
        case 'enable':
          tip = '是否启用这些规格？'
          break
        case 'disable':
          tip = '是否禁用这些规格？'
          break
      }
      operate(tip, selectionIds.value, action)
    }
    // 搜索数据加载
    const tableRef = ref(null)
    const searchConfigs = ref(searchConfig)
    return {
      serviceTree,
      tableRef,
      searchConfigs,
      selectionIds,
      handleSelectionChange,
      columns,
      list,
      total,
      getList,
      params,
      loading,
      handleDelete,
      // 获取服务
      treeRef,
      defaultExpandedKeys,
      serviceItem,
      selectService,
      // 详情
      detailVisible,
      detailData,
      getDetail,
      addDialog,
      handleCreate,
      // 状态操作
      handleOperate,
      batchOperate,
      skuStatusFilter
    }
  }
})
</script>

<style scoped lang="scss">
.sku-container {
  width: 100%;
  display: flex;
  .left-menu {
    width: 200px;
    margin-right: 10px;
    .custom-tree-node {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .right-panel {
    flex: 1;
    overflow: hidden;
  }
}
.mini_text {
  font-size: 12px !important;
  color: darkgray;
}
</style>
