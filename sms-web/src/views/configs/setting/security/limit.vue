<template>
  <div>
    <advance-table :data="list" :loading="loading" :columns="columns" :search-configs="searchConfigs" :params="params" :get-list="getList" :total="total" @selection-change="handleSelectionChange">
      <template #action>
        <el-button @click="handleCreate()" type="primary" icon="el-icon-plus"> 新增</el-button>
        <el-button @click="handleBatchRemove()" :disabled="!selectedKeys.length"> 批量删除 </el-button>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleDelete(record)"> <i class="el-icon-delete"></i> 删除 </el-button>
      </template>
    </advance-table>
    <!--新增界面-->
    <el-dialog title="新增限制IP" :close-on-click-modal="false" :visible.sync="dialogFormVisible" v-if="dialogFormVisible" width="35%">
      <basic-form :model="addForm" ref="formRef">
        <basic-form-item label="访问限制：" prop="type" validate="required">
          <el-radio-group v-model="addForm.type" disabled>
            <el-radio label="black">黑名单</el-radio>
            <el-radio label="white">白名单</el-radio>
          </el-radio-group>
        </basic-form-item>
        <basic-form-item label="IP地址：" prop="ip" validate="required,ip" required-message="请输入IP地址">
          <el-input v-model="addForm.ip"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getIpAccess, createIpAccess, removeIpAccess, batchRemoveIpAccess } from 'services/system/ip_access'
import { reactive, toRefs, state, ref } from '@vue/composition-api'

const columns = [
  {
    type: 'selection'
  },
  {
    label: 'IP地址',
    prop: 'ip'
  },
  {
    label: '创建人',
    prop: 'creator'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '操作',
    width: '100px',
    scopedSlots: { customRender: 'operate' }
  }
]
export default {
  props: {
    type: String
  },
  setup(props, context) {
    const state = reactive({
      list: [],
      total: 0,
      params: {
        page: 1,
        rows: 10
      },
      dialogFormVisible: false,
      loading: false,
      addForm: {},
      selectedKeys: []
    })
    const searchConfigs = [
      { type: 'Input', label: 'IP地址', value: 'ip' },
      { type: 'Const', value: 'type', initValue: props.type }
    ]
    function getList() {
      state.loading = true
      getIpAccess(state.params)
        .then((data) => {
          if (data.success) {
            state.list = data.data.rows
            state.total = data.data.total
          }
        })
        .finally(() => {
          state.loading = false
        })
    }

    function handleCreate() {
      console.log(props)
      state.addForm = { type: props.type }
      state.dialogFormVisible = true
    }

    function handleDelete(record) {
      context.root
        .$confirm(`您确定要删除【${record.ip}】吗?`, '提示', {
          type: 'warning'
        })
        .then(() => {
          removeIpAccess(record.id).then((data) => {
            if (data.success) {
              context.root.$message({
                message: data.message,
                type: 'success'
              })
              getList()
            }
          })
        })
    }

    function handleBatchRemove() {
      context.root
        .$confirm('您确定要删除这些IP吗?', '提示', {
          type: 'warning'
        })
        .then(() => {
          batchRemoveIpAccess(state.selectedKeys).then((data) => {
            if (data.success) {
              context.root.$message({
                message: data.message,
                type: 'success'
              })
              getList()
            }
          })
        })
    }
    const formRef = ref(null)
    function addSubmit() {
      formRef.value.validate((valid) => {
        if (valid) {
          createIpAccess(state.addForm).then((data) => {
            if (data.success) {
              context.root.$message({
                message: data.message,
                type: 'success'
              })
              state.dialogFormVisible = false
              getList()
            }
          })
        }
      })
    }

    function handleSelectionChange(selection) {
      state.selectedKeys = selection.map((item) => item.id)
    }

    return {
      ...toRefs(state),
      columns,
      searchConfigs,
      formRef,
      getList,
      addSubmit,
      handleSelectionChange,
      handleDelete,
      handleCreate,
      handleBatchRemove
    }
  }
}
</script>
