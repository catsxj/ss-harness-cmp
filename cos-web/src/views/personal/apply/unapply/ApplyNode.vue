<template>
  <basic-form>
    <card-layout title="节点审批" v-if="instanceStatus === 'TOAUDIT'">
      <el-col :span="24">
        <!-- 当只有一个审批节点时不展示 -->
        <el-form-item label="审批节点：" v-show="nodeList.length > 1">
          <el-select v-model="applyData.id" @change="selectNode">
            <el-option v-for="(item, index) in nodeList" :key="index" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="审批意见：">
          <el-input type="textarea" v-model="applyData.remark"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="上传图片：">
          <el-upload class="upload-demo" ref="upload" accept="image/*" :action="`/fms/v1/instances/${applyData.id}/nodes`" :multiple="true" :limit="10" :on-change="changeFile" list-type="picture-card" :file-list="fileList" :on-preview="handlePictureCardPreview" :auto-upload="false">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="下一审批人：">
          <el-tag class="m-r-xs" v-for="(item, index) in nextActorNames" :key="item + index">{{ item }}</el-tag>
        </el-form-item>
      </el-col>
    </card-layout>
    <AttributeItem class="apply-node" :current-node="record.variableMap" ref="nodeRef" :disabled="!isEditable"></AttributeItem>
    <el-col :span="24" class="text-center" v-if="instanceStatus === 'TOAUDIT'">
      <el-button type="danger" :loading="loading" class="w-md m-r" @click="submit('nopass')">拒绝</el-button>
      <el-button type="primary" :loading="loading" class="w-md" @click="submit('pass')">通过</el-button>
    </el-col>
    <el-dialog title="图片预览" :visible.sync="dialogVisible" append-to-body>
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </basic-form>
</template>
<script lang="ts">
import AttributeItem from '../components/attributeItem.vue'
import { auditNode, getFlowNodes, getFlowDetail } from 'services/services/flow'
import { defineComponent, reactive, ref, toRefs } from '@vue/composition-api'
import { Message } from 'element-ui'

interface IProps {
  record: any
  instanceStatus: string
  nodes: any
}
export default defineComponent({
  components: { AttributeItem },
  props: {
    record: {
      type: Object
    },
    instanceStatus: {
      type: String
    }
  },
  provide() {
    return {
      // 管理端会用到这个,为保持统一,租户端也加了这个
      isInApproval: this.instanceStatus !== 'TOAUDIT'
    }
  },
  setup(props: IProps, context) {
    type IState = {
      applyData: any
      nodeList: any[]
      fileList: any[]
      dialogImageUrl: string
      dialogVisible: boolean
      nextActorNames: string
      loading: boolean
      nodeDetail: any
      isEditable: boolean
    }
    const state: IState = reactive({
      applyData: {},
      fileList: [],
      nodeList: [],
      dialogVisible: false,
      dialogImageUrl: '',
      nextActorNames: '',
      loading: false,
      flowDetail: {},
      isEditable: false
    })
    // 获取当前节点的流程图详情
    async function getFlowDetailFuc() {
      if (!props.record.defId) return
      const data = await getFlowDetail(props.record.defId)
      if (data.success) {
        data.data.graph = JSON.parse(data.data.graph || '[]')
        state.flowDetail = data.data
      }
    }
    async function getNodeList() {
      await getFlowDetailFuc()
      const data = await getFlowNodes(props.record.id, 'audit')
      if (data.success) {
        state.nodeList = data.data
        state.applyData.id = state.nodeList[0].id
        selectNode()
      }
    }
    // 待审批时
    if (props.instanceStatus === 'TOAUDIT') {
      getNodeList()
    }
    function selectNode() {
      const item: any = state.nodeList.find((item: any) => item.id === state.applyData.id)
      // 当前工单审批节点对应的流程图节点
      const nodeId = item.nodeId
      const flowNodeDetail = state.flowDetail.graph.find((item: any) => item.id === nodeId)
      state.isEditable = flowNodeDetail.isEditable
      console.log('当前节点是否可以审批: ', state.isEditable ? '是' : '否')
      if (item.nextActorNames) {
        state.nextActorNames = item.nextActorNames.split(',')
      }
    }
    function changeFile(file: any, fileList: any) {
      const isLt2M = file.size / 1024 / 1024 < 2
      if (isLt2M) {
        state.fileList = fileList
      } else {
        const index = fileList.length - 1
        fileList.splice(index, 1)
        return Message.error('上传图片大小不能超过 2MB!')
      }
    }
    function handlePictureCardPreview(file: any) {
      state.dialogImageUrl = file.url
      state.dialogVisible = true
    }
    // 提交
    const nodeRef = ref()
    async function submit(auditFlag: string) {
      if (!state.applyData.id) return Message.error('请选择审批节点')
      const params = nodeRef.value.getPostData()
      if (!params) return
      console.log(JSON.parse(JSON.stringify('审批参数:', params)))
      const { remark, id } = state.applyData
      if (!remark && auditFlag === 'nopass') return Message.error('拒绝工单审批意见必填')
      const formData = new FormData()
      formData.append('action', 'audit')
      formData.append('auditFlag', auditFlag)
      remark && formData.append('remark', remark)
      if (params) {
        formData.append('ApplyParams', JSON.stringify(params))
      }
      state.fileList.forEach((item: any) => {
        formData.append('attachments', item.raw)
      })
      state.loading = true
      const res = await auditNode(id, formData).finally(() => {
        state.loading = false
      })
      if (res.success) {
        Message.success({
          message: res.message,
          showClose: true
        })
        context.emit('goBack')
      }
    }
    return {
      ...toRefs(state),
      nodeRef,
      selectNode,
      changeFile,
      handlePictureCardPreview,
      submit
    }
  }
})
</script>
