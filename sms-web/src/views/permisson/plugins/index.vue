<template>
  <div class="wrapper">
    <!-- TODO: cmp-element AdvanceTable -->
    <AdvanceTable :columns="columns" :data="listData" :params="params" :get-list="getList" :total="total" @selection-change="selectionChange">
      <template #action>
        <el-button type="primary" @click="create">新增</el-button>
        <el-button type="default" @click="removeAll">批量删除</el-button>
      </template>
      <template #status="val">{{ val ? '已开启' : '已关闭' }}</template>
      <template #operate="val, record">
        <el-button type="text" @click="update(record)">编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="remove(record.id)">删除 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="editStatus(record.id, record.status)">{{ record.status ? '关闭' : '开启' }} </el-button>
        <div class="action-divider"></div>
        <el-dropdown @command="(cmd: string) => handleCommand(cmd, record.code)">
          <span class="el-dropdown-link">
            关联<el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="A">管理端</el-dropdown-item>
              <el-dropdown-item command="B">控制台</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog title="插件" v-model="visible" width="960px" :close-on-click-modal="false">
      <!-- TODO: cmp-element basic-form -->
      <basic-form :model="dialogData">
        <el-row>
          <el-col :span="12">
            <basic-form-item label="插件名称" prop="name" validate="required">
              <el-input v-model.trim="dialogData.name" type="text"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="插件编码" prop="code" validate="required">
              <el-input v-model.trim="dialogData.code" type="text"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="插件平台" prop="vendor_type">
              <el-select v-model="dialogData.vendor_type" placeholder="请选择" clearable>
                <el-option-group v-for="group in vendorData" :key="group.value" :label="group.name">
                  <el-option v-for="item in group.children" :key="item.value" :label="item.name" :value="item.value"> </el-option>
                </el-option-group>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="备注" prop="remark">
              <el-input v-model="dialogData.remark" type="text"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <template #footer>
        <div>
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handle">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="关联菜单" v-model="associateVisible" width="960px" :close-on-click-modal="false">
      <el-tree :data="treeData" :props="{ label: 'name' }" node-key="id" show-checkbox ref="treeRef"></el-tree>
      <template #footer>
        <div>
          <el-button @click="associateVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmFollow">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getPlugins, addPlugin, editPlugin, deletePlugin, deleteAllPlugin, associateMenu, getVendors, updateStatus } from 'services/services/plugins'
import { getAuth } from 'services/system/auth'

const columns = [
  { type: 'selection' },
  { label: '插件名称', prop: 'name' },
  { label: '插件编码', prop: 'code' },
  { label: '插件平台', prop: 'vendorType' },
  { label: '插件状态', prop: 'status', scopedSlots: { customRender: 'status' } },
  { label: '备注', prop: 'remark' },
  { label: '操作', disabled: true, width: '200px', scopedSlots: { customRender: 'operate' } }
]

const CREATE = 'create'
const UPDATE = 'update'

const vendorData = ref<any[]>([])
getVendors({ value: 'RESOURCE_TYPE' }).then((data: any) => {
  if (data.success) vendorData.value = data.data
})

const listData = ref<any[]>([])
const params = ref({ page: 1, rows: 10 })
const total = ref(0)

async function getList() {
  const { data, success } = await getPlugins(params.value)
  if (success) {
    listData.value = data.rows
    total.value = data.total
  }
}
getList()

const visible = ref(false)
const dialogData = ref<any>({})
const mode = ref(CREATE)

const create = () => {
  mode.value = CREATE
  visible.value = true
  dialogData.value = {}
}
const update = (record: any) => {
  mode.value = UPDATE
  visible.value = true
  const { id, vendorType, name, code, remark } = record
  dialogData.value = { id, vendor_type: vendorType, name, code, remark }
}
const remove = (id: number | string) => {
  ElMessageBox.confirm('您确定要删除该插件吗？', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(() => {
    deletePlugin(id).then(({ success, message }: any) => {
      if (success) {
        ElMessage.success(message)
        getList()
      }
    })
  })
}

const handle = async () => {
  const fn = mode.value === CREATE ? addPlugin : editPlugin
  const { success, message } = await fn({ ...dialogData.value })
  if (success) {
    visible.value = false
    ElMessage.success(message)
    getList()
  }
}

const associateVisible = ref(false)
const asscoiateCode = ref('')
const treeData = ref<any[]>([])
const isTenant = ref(false)

const handleCommand = (sign: string, code: string) => {
  associateVisible.value = true
  asscoiateCode.value = code
  isTenant.value = sign == 'B'
  getTree()
}

const currentIds = ref<any[]>([])
const treeRef = ref<any>(null)

const getTree = async () => {
  const { data, success } = await getAuth({ parentId: null, tenant: isTenant.value })
  if (success) {
    treeData.value = floopArrays(data)
    currentIds.value = getCurrentIds(treeData.value)
    await nextTick()
    treeRef.value?.setCheckedKeys(currentIds.value)
  }
}

const floopArrays = (arr: any[]): any[] => {
  return arr.map((item) => {
    const { id, name, pluginsCode, children } = item
    return {
      id,
      name,
      pluginsCode,
      disabled: !!pluginsCode && pluginsCode != asscoiateCode.value,
      children: children && children.length ? floopArrays(children) : []
    }
  })
}

function getCurrentIds(node: any[]): any[] {
  let arr: any[] = []
  node.forEach((item) => {
    if (item.pluginsCode == asscoiateCode.value && item.children.length == 0) {
      arr.push(item.id)
    }
    if (item.children) {
      arr = [...arr, ...getCurrentIds(item.children)]
    }
  })
  return arr
}

const confirmFollow = async () => {
  const ids = treeRef.value?.getCheckedKeys() || []
  const idsHalf = treeRef.value?.getHalfCheckedKeys() || []
  const { message, success } = await associateMenu({
    permissionIdList: [...ids, ...idsHalf],
    pluginsCode: asscoiateCode.value,
    tenant: isTenant.value
  })
  if (success) {
    associateVisible.value = false
    ElMessage.success(message)
  }
}

const removeIds = ref<any[]>([])
const selectionChange = (selection: any[]) => {
  removeIds.value = selection.map((item) => item.id)
}
const removeAll = () => {
  if (!removeIds.value.length) return
  ElMessageBox.confirm('确定要删除所选中插件吗', '提示', {
    confirmButtonClass: 'el-button--danger',
    type: 'warning'
  }).then(async () => {
    const { success, message } = await deleteAllPlugin(removeIds.value)
    if (success) {
      ElMessage.success(message)
      getList()
    }
  })
}

const editStatus = async (id: number, status: boolean) => {
  const { success, message } = await updateStatus(id, !status)
  if (success) {
    ElMessage.success(message)
    getList()
  }
}
</script>
