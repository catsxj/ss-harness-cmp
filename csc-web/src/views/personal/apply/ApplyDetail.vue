<template>
  <common-detail :title="record.name" @goBack="goBack">
    <template v-slot:item_container>
      <common-detail-item label="工单编号">{{ record.instanceNo }}</common-detail-item>
      <common-detail-item label="审批标题">{{ record.name }}</common-detail-item>
      <common-detail-item label="发起时间">{{ record.gmtCreate }}</common-detail-item>
      <common-detail-item label="发起人">{{ record.creatorName }}</common-detail-item>
    </template>
    <el-row :gutter="20">
      <!-- <el-dialog :title="applyDetail.name" width="70%" v-if="applyDetailVisible" :visible.sync="applyDetailVisible" :append-to-body="true">
        <code-mirror height="400px" :value="applyDetail.value" :read-only="true"></code-mirror>
      </el-dialog> -->
      <el-col :span="16">
        <ApplyNode :record="record" :instance-status="instanceStatus" @goBack="goBack"> </ApplyNode>
      </el-col>
      <el-col :span="8">
        <card-layout title="流转记录">
          <el-button @click="getFlowImage" slot="operate" type="text">流程图</el-button>
          <div class="time-line">
            <div class="time-line-div" v-if="record.instanceState !== 'ACTIVE'">
              <p></p>
              <p ref="circular" style="background: #b98aec">结束</p>
              <p></p>
            </div>
            <div v-for="(item, index) in nodes" class="time-line-div" :key="item.id">
              <p>{{ item.gmtFinish }}</p>
              <p ref="circular" :style="item.code === 'DRAFT' ? 'background: #FFC26F' : 'background: #1790FF;'">{{ index == nodes.length - 1 ? '开始' : '审批' }}</p>
              <p v-if="item.code === 'DRAFT'">
                <el-form>
                  <el-form-item label="发起人：" class="m-t-sm">{{ item.operatorName }}</el-form-item>
                </el-form>
              </p>
              <p v-else>
                <el-card shadow="never">
                  <el-form>
                    <el-form-item label="审核人：">{{ item.operatorName }}</el-form-item>
                    <el-form-item label="附件：" v-if="item.attachments">
                      <viewer @inited="viewer => (item.$viewer = viewer)" class="viewer" ref="viewer">
                        <div class="image-item" v-for="img in item.attachments" :key="img.id" @click="item.$viewer.show()">
                          <img title="单击预览" :src="img.path" alt="" />
                        </div>
                      </viewer>
                    </el-form-item>
                    <el-form-item label="备注：">
                      <span style="word-wrap: break-word">
                        {{ item.variableMap.remark }}
                      </span>
                    </el-form-item>
                  </el-form>
                  <div class="el-card-arrow"></div>
                </el-card>
              </p>
              <span class="nodeStatus passBackground" v-if="item.variableMap.auditFlag == 'pass'">√</span>
              <span class="nodeStatus nopassBackground" v-if="item.variableMap.auditFlag == 'nopass'">×</span>
              <span class="nodeStatus nopassBackground" v-if="record.instanceState == 'CANCEL' && item.code === 'DRAFT'">
                <i class="el-icon-refresh-left"></i>
              </span>
            </div>
            <div class="img-dotted" ref="dotted"></div>
          </div>
          <el-dialog title="流程图" width="70%" :visible.sync="dialogFlow" :append-to-body="true">
            <Editor ref="editorRef" :height="450"></Editor>
          </el-dialog>
        </card-layout>
      </el-col>
    </el-row>
  </common-detail>
</template>
<script>
import CodeMirror from 'cmp-element/components/code-mirror'
import ApplyNode from './unapply/ApplyNode.vue'
import Editor from 'views/system/flow/create_flow/flowEdit/detail.vue'
import { getFlowDetail, getFlowNodes } from 'services/services/flow'
import 'viewerjs/dist/viewer.css'
import Viewer from 'v-viewer/src/component.vue'
import { defineComponent, ref } from '@vue/composition-api'
export default defineComponent({
  components: { Editor, Viewer, CodeMirror, ApplyNode },
  props: {
    record: {
      type: Object
    },
    instanceStatus: {
      type: String
    }
  },
  setup(props, context) {
    const nodes = ref([])
    async function getNodes() {
      const res = await getFlowNodes(props.record.id, 'record')
      nodes.value = res.data
    }
    getNodes()
    function handleReadData(data) {
      const graph = {
        nodes: [],
        edges: []
      }
      // nodes.forEach(item => {
      //   nodeMap[item.nodeId] = item;
      // });
      for (const node of data) {
        const { name: label, type: code, transitions, config, id, assignee, assigneeRole } = node
        // const status = nodeMap[id] && (nodeMap[id].nodeState || '').toLowerCase()
        const obj = {
          label,
          id,
          code,
          assignee,
          assigneeRole,
          ...config
          // status
        }
        transitions.forEach(item => {
          const { id, shape, sourceAnchor, targetAnchor, to: target, auditFlag, name: label } = item
          graph.edges.push({ id, shape, sourceAnchor, targetAnchor, target, source: node.id, label, auditFlag })
        })
        graph.nodes.push(obj)
      }
      return graph
    }
    const dialogFlow = ref(false)
    const editorRef = ref()
    async function getFlowImage() {
      dialogFlow.value = true
      const res = await getFlowDetail(props.record.defId)
      if (res.success) {
        editorRef.value.flow.read(handleReadData(JSON.parse(res.data.graph)))
      }
    }
    function goBack() {
      context.emit('goBack')
    }
    return {
      nodes,
      dialogFlow,
      editorRef,
      getFlowImage,
      goBack
    }
  }
})
</script>
<style scoped lang="scss">
.time-line {
  position: relative;
  width: 100%;
  margin: 0 auto;
  & >>> .el-card__body {
    padding: 10px !important;
  }
  & >>> .el-form-item {
    margin-bottom: 5px !important;
    .el-form-item__label,
    .el-form-item__content {
      font-size: 12px;
    }
  }
  .el-card-arrow {
    position: absolute;
    top: 25px;
    left: 5px;
    width: 10px;
    height: 10px;
    border: 1px solid #dcdfe6;
    border-top: none;
    border-right: none;
    transform: rotate(45deg);
  }
}
.time-line-div {
  position: relative;
  min-height: 85px;
  width: calc(100% - 150px);
}
.time-line-div > p:nth-child(1) {
  position: absolute;
  left: 0;
  top: 10px;
  width: 100px;
  font-size: 12px;
  text-align: center;
  color: #999;
}
.time-line-div > p:nth-child(2) {
  position: absolute;
  left: 100px;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  top: 0px;
  color: #ffffff;
  border-radius: 50%;
  z-index: 10;
}
.nodeStatus {
  width: 15px;
  height: 15px;
  line-height: 15px;
  text-align: center;
  border-radius: 50%;
  color: #fff;
  position: absolute;
  left: 137px;
  top: 45px;
  z-index: 20;
}
.passBackground {
  background-color: #27c24c;
}
.nopassBackground {
  background-color: #f56c6c;
}
.time-line-div > p:nth-child(3) {
  position: relative;
  left: 150px;
  top: 5px;
  padding: 10px;
  border-radius: 10px;
}
.img-dotted {
  position: absolute;
  width: 20px;
  height: calc(100% - 85px);
  top: 15px;
  left: 125px;
  z-index: 1;
  border-left: 1px solid #cccccc;
}
.image-item {
  position: relative;
  display: inline-block;
  height: 60px;
  width: 60px;
  margin-right: 10px;
  border: 1px solid #eee;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
  }
  &:hover {
    .image-operate {
      display: inline-block;
    }
  }
  .image-operate {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    color: #fff;
    font-size: 15px;
    width: 100%;
    height: 100%;
    line-height: 60px;
    text-align: center;
    background: rgba(0, 0, 0, 0.5);
  }
}
.attr {
  margin-bottom: 5px;
}
.cm-s-rubyblue.CodeMirror {
  height: 400px !important;
}
</style>
