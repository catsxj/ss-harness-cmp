<template>
  <div>
    <advance-table title="字典列表" :columns="columns" :tree-props="{ children: 'children', hasChildren: 'hasChidren' }" row-key="id" :data="list" :loading="loading" :get-list="getList">
      <el-button type="primary" @click="handleCreate()" icon="el-icon-plus" slot="action">新增</el-button>
      <div slot="pagination"></div>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate('create', record)"><i class="el-icon-plus"></i> 新增</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleCreate('edit', record)"><i class="el-icon-edit"></i> 编辑</el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)"><i class="el-icon-delete"></i> 删除</el-button>
      </template>
    </advance-table>
    <!--新增编辑-->
    <el-dialog :title="addData.id ? '编辑字典' : '新增字典'" :close-on-click-modal="false" v-if="addDialogVisible" :visible.sync="addDialogVisible" width="35%">
      <basic-form :model="addData" ref="formRef">
        <basic-form-item label="名称：" prop="name" validate="required">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="权重：" prop="weight" validate="required">
          <el-input-number v-model="addData.weight" auto-complete="off"></el-input-number>
        </basic-form-item>
        <basic-form-item label="内容：" prop="value" validate="required">
          <el-input :disabled="!!addData.id" v-model="addData.value" auto-complete="off"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { getDict, removeDict, modifyDict, createDict } from 'services/system/dictionary'
import { Message, Form } from 'element-ui'
import { useDelete } from 'hooks/useTable'
const columns = [
  {
    label: '名称',
    prop: 'name',
    disabled: true
  },
  {
    label: '内容',
    prop: 'value'
  },
  {
    label: '操作',
    width: '240px',
    disabled: true,
    scopedSlots: { customRender: 'operate' }
  }
]
export default defineComponent({
  setup(props, context) {
    const loading = ref(false)
    const list = ref([])
    async function getList() {
      loading.value = true
      const data = await getDict({ pid: 0 })
      loading.value = false
      if (data.success) {
        list.value = data.data
      }
    }
    getList()
    // 字典新增
    const addData = ref({
      id: 0,
      name: '',
      value: '',
      pid: 0,
      weight: 1
    })
    const addDialogVisible = ref(false)
    function handleCreate(type: string, data: any) {
      addData.value = {
        id: 0,
        pid: 0,
        name: '',
        value: '',
        weight: 1
      }
      if (type === 'edit') {
        addData.value = Object.assign({}, data)
      } else {
        if (data) {
          addData.value.pid = data.id
        }
      }
      addDialogVisible.value = true
    }
    const formRef = ref()
    function addSubmit() {
      ;(formRef.value as Form).validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          const http = addData.value.id ? modifyDict : createDict
          const data = await http(addData.value)
          loading.value = false
          if (data.success) {
            Message.success(data.message)
            addDialogVisible.value = false
            getList()
          }
        }
      })
    }
    // 字典删除
    const { handleDelete } = useDelete(removeDict, getList)
    return {
      columns,
      list,
      loading,
      getList,
      formRef,
      addData,
      addDialogVisible,
      handleCreate,
      addSubmit,
      handleDelete
    }
  }
})
</script>
