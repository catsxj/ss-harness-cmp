<template>
  <div class="wrapper">
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
        <!-- <el-button type="text" @click="follow(record.code)">关联菜单 </el-button> -->
        <el-dropdown @command="handleCommand($event, record.code)">
          <span class="el-dropdown-link"> 关联<i class="el-icon-arrow-down el-icon--right"></i> </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="A">管理端</el-dropdown-item>
            <el-dropdown-item command="B">控制台</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </AdvanceTable>
    <el-dialog title="插件" :visible.sync="visible" width="960px" :close-on-click-modal="false">
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
          <!-- <el-col :span="12">
            <basic-form-item label="插件状态" prop="status" validate="required">
              <el-switch
                v-model="dialogData.status">
              </el-switch>
            </basic-form-item>
          </el-col> -->
          <el-col :span="12">
            <basic-form-item label="备注" prop="remark">
              <el-input v-model="dialogData.remark" type="text"></el-input>
            </basic-form-item>
          </el-col>
        </el-row>
      </basic-form>
      <div slot="footer">
        <el-button @click.native="visible = false">取消</el-button>
        <el-button type="primary" @click.native="handle">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="关联菜单" :visible.sync="associateVisible" width="960px" :close-on-click-modal="false">
      <el-tree :data="treeData" :props="{ label: 'name' }" node-key="id" show-checkbox ref="treeRef"></el-tree>
      <div slot="footer">
        <el-button @click.native="associateVisible = false">取消</el-button>
        <el-button type="primary" @click.native="confirmFollow">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, nextTick } from '@vue/composition-api'
import { MessageBox, Message } from 'element-ui'
import { getPlugins, addPlugin, editPlugin, deletePlugin, deleteAllPlugin, associateMenu, getVendors, updateStatus } from 'services/services/plugins'
import { getAuth } from 'services/system/auth'

const columns = [
  { type: 'selection' },
  {
    label: '插件名称',
    prop: 'name'
  },
  {
    label: '插件编码',
    prop: 'code'
  },
  {
    label: '插件平台',
    prop: 'vendorType'
  },
  {
    label: '插件状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '备注',
    prop: 'remark'
  },
  {
    label: '操作',
    disabled: true,
    width: '200px',
    scopedSlots: { customRender: 'operate' }
  }
]

const CREATE = 'create'
const UPDATE = 'update'

export default defineComponent({
  setup() {
    const vendorData = ref([])
    getVendors({ value: 'RESOURCE_TYPE' }).then((data) => {
      if (data.success) {
        vendorData.value = data.data
      }
    })
    const listData = ref([])
    const params = ref({
      page: 1,
      rows: 10
    })
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
    const dialogData = ref({})
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
    const remove = (id: Number | String) => {
      MessageBox.confirm('您确定要删除该插件吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        deletePlugin(id).then(({ success, message }) => {
          if (success) {
            Message.success(message)
            getList()
          }
        })
      })
    }
    const handle = async () => {
      let fn
      if (mode.value == CREATE) fn = addPlugin
      else fn = editPlugin
      const { success, message } = await fn({ ...dialogData.value })
      if (success) {
        visible.value = false
        Message.success(message)
        getList()
      }
    }

    const associateVisible = ref(false)
    const asscoiateCode = ref('')
    const treeData = ref([])
    // const follow = (code: string) => {
    //   associateVisible.value = true
    //   asscoiateCode.value = code
    //   getTree()
    // }
    const isTenant = ref(false)
    const handleCommand = (sign: string, code: string) => {
      associateVisible.value = true
      asscoiateCode.value = code
      isTenant.value = sign == 'B'
      getTree()
    }
    const currentIds = ref([])
    const treeRef: Ref = ref(null)
    const getTree = async () => {
      const { data, success } = await getAuth({ parentId: null, tenant: isTenant.value })
      if (success) {
        treeData.value = floopArrays(data)
        currentIds.value = getCurrentIds(treeData.value)
        nextTick(() => {
          treeRef.value.setCheckedKeys(currentIds.value)
        })
      }
    }
    const floopArrays: Function = (arr: any[]) => {
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
    function getCurrentIds(node: { [key: string]: never }[]) {
      let arr: never[] = []
      node.forEach((item) => {
        if (item.pluginsCode == asscoiateCode.value && (item.children as any).length == 0) {
          arr.push(item.id)
        }
        if (item.children) {
          arr = [...arr, ...getCurrentIds(item.children)]
        }
      })
      return arr
    }
    const confirmFollow = async () => {
      const ids = treeRef.value.getCheckedKeys()
      const idsHalf = treeRef.value.getHalfCheckedKeys()
      const { message, success } = await associateMenu({ permissionIdList: [...ids, ...idsHalf], pluginsCode: asscoiateCode.value, tenant: isTenant.value })
      if (success) {
        associateVisible.value = false
        Message.success(message)
      }
    }

    const removeIds = ref([])
    const selectionChange = (selection: any[]) => {
      ;(removeIds.value as any[]) = selection.map((item) => item.id)
    }
    const removeAll = () => {
      if (!removeIds.value.length) {
        return
      }
      MessageBox.confirm('确定要删除所选中插件吗', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { success, message } = await deleteAllPlugin(removeIds.value)
        if (success) {
          Message.success(message)
          getList()
        }
      })
    }

    const editStatus = async (id: Number, status: Boolean) => {
      const { success, message } = await updateStatus(id, !status)
      if (success) {
        Message.success(message)
        getList()
      }
    }
    return {
      vendorData,
      columns,
      params,
      listData,
      total,
      visible,
      dialogData,
      associateVisible,
      treeData,
      treeRef,
      getList,
      create,
      update,
      remove,
      handle,
      handleCommand,
      confirmFollow,
      selectionChange,
      removeAll,
      editStatus
    }
  }
})
</script>
