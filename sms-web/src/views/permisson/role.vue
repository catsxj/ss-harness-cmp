<template>
  <div>
    <!-- TODO: cmp-element AdvanceTable -->
    <AdvanceTable title="角色列表" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template #action>
        <el-button type="primary" @click="handleCreate()">
          <el-icon><Plus /></el-icon>新增
        </el-button>
      </template>
      <template #status="status">
        <!-- TODO: cmp-element status-icon -->
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #diskDelShow="{ val, record }">
        <el-switch v-model="record.diskDelShow" @change="handleDiskDelShow(record)" active-text="展示" inactive-text="隐藏"></el-switch>
      </template>
      <template #operate="{ val, record }">
        <el-button type="text" @click="handleCreate(record)">
          <el-icon><Edit /></el-icon> 编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record.id)">
          <el-icon><Delete /></el-icon> 删除
        </el-button>
        <div class="action-divider"></div>
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            更多<el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleGrant(record.id)"> 命令授权 </el-dropdown-item>
              <el-dropdown-item @click="handleAuth(record.id)"> 菜单授权 </el-dropdown-item>
              <el-dropdown-item @click="handleApi(record)"> 功能授权 </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <!--新增编辑界面-->
    <el-dialog :title="textMap[dialogStatus]" :close-on-click-modal="false" v-if="adddialogFormVisible" v-model="adddialogFormVisible" width="800px">
      <!-- TODO: cmp-element basic-form -->
      <basic-form :model="addData" ref="addDataRef" label-width="280px">
        <basic-form-item label="角色名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <el-form-item label="角色描述：" prop="remark">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off"></el-input>
        </el-form-item>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="adddialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="addSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!--菜单授权-->
    <el-dialog title="菜单授权" :close-on-click-modal="false" v-if="authGrantVisible" v-model="authGrantVisible" width="70%">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-tree :expand-on-click-node="false" ref="treeRef" :data="treelist" node-key="id" :props="treeProps" show-checkbox @check-change="changeCheck" @node-click="handleNodeClick" highlight-current> </el-tree>
        </el-col>
        <el-col :span="16">
          <el-card>
            <template #header><div>按钮列表</div></template>
            <el-table :data="buttonList" ref="buttonListTable" tooltip-effect="dark" @selection-change="SelectionChange" stripe fit>
              <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
              <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
              <el-table-column show-overflow-tooltip label="编码" prop="meta"> </el-table-column>
            </el-table>
          </el-card>
          <el-card class="m-t">
            <template #header><div>API列表</div></template>
            <el-table :data="apiList" ref="apiListTable" tooltip-effect="dark" @selection-change="SelectionChange" stripe fit>
              <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
              <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
              <el-table-column show-overflow-tooltip label="路径" prop="path"> </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="authGrantVisible = false">取消</el-button>
          <el-button type="primary" @click="authGrantSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!--命令授权-->
    <el-dialog title="命令授权" v-model="grantdialogVisible" width="35%">
      <el-table :data="commandlist" ref="commandTable" tooltip-effect="dark" @selection-change="handleSelectionChange" stripe border fit>
        <el-table-column show-overflow-tooltip type="selection"> </el-table-column>
        <el-table-column show-overflow-tooltip label="名称" prop="name"> </el-table-column>
        <el-table-column show-overflow-tooltip label="级别">
          <template #default="scope">
            <status-icon :type="levelFilter(scope.row.level, 'color')">
              {{ levelFilter(scope.row.level) }}
            </status-icon>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip label="内容" prop="content"> </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="grantdialogVisible = false">取消</el-button>
          <el-button type="primary" @click="comGrantSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="功能授权" :close-on-click-modal="false" v-if="apiGrantVisible" v-model="apiGrantVisible" width="70%">
      <basic-form>
        <el-row class="m-t" :gutter="10" v-loading="loading">
          <el-col :span="12">
            <el-checkbox v-model="apiGrantData.selectAll" @change="selectAll">全选</el-checkbox>
            <el-tree ref="apitreeRef" :expand-on-click-node="false" :data="modulesData" node-key="tag" :props="{ label: 'label', children: 'value' }" show-checkbox @check-change="changeCheckApi">
              <template #default="{ node }">
                <span>
                  <span :class="node.label.indexOf(':') > -1 ? 'custom-tree-node' : ''">{{ node.label.split(':')[0] }}</span><span>: {{ node.label.split(':')[1] }}</span>
                </span>
              </template>
            </el-tree>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="apiGrantVisible = false">取消</el-button>
          <el-button type="primary" @click="apiGrantSubmit" :loading="loading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, Edit, Delete, ArrowDown } from '@element-plus/icons-vue'
import { getAuthByCategory } from 'services/system/auth'
import { getRole, createRole, modifyRole, removeRole, getRoleAuth, accreditRole, getApiById, updateApi } from 'services/system/role'
import { getRoleCommand, accreditCommand } from 'services/task/command'
import { generalStatusFilter } from '@/filters/common'
import { usePermissionStore } from '@/stores'
import router, { resetRouter } from '@/router'

const permissionStore = usePermissionStore()

const searchConfigs = [{ label: '角色名称', value: 'name', type: 'Input' }]
const columns = [
  { label: '名称', prop: 'name' },
  { label: '状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '描述', prop: 'remark' },
  { label: '操作', disabled: true, prop: 'id', width: '220px', scopedSlots: { customRender: 'operate' } }
]

function levelFilter(level: string, name: 'name' | 'color' = 'name') {
  const levelMap: Record<string, { name: string; color: string }> = {
    DEADLY: { name: '致命', color: 'danger' },
    HIGH: { name: '严重', color: 'warning' },
    SERIOUS: { name: '高危', color: 'normal' },
    MEDIUM: { name: '中等', color: 'primary' },
    COMMON: { name: '普通', color: 'success' }
  }
  return levelMap[level][name]
}

const value = ref(false)
const loading = ref(false)
const list = ref<any[]>([])
const treelist = ref<any[]>([])
const commandlist = ref<any[]>([])
const params1 = ref<any>(null)
const total = ref<number | null>(null)
const params = reactive<any>({ page: 1, rows: 10 })
const adddialogFormVisible = ref(false)
const authGrantVisible = ref(false)
const grantdialogVisible = ref(false)
const dialogStatus = ref<'update' | 'create' | ''>('')
const textMap: Record<string, string> = { update: '编辑角色', create: '创建角色' }
const addData = ref<any>({ name: '', remark: '', props: [] })
const treeProps = { label: 'name', children: 'childs', isLeaf: 'leaf' }
const authGrantData = ref<any>({ button: false })
const arr = ref<any[]>([])
const grantData = ref<any>({})
const multipleSelection = ref<any[]>([])
const buttonList = ref<any[]>([])
const apiList = ref<any[]>([])
const nodeData = ref<any>({})
const checkedList = ref<any[]>([])
const nowChecked = ref<any[]>([])
const nowUnchecked = ref<any[]>([])
const apiGrantVisible = ref(false)
const apiGrantData = ref<any>({ apis: [] })
const modulesData = ref<any[]>([])
const apisById = ref<any[]>([])

const addDataRef = ref<any>(null)
const treeRef = ref<any>(null)
const buttonListTable = ref<any>(null)
const apiListTable = ref<any>(null)
const commandTable = ref<any>(null)
const apitreeRef = ref<any>(null)

async function getList() {
  loading.value = true
  const data = await getRole(params)
  loading.value = false
  if (data.success) {
    list.value = data.data.rows
    total.value = data.data.total
  }
}

function handleCreate(data?: any) {
  if (data) {
    addData.value = Object.assign({}, data)
    value.value = addData.value.props !== '[]'
    dialogStatus.value = 'update'
    adddialogFormVisible.value = true
  } else {
    value.value = false
    addData.value = { props: [] }
    dialogStatus.value = 'create'
    adddialogFormVisible.value = true
  }
}

function handleDelete(id: number) {
  ElMessageBox.confirm('您确定要删除该角色吗?', '提示', { type: 'warning' })
    .then(() => {
      removeRole(id).then((data) => {
        if (data.success) {
          ElMessage.success(data.message)
          getList()
        }
      })
    })
    .catch(() => {})
}

function handleGrant(id: number) {
  grantData.value.id = id
  getRoleCommand({ roleId: id, parentId: 0 }).then((data) => {
    if (data.success) {
      commandlist.value = data.data
      grantdialogVisible.value = true
      setTimeout(() => {
        commandlist.value.forEach((item: any) => {
          if (item.checked) {
            commandTable.value?.toggleRowSelection(item)
          }
        })
      }, 10)
    }
  })
}

function getSelectedIds(): string {
  let ids = ''
  multipleSelection.value.forEach((item: any) => {
    ids += item.id + ','
  })
  return ids
}

function comGrantSubmit() {
  loading.value = true
  accreditCommand({ roleId: grantData.value.id, commands: getSelectedIds() }).then((data) => {
    if (data.success) {
      ElMessage.success(data.message)
      grantdialogVisible.value = false
      getList()
    }
    loading.value = false
  })
}

function handleAuth(id: number) {
  authGrantVisible.value = true
  authGrantData.value.id = id
  treelist.value = []
  arr.value = []
  apiList.value = []
  buttonList.value = []
  getTreeList()
  getCheckedList(id)
}

function handleApi(data: any) {
  apiGrantVisible.value = true
  apiGrantData.value = { id: data.id, apis: [], selectAll: false }
  if (data.props == 'tenantAPi') {
    apiGrantData.value.tags = 'CSC'
  }
  getModules()
}

function handleDiskDelShow(record: any) {
  modifyRole(record).then((data) => {
    if (data.success) {
      ElNotification({ message: data.message, type: 'success' })
      getList()
    }
  })
}

function addSubmit() {
  if (value.value == false) {
    addData.value.props = []
  }
  const http = addData.value.id ? modifyRole : createRole
  addDataRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      http(addData.value).then((data) => {
        if (data.success) {
          ElNotification({ message: data.message, type: 'success' })
          adddialogFormVisible.value = false
          getList()
        }
        loading.value = false
      })
    }
  })
}

function handleSelectionChange(val: any[]) {
  multipleSelection.value = val
}

function changeCheck(obj: any, isChecked: boolean) {
  if (isChecked) {
    arr.value.push(obj.id)
  } else {
    const index = arr.value.indexOf(obj.id)
    if (index != -1) {
      arr.value.splice(index, 1)
    }
  }
}

function recursion(data: any[]) {
  data.forEach((item) => {
    if (item.checked) arr.value.push(item.id)
    if (item.childs) recursion(item.childs)
  })
}

function getTreeList() {
  params1.value = { id: authGrantData.value.id, parentId: 0, button: false }
  getRoleAuth(authGrantData.value.id, { menu: true, tenant: false }).then((data) => {
    if (data.success) {
      data.data.forEach((item: any) => {
        if (item.checked) arr.value.push(item.id)
        if (item.childs) recursion(item.childs)
      })
      treelist.value = packTreeData([...data.data])
      treeRef.value?.setCheckedKeys(arr.value)
    }
  })
}

function packTreeData(nodes: any[]): any[] {
  if (!nodes?.length) return []
  const result: any[] = []
  for (const node of nodes) {
    if (node.category != 'button') {
      result.push(node)
      node.childs = packTreeData(node.childs)
    }
  }
  return result
}

async function changeRoutes() {
  // Vue3 Pinia: 更新路由（替代 ChangeRoutes 动作）
  // TODO: cmp-element / project - asyncRouterMap 来源
  const { asyncRouterMap } = await import('@/router')
  return permissionStore.changeRoutes(asyncRouterMap, router, resetRouter)
}

function authGrantSubmit() {
  const auths: number[] = []
  const ids: any[] = treeRef.value?.getCheckedNodes() || []
  ids.forEach((item) => auths.push(item.id))
  checkedList.value.forEach((item) => auths.push(item.id))
  const { id } = authGrantData.value
  loading.value = true
  accreditRole(id, auths).then((data) => {
    if (data.success) {
      ElMessage.success(data.message)
      authGrantVisible.value = false
      changeRoutes()
      getList()
    }
    loading.value = false
  })
}

function handleNodeClick(node: any) {
  nodeData.value = node
  nowChecked.value = []
  nowUnchecked.value = []
  getButtonList()
  getApiListLocal()
}

async function getButtonList() {
  const data = await getAuthByCategory({ parentId: nodeData.value.id, category: 'button' })
  if (data.success) {
    buttonList.value = data.data
    setTimeout(() => {
      buttonList.value.forEach((item: any) => {
        if (checkedList.value.findIndex(({ id }: any) => id === item.id) > -1) {
          nowChecked.value.push(item)
          buttonListTable.value?.toggleRowSelection(item)
        } else {
          nowUnchecked.value.push(item)
        }
      })
    }, 0)
  }
}

async function getApiListLocal() {
  const data = await getAuthByCategory({ parentId: nodeData.value.id, category: 'api' })
  if (data.success) {
    apiList.value = data.data
    setTimeout(() => {
      apiList.value.forEach((item: any) => {
        if (checkedList.value.findIndex(({ id }: any) => id === item.id) > -1) {
          nowChecked.value.push(item)
          apiListTable.value?.toggleRowSelection(item)
        } else {
          nowUnchecked.value.push(item)
        }
      })
    }, 0)
  }
}

function getCheckedList(id: number) {
  getRoleAuth(id, { menu: false }).then((data) => {
    if (data.success) {
      const { api, button } = data.data
      checkedList.value = [...api, ...button].filter(({ checked }: any) => checked)
    }
  })
}

function SelectionChange(selection: any[]) {
  const selectionIds = selection.map(({ id }) => id)
  nowChecked.value.forEach((item) => {
    if (selectionIds.findIndex((id) => id === item.id) === -1) {
      const index = checkedList.value.findIndex(({ id }: any) => id === item.id)
      checkedList.value.splice(index, 1)
    }
  })
  nowUnchecked.value.forEach((item) => {
    if (selectionIds.findIndex((id) => id === item.id) > -1) {
      checkedList.value.push(item)
    }
  })
}

async function getModules() {
  apiGrantData.value.selectAll = false
  apiGrantData.value.apis = []
  loading.value = true
  const data = await getApiById(apiGrantData.value.id, apiGrantData.value.tags)
  if (data.success) {
    loading.value = false
    modulesData.value = data.data
    data.data.forEach((item: any) => {
      item.label = item.name
      item.value.forEach((a: any) => {
        a.label = a.name
        a.value.forEach((b: any) => {
          b.label = `${b.method}: ${b.operation} (${b.url})`
          b.tag = `${b.service}:${b.pattern}`
          if (b.check) apisById.value.push(b.tag)
        })
      })
    })
  }
  apitreeRef.value?.setCheckedKeys(apisById.value)
}

function changeCheckApi(obj: any, isChecked: boolean) {
  if (isChecked) {
    apiGrantData.value.apis.push(obj)
  } else {
    const index = apiGrantData.value.apis.indexOf(obj.pattern)
    if (index != -1) apiGrantData.value.apis.splice(index, 1)
  }
}

function selectAll(val: boolean) {
  const resultArr: string[] = []
  if (val) {
    modulesData.value.forEach((item: any) => {
      item.value.forEach((a: any) => {
        a.value.forEach((b: any) => resultArr.push(b.tag))
      })
    })
  }
  apitreeRef.value?.setCheckedKeys(resultArr)
}

function apiGrantSubmit() {
  const nodes: any[] = apitreeRef.value?.getCheckedNodes() || []
  const { id } = apiGrantData.value
  const apis: any[] = []
  nodes.forEach((item) => {
    if (!item.value) apis.push(item)
  })
  loading.value = true
  updateApi(id, apis).then((data) => {
    if (data.success) {
      ElMessage.success(data.message)
      apiGrantVisible.value = false
      changeRoutes()
      getList()
    }
    loading.value = false
  })
}
</script>

<style lang="scss" scoped>
.menu {
  display: inline-block;
  width: 30%;
  overflow-x: auto;
}

.button {
  display: inline-block;
  width: 70%;
}
</style>
<style scoped>
.custom-tree-node {
  color: #409eff;
}
</style>
