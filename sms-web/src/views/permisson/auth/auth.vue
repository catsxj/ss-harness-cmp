<template>
  <el-row :gutter="10">
    <el-col :span="24" class="m-b">
      <el-alert title="警告" type="warning" show-icon :closable="false" description="非专业人士请勿操作或者在专业人士指导下进行设置"></el-alert>
    </el-col>
    <el-col :span="6" style="width: 286px">
      <el-card class="service-menu">
        <template #header>
          <el-button type="primary" style="width: 100%" size="small" @click="handleCreate()">
            <el-icon><Plus /></el-icon> 添加根节点
          </el-button>
        </template>
        <el-row>
          <el-col :span="24">
            <el-tree highlight-current node-key="id" :data="dataSource" :props="{ label: 'name' }" @node-click="handleNodeClick" :accordion="true" @node-drop="handleDrop" @node-expand="handleExpand" @node-collapse="handleCollapse" :default-expanded-keys="expandenKeys" ref="authTree" draggable>
              <template #default="{ node, data }">
                <span class="custom-tree-node">
                  <div class="custom-tree-node-wrapper">
                    <span class="custom-tree-node-label">{{ node.label }}</span>
                    <span class="operate-btns">
                      <el-dropdown trigger="hover" class="custom-tree-menu" size="small">
                        <el-icon class="rotate"><More /></el-icon>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item @click="handleCreate('update', data.id)"> 编辑 </el-dropdown-item>
                            <el-dropdown-item v-if="data.id" @click="remove(data.id)"> 删除 </el-dropdown-item>
                            <el-dropdown-item v-if="data.id && data.category !== 'button'" @click="handleCreate('create', data.id)"> 新增子节点 </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </span>
                  </div>
                </span>
              </template>
            </el-tree>
          </el-col>
        </el-row>
      </el-card>
    </el-col>
    <el-col :span="18" style="width: calc(100% - 286px)">
      <el-card>
        <template #header><div>权限详情</div></template>
        <span :title="nodeData.name" class="authDetail">菜单名称：{{ nodeData.name }}</span>
        <span :title="nodeData.router" class="authDetail">路由名称：{{ nodeData.router }}</span>
        <span :title="nodeData.component" class="authDetail">组件名称：{{ nodeData.component }}</span>
        <span :title="nodeData.path" class="authDetail">路由地址：{{ nodeData.path }}</span>
        <span :title="nodeData.redirect" class="authDetail">重定向地址：{{ nodeData.redirect }}</span>
      </el-card>
      <el-row :gutter="10" class="m-t">
        <el-col :span="24">
          <el-card>
            <template #header><div>按钮列表</div></template>
            <el-form :inline="true">
              <el-form-item>
                <el-button type="primary" size="small" :disabled="!isLeaf" @click="handleCreate('create', nodeData.id, 'button')">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
            <!-- TODO: cmp-element basic-table -->
            <basic-table :data="buttonList">
              <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
              <el-table-column show-overflow-tooltip label="编码" prop="meta"> </el-table-column>
              <el-table-column show-overflow-tooltip label="操作" width="160px">
                <template #default="scope">
                  <el-button link @click="handleCreate('update', scope.row.id, 'button')">
                    <el-icon><Edit /></el-icon> 编辑
                  </el-button>
                  <div class="action-divider"></div>
                  <el-button link @click="remove(scope.row.id, 1)">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </template>
              </el-table-column>
              <template #pagination><div></div></template>
            </basic-table>
          </el-card>
        </el-col>
      </el-row>
      <AuthAddDialog :dialog="addData" v-if="addData.visible" :authtype="type" @get-data="getList" @get-button-list="getButtonList"></AuthAddDialog>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, More } from '@element-plus/icons-vue'
import AuthAddDialog from './AddDialog.vue'
import { cloneDeep } from 'lodash-es'
import { getAuth, getAuthByCategory, removeAuth, modifyAuth } from 'services/system/auth'
import { usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'

const permissionStore = usePermissionStore()

const dataSource = ref<any[]>([])
const addData = ref<any>({})
const nodeData = ref<any>({})
const expandenKeys = ref<any[]>([])
const buttonList = ref<any[]>([])
const type = ref<string>('')
const isLeaf = ref(false)
const authTree = ref<any>(null)

onMounted(() => {
  getList()
})

function handleNodeClick(data: any) {
  nodeData.value = data
  isLeaf.value = !nodeData.value.childs
  getButtonList()
}

async function changeRoutes() {
  const { asyncRouterMap } = await import('@/router')
  return permissionStore.changeRoutes(asyncRouterMap, router, resetRouter)
}

function handleDrop(draggingNode: any, dropNode: any, dropType: string) {
  const dragNode = cloneDeep(draggingNode.data)
  const dropNodes = cloneDeep(dropNode.data)
  switch (dropType) {
    case 'after':
      dragNode.parentId = dropNodes.parentId
      dragNode.priority = ++dropNodes.priority
      break
    case 'before': {
      dragNode.parentId = dropNodes.parentId
      const priority = --dropNodes.priority
      dragNode.priority = priority > 0 ? priority : 1
      break
    }
    case 'inner':
      dragNode.parentId = dropNodes.id
      break
  }
  updateMenu(dragNode)
}

function updateMenu(data: any) {
  modifyAuth(data).then((res: any) => {
    if (res.success) {
      ElMessage.success(res.message)
      changeRoutes()
      getList()
    }
  })
}

function remove(id: number, index?: number) {
  ElMessageBox.confirm('您确定要删除该权限吗？', '提示', { type: 'warning' }).then(() => {
    removeAuth(id).then((data: any) => {
      if (data.success) {
        ElMessage.success(data.message)
        if (!index) {
          nodeData.value = {}
          getList()
          changeRoutes()
        } else {
          getButtonList()
        }
      }
    })
  })
}

async function getList() {
  const data = await getAuth({ parentId: null, tenant: false })
  if (data.success) {
    dataSource.value = data.data
    await nextTick()
    if (nodeData.value.id) {
      authTree.value?.setCurrentKey(nodeData.value.id)
    }
  }
}

async function getButtonList() {
  const data = await getAuthByCategory({ parentId: nodeData.value.id, category: 'button' })
  if (data.success) {
    buttonList.value = data.data
  }
}

function handleCreate(createType: 'create' | 'update' = 'create', id?: number, category?: string) {
  addData.value = { visible: true, id, type: createType }
  if (category === 'button') {
    type.value = 'button'
  } else if (category === 'api') {
    type.value = 'api'
  } else {
    type.value = 'menu'
  }
}

function handleExpand(data: any) {
  expandenKeys.value.push(data.id)
}

function handleCollapse(data: any) {
  const index = expandenKeys.value.indexOf(data.id)
  expandenKeys.value.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.authDetail {
  display: inline-block;
  width: calc(100% / 3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.tree .el-tree-node__expand-icon.expanded) {
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}
:deep(.el-icon-caret-right:before) {
  content: '\e6e0';
  font-size: 14px;
}
:deep(.el-tree-node__content) {
  position: relative;
  height: 32px;
  line-height: 32px;
  .operate-btns {
    position: absolute;
    right: 2px;
    display: none;
  }
  &:hover,
  :focus-within {
    .operate-btns {
      display: inline;
      color: #000;
      .rotate {
        cursor: pointer;
        margin-left: 5px;
        transform: rotate(90deg);
        color: #409eff;
        background-color: #ecf5ff;
      }
    }
  }
}
.custom-tree-menu {
  &:hover li {
    background-color: #ecf5ff;
    color: #409eff !important;
  }
}
</style>
