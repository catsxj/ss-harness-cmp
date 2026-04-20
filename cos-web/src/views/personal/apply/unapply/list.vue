<template>
  <div class="wrapper">
    <div v-show="!detailVisible && !applyDialog.visible">
      <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading" ref="multipleTable" @selection-change="handleSelectionChange">
        <!-- <template v-slot:action>
          <el-button type="ghost" @click="batchApply" :disabled="!selectionIds.length" icon="el-icon-help">批量审批</el-button>
        </template> -->
        <template #instanceNo="val, record">
          <span class="detail-href" @click="getDetail(record)">{{ val }}</span>
        </template>
        <template #applyCategory="val">
          {{ val | categoryFilter }}
        </template>
        <template #instanceState="val">
          <status-icon :type="val | templateStatusFilter('color')">
            {{ val | templateStatusFilter('status') }}
          </status-icon>
        </template>
        <template #operate="val, record">
          <el-button type="text" @click="approvalRecord(record)" icon="el-icon-help">审批</el-button>
        </template>
      </AdvanceTable>
    </div>
    <ApplyDetail v-if="detailVisible" :record="currentRecord" instance-status="TOAUDIT" @goBack="goBack"></ApplyDetail>
    <ApplyExecute v-if="applyDialog.visible" instance-status="TOAUDIT" :configs="applyDialog" @getData="getList"></ApplyExecute>
    <BatchApply :configs="batchApplyDialog" v-if="batchApplyDialog.visible" @getData="getList"></BatchApply>
  </div>
</template>
<script lang="ts">
import { columns, searchConfigs } from './config'
import ApplyDetail from '../ApplyDetail.vue'
import ApplyExecute from './ApplyExecute.vue'
import { getFlowInstance } from 'services/services/flow'
import BatchApply from './BatchApply.vue'
import { defineComponent, ref, Ref } from '@vue/composition-api'
import useTable from 'hooks/useTable'
import useSelection from 'hooks/useSelection'
export default defineComponent({
  components: {
    ApplyDetail,
    ApplyExecute,
    BatchApply
  },
  setup() {
    const { getList, loading, params, total, list } = useTable({
      getService: getFlowInstance,
      params: {
        type: 'TOAUDIT'
      }
    })
    const { selectionIds, handleSelectionChange } = useSelection()
    // 详情
    const detailVisible = ref(false)
    const currentRecord = ref({})
    function getDetail(record: any) {
      detailVisible.value = true
      currentRecord.value = record
    }
    // 详情返回
    function goBack() {
      detailVisible.value = false
      getList()
    }
    // 单个审批
    const applyDialog = ref({
      visible: false,
      record: {}
    })
    function approvalRecord(record: any) {
      applyDialog.value = {
        visible: true,
        record: { ...record }
      }
    }
    // 批量审批
    interface IBatchDialog {
      visible: boolean
      ids: number[]
    }
    const batchApplyDialog: Ref<IBatchDialog> = ref({
      visible: false,
      ids: []
    })
    function batchApply() {
      batchApplyDialog.value = {
        visible: true,
        ids: selectionIds.value
      }
    }
    return {
      getList,
      loading,
      params,
      total,
      list,
      columns,
      searchConfigs,
      // 多选
      selectionIds,
      handleSelectionChange,
      // 详情
      detailVisible,
      currentRecord,
      getDetail,
      goBack,
      // 审批
      applyDialog,
      approvalRecord,
      batchApplyDialog,
      batchApply
    }
  }
})
// export default {
//   components: {
//     detail, judge, Viewer
//   },
//   data () {
//     return {
//       searchConfigs,
//       columns,
//       loading: false,
//       list: null,
//       total: null,
//       params: {
//         page: 1,
//         rows: 10,
//         type: 'TOAUDIT'
//       },
//       detailFlag: false,
//       instanceId: 0,
//       flowId: 0,
//       instanceState: '',
//       judgeFlag: false,
//       jundgeList: [],
//       jundgeData: {},
//       nextActorNames: '',
//       dialogImageUrl: '',
//       dialogVisible: false,
//       fileList: [],
//       selectList: [],
//       idList: [],
//       allJudgeData: {
//         dialog: false,
//         data: {}
//       }
//     }
//   },
//   created () {
//   },
//   methods: {
//     initViewer (viewer) {
//       this.$viewer = viewer
//     },
//     allJudge () {
//       this.refreshId()
//       this.allJudgeData = {
//         dialog: true,
//         data: {
//           ids: this.idList
//         }
//       }
//     },
//     refreshId () {
//       this.idList = []
//       this.selectList.forEach(item => {
//         this.idList.push(item.id)
//       })
//     },
//     // 单选
//     handleSelectItem (selection, row) {
//       this.refreshId()
//       if (this.idList.indexOf(row.id) > -1) {
//         for (let j = 0; j < this.selectList.length; j++) {
//           const item = this.selectList[j]
//           if (item.id == row.id) {
//             this.selectList.splice(j, 1)
//             break
//           }
//         }
//       } else {
//         this.selectList.push(row)
//       }
//     },
//     // 全选
//     handleSelectAll (selection) {
//       this.refreshId()
//       if (selection.length) { // 全选情况下
//         selection.forEach(item => {
//           if (this.idList.indexOf(item.id) == -1) {
//             this.selectList.push(item)
//           }
//         })
//       } else { // 全不选情况下
//         this.list.forEach(item => {
//           if (this.idList.indexOf(item.id) > -1) {
//             for (let j = 0; j < this.selectList.length; j++) {
//               const row = this.selectList[j]
//               if (item.id == row.id) {
//                 this.selectList.splice(j, 1)
//                 break
//               }
//             }
//           }
//         })
//       }
//     },
//     handlePictureCardPreview (file) {
//       this.dialogImageUrl = file.url;
//       this.$viewer.show()
//     },
//     handleRemove (file, fileList) {
//       this.fileList = fileList
//     },
//     changeFile (file, fileList) {
//       const isLt2M = file.size / 1024 / 1024 < 2;
//       if (isLt2M) {
//         this.fileList = fileList
//       } else {
//         const index = fileList.length - 1;
//         fileList.splice(index, 1)
//         return this.$message.error('上传图片大小不能超过 2MB!');
//       }
//     },
//     nodeApprove () {
//       this.jundgeList.forEach(item => {
//         if (item.id == this.jundgeData.id) {
//           this.nextActorNames = item.nextActorNames
//         }
//       })
//     },
//     Click (index) {
//       if (!this.jundgeData.id) return this.$message.error('请选择审批节点')
//       this.jundgeData.auditFlag = index
//       const formData = new FormData();
//       formData.append('action', 'audit')
//       formData.append('params', JSON.stringify(this.jundgeData))
//       this.fileList.forEach(item => {
//         formData.append('attachments', item.raw);
//       })
//       auditNode(this.jundgeData.id, formData).then(data => {
//         if (data.success) {
//           this.$message.success(data.message)
//           this.judgeFlag = false;
//           this.getList();
//         }
//       })
//     },
//     getSelect (id) {
//       getFlowNodes(id, 'audit').then(data => {
//         this.jundgeList = data.data
//         this.jundgeData.id = this.jundgeList[0].id
//         this.nodeApprove()
//       })
//     },
//     judge (id) {
//       this.jundgeData = {
//         id: '',
//         remark: ''
//       }
//       this.fileList = []
//       this.judgeFlag = true
//       this.getSelect(id)
//     },
//     getListReset () {
//       this.selectList = []
//       this.getList();
//     },
//     getList () {
//       this.loading = true
//       getFlowInstance(this.params).then(data => {
//         this.loading = false
//         if (data.success) {
//           this.list = data.data.rows
//           this.total = data.data.total
//           this.list.forEach(item => {
//             const variable = JSON.parse(item.variable)
//             item.remark = variable.ApplyRemark
//           })
//         }
//       })
//     },
//     handleSearch (params) {
//       this.params.page = 1
//       this.params.params = params
//       this.getList()
//     },
//     goBack () {
//       this.detailFlag = false
//       this.getList();
//     },
//     // 跳转详情页
//     getDetail (instanceId, flowId, instanceState) {
//       this.instanceId = instanceId;
//       this.flowId = flowId;
//       this.instanceState = instanceState
//       this.detailFlag = true
//     }

//   }
// }
</script>
