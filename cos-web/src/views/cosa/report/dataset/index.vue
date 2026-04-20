<template>
  <div>
    <section class="wrapper">
      <div :span="4">
        <el-card>
          <div slot="header">
            数据集分组
            <el-tooltip class="item" effect="dark" content="新增根节点" placement="top-start">
              <el-button class="pull-right" type="text" icon="el-icon-plus" @click="createRootNode"></el-button>
            </el-tooltip>
          </div>
          <el-tree :data="treeData" :props="treeProps" draggable :highlight-current="true" :default-expand-all="true" :expand-on-click-node="false" @node-drop="dragNode" @node-click="chooseNode">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span class="custom-tree-node-label">
                {{ node.label }}
              </span>
              <span class="operate-btns">
                <el-dropdown trigger="hover" size="small" @command="handleCommand">
                  <i class="el-icon-more rotate" @click="$event.stopPropagation()" />
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{ type: 'a', data }">新增</el-dropdown-item>
                    <el-dropdown-item :command="{ type: 'e', data }">编辑</el-dropdown-item>
                    <el-dropdown-item :command="{ type: 'd', data }">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
            </span>
          </el-tree>
        </el-card>
      </div>
      <div :span="20">
        <Table :groupId="groupId" @handleCreate="handleCreate"></Table>
      </div>
    </section>
    <el-dialog :visible.sync="treeVisible" :title="nodeData.id ? '编辑分组' : nodeData.parentId == 0 ? '新增根节点' : '新增下级分组'" width="420px">
      <basic-form :model="nodeData" ref="formRef">
        <basic-form-item prop="name" label="名称：" validate="required">
          <el-input v-model="nodeData.name"></el-input>
        </basic-form-item>
      </basic-form>
      <template #footer>
        <el-button @click="treeVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
    <FullScreen title="新增数据集" :visible.sync="fullVisible" :isClose="false">
      <CreateDialog :dialogData="dialogData"></CreateDialog>
    </FullScreen>
  </div>
</template>
<script>
import { getGroup, createGroup, updateGroup, deleteGroup } from 'services/reportform/dataset.js'
import { defineComponent, onMounted, reactive, ref, toRefs } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import Table from './table.vue'
import FullScreen from '../components/fullscreen.vue'
import CreateDialog from './createDialog/index.vue'

export default defineComponent({
  components: {
    Table,
    FullScreen,
    CreateDialog
  },
  setup() {
    const treeProps = {
      children: 'childGroup',
      label: 'name'
    }
    const state = reactive({
      treeData: []
    })
    onMounted(() => {
      getTreeList()
    })
    async function getTreeList() {
      const { data, success } = await getGroup()
      if (success) {
        state.treeData = data.rows
      }
    }
    const nodeData = ref({})
    const treeVisible = ref(false)
    function createRootNode() {
      treeVisible.value = true
      nodeData.value = { parentId: 0 }
    }
    function handleCommand(command) {
      const { type, data } = command
      switch (type) {
        case 'e':
          treeVisible.value = true
          nodeData.value = data
          break
        case 'd':
          if (data.childGroup?.length) {
            Message.warning('当前分组下存在数据集无法删除')
            return
          }
          MessageBox.confirm('您确定要删除该分组吗？', '提示', {
            confirmButtonClass: 'el-button--danger',
            type: 'warning'
          }).then(async () => {
            const { success, message } = await deleteGroup(data.id)
            if (success) {
              Message.success(message)
              getTreeList()
            }
          })
          break
        case 'a':
          treeVisible.value = true
          nodeData.value = { parentId: data.id }
          break
      }
    }
    const formRef = ref()
    function confirm() {
      formRef.value.validate(async valid => {
        if (valid) {
          const { id, name } = nodeData.value
          const fn = id ? updateGroup : createGroup
          const params = id ? { id, name } : { ...nodeData.value }
          const { success, message } = await fn(params, params.id)
          if (success) {
            Message.success(message)
            treeVisible.value = false
            getTreeList()
          }
        }
      })
    }
    async function dragNode(node, pNode, position) {
      const {
        data: { id: currentId }
      } = node
      const {
        data: { id, parentId }
      } = pNode
      const params = position == 'inner' ? { parentId: id, id: currentId } : { parentId, id: currentId }
      const { success, message } = await updateGroup(params, currentId)
      if (success) {
        Message.success(message)
        // getTreeList()
      }
    }
    const groupId = ref(0)
    function chooseNode({ id }) {
      groupId.value = id
    }
    const dialogData = ref({})
    const fullVisible = ref(false)
    async function handleCreate(data) {
      fullVisible.value = true
      dialogData.value = {
        groupId,
        type: data
      }
    }
    return {
      ...toRefs(state),
      treeProps,
      getTreeList,
      createRootNode,
      handleCommand,
      treeVisible,
      nodeData,
      confirm,
      dragNode,
      chooseNode,
      groupId,
      fullVisible,
      handleCreate,
      dialogData,
      formRef
    }
  }
})
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  justify-content: space-between;
  & > div:first-child {
    width: 240px;
  }
  & > div:last-child {
    width: calc(100% - 260px);
  }
}
.custom-tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  .rotate {
    transform: rotate(90deg);
  }
  &:hover {
    .operate-btns {
      display: inline;
    }
  }
}
.operate-btns {
  display: none;
}
</style>
