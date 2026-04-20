<template>
  <div>
    <advance-table title="组织机构" :columns="columns" lazy :load="getList" :tree-props="{ children: 'children', hasChildren: 'isParent' }" row-key="id" :data="list" :loading="loading" :get-list="getList">
      <el-button type="primary" @click="handleCreate()" icon="el-icon-plus" slot="action">新增</el-button>
      <div slot="pagination"></div>
      <template #status="status">
        <status-icon :type="generalStatusFilter(status, 'color')">
          {{ generalStatusFilter(status, 'status') }}
        </status-icon>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('add', record)"><i class="el-icon-plus"></i> 新增</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleCreate('edit', record)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)"><i class="el-icon-delete"></i> 删除</el-button>
      </template>
    </advance-table>
    <!--新增编辑-->
    <el-dialog :title="addData.id ? '编辑组织' : '新增组织'" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible" width="35%">
      <basic-form :model="addData" ref="formRef">
        <basic-form-item label="组织名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <el-form-item label="其他属性：" prop="props">
          <el-input v-model="addData.props" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述：" prop="remark">
          <el-input type="textarea" v-model="addData.remark" auto-complete="off"></el-input>
        </el-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { IDepart } from '@/models/depart'
import { getDepartLazy, createDepart, modifyDepart, removeDepart } from 'services/system/depart'
import { defineComponent, ref, Ref, nextTick } from '@vue/composition-api'
import { Message } from 'element-ui'
import { useDelete } from 'hooks/useTable'
import { generalStatusFilter } from '@/filters/common'
const columns = [
  {
    label: '名称',
    prop: 'name',
    disabled: true
  },
  {
    label: '状态',
    prop: 'status',
    scopedSlots: { customRender: 'status' }
  },
  {
    label: '修改时间',
    prop: 'gmtModify'
  },
  {
    label: '其他属性',
    prop: 'props'
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '操作',
    width: '220px',
    disabled: true,
    scopedSlots: { customRender: 'operate' }
  }
]
export default defineComponent({
  setup(props, context) {
    const loading = ref(false)
    const list: Ref<IDepart[]> = ref([])
    async function getList(tree: any = { id: 0 }, treeNode?: any, resolve?: Function) {
      const id = tree.id || 0
      if (id === 0) {
        // 重新加载
        loading.value = true
        list.value = []
        await nextTick()
      }
      const data = await getDepartLazy({ parentId: id }).finally(() => (loading.value = false))
      if (data.success) {
        if (id === 0) {
          // 初始化
          list.value = data.data
        } else if (typeof resolve === 'function') {
          tree.children = data.data
          resolve(data.data)
        }
      }
    }
    getList()
    // 部门添加
    const addDialogVisible = ref(false)
    const addData = ref({
      id: 0,
      parentId: 0
    })
    function handleCreate(type: string, data: any) {
      addData.value = {
        id: 0,
        parentId: 0
      }
      if (type === 'edit') {
        addData.value = Object.assign({}, data)
      } else if (data) {
        addData.value.parentId = data.id
      }
      addDialogVisible.value = true
    }
    function addSubmit() {
      const service = addData.value.id ? modifyDepart : createDepart
      ;(context.refs.formRef as HTMLFormElement).validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          const data = await service(addData.value)
          loading.value = false
          if (data.success) {
            Message({
              message: data.message,
              type: 'success'
            })
            addDialogVisible.value = false
            getList()
          }
        }
      })
    }
    const { handleDelete } = useDelete(removeDepart, getList)
    return {
      generalStatusFilter,
      loading,
      columns,
      list,
      getList,
      addDialogVisible,
      addData,
      handleCreate,
      addSubmit,
      handleDelete
    }
  }
})
</script>
