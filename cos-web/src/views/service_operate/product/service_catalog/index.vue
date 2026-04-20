<template>
  <div>
    <el-card v-show="!detailVisible" shadow="never">
      <div class="m-b-sm m-l-xs">服务列表</div>
      <table-search :configs="searchConfigs" :onSearch="handleSearch" ref="search" class="service-search m-b-sm">
        <template #operate>
          <el-button type="primary" @click="handlCreate" icon="el-icon-plus">新增 </el-button>
          <el-button @click="openGrantDialog()" :disabled="!serviceIds.length" icon="el-icon-user">批量授权</el-button>
          <el-button @click="batchOperate('PUBLISHED')" :disabled="!serviceIds.length" icon="el-icon-sell">批量上架</el-button>
          <el-button @click="batchOperate('UNPUBLISHED')" :disabled="!serviceIds.length" icon="el-icon-sold-out">批量下架</el-button>
          <!-- <el-button @click="batchBindFlow()" :disabled="!serviceIds.length" icon="el-icon-link">流程绑定 </el-button> -->
          <el-button @click="selectAll()" :disabled="!list.length">
            <svg-icon icon-name="svg-select-all"></svg-icon>
            全选
          </el-button>
        </template>
      </table-search>
      <el-row :gutter="20">
        <el-col v-for="(row, index) in list" :key="index" class="m-b card-container">
          <el-card class="card" :class="{ PUBLISHED: row.status == 'PUBLISHED', UNPUBLISHED: row.status == 'UNPUBLISHED' }">
            <el-row class="card-content">
              <el-checkbox v-model="row.checked" class="cell-check" @change="handleCheckChange"></el-checkbox>
              <el-col :span="4" class="icon-content">
                <img :src="row.icon" alt="" />
              </el-col>
              <el-col :span="16" class="cell-content">
                <p class="cell-title detail-href" @click="getDetail(row)">{{ row.name }} ({{ row.status | flowServiceStatus('name') }})</p>
                <el-tooltip :content="row.remark" placement="bottom-start">
                  <p class="cell-remark">{{ row.remark }}</p>
                </el-tooltip>
              </el-col>
            </el-row>
            <div class="card-footer">
              <div class="pull-right footer-operate">
                <el-button type="text" @click="openBindDialog(row)" v-if="['数据库', '中间件'].includes(row.catalogName)">流程绑定</el-button>
                <el-button type="text" :disabled="row.status == 'SOLDOUT' || row.status == 'UNPUBLISHED'" @click="openGrantDialog(row)">授权 </el-button>
                <el-button type="text" :disabled="row.status == 'PUBLISHED'" @click="handleOperate('PUBLISHED', row)">上架 </el-button>
                <el-button type="text" :disabled="row.status == 'SOLDOUT' || row.status == 'UNPUBLISHED'" @click="handleOperate('UNPUBLISHED', row)"> 下架 </el-button>
                <el-button type="text" :disabled="row.reserved || row.status == 'PUBLISHED'" @click="handlCreate(row)"> 编辑 </el-button>
                <el-button type="text" :disabled="row.reserved || row.status == 'PUBLISHED'" @click="handleDelete(row)"> 删除 </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        <empty v-if="!list.length"> </empty>
      </el-row>
      <el-row>
        <el-col :span="24" class="pull-right">
          <el-pagination class="pull-right" @size-change="handleSizeChange" @current-change="getList" background :current-page.sync="params.page" :page-sizes="[12, 16, 24, 32, 40, 80]" :page-size="params.rows" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
        </el-col>
      </el-row>
    </el-card>
    <AddService v-if="addDialog.visible" :dialog="addDialog" @getData="getList"></AddService>
    <GrantService v-if="grantDialog.visible" :dialog="grantDialog" :service-ids="serviceIds"></GrantService>
    <!--流程绑定-->
    <el-dialog title="流程绑定" :close-on-click-modal="false" v-if="flowDialogVisible" :visible.sync="flowDialogVisible" width="600px">
      <el-alert class="m-b" type="warning" :closable="false" title='服务在申请、变更、延期、退订可分别绑定具体流程，可通过"流程管理"中配置具体流程，如果不绑定流程则在服务操作时不触发流程，操作自动实施和执行。'> </el-alert>
      <basic-form>
        <basic-form-item label="服务申请" v-if="bindData.code !== 'vmware.standard.server'">
          <el-select v-model="bindData.list[0].flowId" clearable filterable>
            <el-option v-for="item in flowList" :key="item.baseLineId" :value="item.baseLineId" :label="item.name"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="服务变更" v-if="bindData.code !== 'vmware.standard.server'">
          <el-select v-model="bindData.list[1].flowId" clearable filterable>
            <el-option v-for="item in flowList" :key="item.baseLineId" :value="item.baseLineId" :label="item.name"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="服务延期" v-if="bindData.code !== 'vmware.standard.server'">
          <el-select v-model="bindData.list[2].flowId" clearable filterable>
            <el-option v-for="item in flowList" :key="item.baseLineId" :value="item.baseLineId" :label="item.name"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="服务退订" v-if="bindData.code !== 'vmware.standard.server'">
          <el-select v-model="bindData.list[3].flowId" clearable filterable>
            <el-option v-for="item in flowList" :key="item.baseLineId" :value="item.baseLineId" :label="item.name"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="虚机克隆" v-if="bindData.code === 'vmware.standard.server'">
          <el-select v-model="bindData.list[4].flowId" clearable filterable>
            <el-option v-for="item in flowList" :key="item.baseLineId" :value="item.baseLineId" :label="item.name"></el-option>
          </el-select>
        </basic-form-item>
      </basic-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="flowDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="bindFlow" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
    <common-detail v-if="detailVisible" :title="detailData.name" @goBack="detailVisible = false">
      <template v-slot:item_container>
        <common-detail-item label="服务名称">{{ detailData.name }}</common-detail-item>
        <common-detail-item label="服务编码">{{ detailData.code }}</common-detail-item>
        <common-detail-item label="服务目录">{{ detailData.catalogName }}</common-detail-item>
        <!-- <common-detail-item label="开启配额">{{ detailData.unit ? '是' : '否' }}</common-detail-item> -->
        <common-detail-item label="开启计费">{{ detailData.billable ? '是' : '否' }}</common-detail-item>
        <common-detail-item v-if="detailData.billable" label="计费策略">{{ detailData.billPolicy === 'spec' ? '规格计费' : '灵活计费' }}</common-detail-item>
        <common-detail-item v-if="detailData.templateId" label="作业模板">{{ detailData.templateName }}</common-detail-item>
        <common-detail-item label="服务描述">{{ detailData.remark }}</common-detail-item>
      </template>
      <ServiceDetail :data="detailData"></ServiceDetail>
    </common-detail>
  </div>
</template>
<script lang="ts">
import { cloneDeep } from 'lodash-es'
import { IService } from '@/models/service'
import { batchOperateServices, operateService, getService, removeService, bindFlowToService, batchbindFlowToService } from 'services/services/service'
import { getCatalog } from 'services/services/spec'
import { getFlow } from 'services/services/flow'
import { getTemplateDetail } from 'services/task/task'
import AddService from './addService.vue'
import ServiceDetail from './serviceDetail.vue'
import GrantService from './GrantService.vue'
import { statusList, flowConfig } from './config'
import { MessageBox, Message } from 'element-ui'
import { handleSearchParam } from 'cmp-element/utils'
import { defineComponent, ref, Ref } from '@vue/composition-api'
import useTable from 'hooks/useTable'

const searchConfig = [
  { type: 'Select', label: '服务目录', value: 'catalogId', data: [] },
  { type: 'Select', label: '服务状态', value: 'status', data: statusList },
  { type: 'Input', label: '服务名称', value: 'name' }
]
export default defineComponent({
  components: {
    AddService,
    ServiceDetail,
    GrantService
  },
  setup(props, context) {
    // 列表
    const searchConfigs = ref(searchConfig)
    ;(async function () {
      const data = await getCatalog({ page: 1, rows: 9999 })
      if (data.success) {
        searchConfigs.value[0].data = data.data.rows
      }
    })()
    const { list, total, params, getList, handleDelete, loading } = useTable<IService>({
      getService: getService,
      removeService: removeService,
      rows: 12,
      listFormat: (data: IService[]) => {
        return data.map((item: IService) => {
          return {
            ...item,
            checked: false
          }
        })
      },
      afterGetList: handleCheckChange
    })
    function handleSearch(param: string) {
      params.value.page = 1
      params.value.params = param
      getList()
    }
    function handleSizeChange(val: number) {
      params.value.page = 1
      params.value.rows = val
      getList()
    }

    // 新增
    const addDialog = ref({ visible: false, record: {} })
    function handlCreate(record = {}) {
      addDialog.value = {
        visible: true,
        record: { ...record }
      }
    }
    // 详情
    const detailVisible = ref(false)
    const detailData: Ref<IService> = ref({})
    async function getDetail(record: IService) {
      detailData.value = record
      if (record.templateId) {
        const res = await getTemplateDetail(record.templateId)
        detailData.value.templateName = res.data.name
      }
      detailVisible.value = true
    }
    // 授权
    const grantDialog = ref({
      visible: false,
      record: {}
    })
    const serviceIds: Ref<number[]> = ref([])
    function handleCheckChange() {
      serviceIds.value = list.value.filter((item: IService) => item.checked).map((item: IService) => item.id) as number[]
    }
    async function openGrantDialog(record = {}) {
      grantDialog.value = {
        visible: true,
        record
      }
    }
    // 单个上下架
    function handleOperate(action: string, row: any) {
      let tip
      switch (action) {
        case 'PUBLISHED':
          tip = '上架'
          break
        case 'UNPUBLISHED':
          tip = '下架'
          break
        default:
          break
      }
      MessageBox.confirm(`您确定要${tip}【${row.name}】吗？`, '提示', {
        confirmButtonText: tip,
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        operateService(action, row.id).then((data) => {
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
    // 批量上下架
    function batchOperate(action: 'PUBLISHED' | 'UNPUBLISHED') {
      let tip: string = ''
      switch (action) {
        case 'PUBLISHED':
          tip = '是否上架这些服务？'
          break
        case 'UNPUBLISHED':
          tip = '是否下架这些服务？'
          break
      }
      MessageBox.confirm(tip, '提示', {
        type: 'warning'
      }).then(async () => {
        const res = await batchOperateServices(serviceIds.value, action)
        if (res.success) {
          Message.success(res.message)
          getList()
        }
      })
    }
    // 流程绑定
    interface IBindData {
      id: number
      list: any[]
      code: string
    }
    const bindData: Ref<IBindData> = ref({
      id: 0,
      list: [],
      code: ''
    })
    const flowList = ref([])
    const flowDialogVisible = ref(false)
    const openBindDialog = async (row: IService) => {
      bindData.value = {
        id: row.id as number,
        list: cloneDeep(row.flowList),
        code: row.code as string
      }
      const res = await getFlow({
        simple: true,
        params: handleSearchParam({
          state: 'ACTIVE'
        }),
        full: true
      })
      if (res.success) {
        flowList.value = res.data.rows
      }
      flowDialogVisible.value = true
    }
    async function bindFlow() {
      const { id, list } = bindData.value
      loading.value = true
      let data = null
      if (id) {
        // 单个
        data = await bindFlowToService(id, list)
      } else {
        // 批量
        data = await batchbindFlowToService(serviceIds.value, list)
      }
      if (data.success) {
        Message.success(data.message)
        flowDialogVisible.value = false
        getList()
      }
      loading.value = false
    }
    // 批量绑定流程
    function batchBindFlow() {
      openBindDialog({
        flowList: cloneDeep(flowConfig)
      })
    }

    function selectAll() {
      for (const item of list.value) {
        item.checked = true
      }
      handleCheckChange()
    }

    return {
      searchConfigs,
      list,
      total,
      params,
      loading,
      getList,
      handleSearch,
      handleSizeChange,
      handleDelete,
      // 新增
      addDialog,
      handlCreate,
      // 详情
      detailData,
      detailVisible,
      getDetail,
      // 授权
      grantDialog,
      openGrantDialog,
      serviceIds,
      handleCheckChange,
      // 下架
      handleOperate,
      batchOperate,
      // 流程绑定
      flowList,
      flowDialogVisible,
      bindData,
      openBindDialog,
      bindFlow,
      batchBindFlow,
      selectAll
    }
  }
})
</script>
<style lang="scss" scoped>
@import '@/views/task/scene/card';
.cell-check {
  position: absolute;
  top: -15px;
  left: -15px;
}
</style>
