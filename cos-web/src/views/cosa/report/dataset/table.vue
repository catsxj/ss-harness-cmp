<template>
  <div>
    <AdvanceTable :data="listData" :columns="columns" :params="params" :total="total" :search-configs="searchConfigs" :getList="getList">
      <template #action>
        <el-dropdown trigger="click" class="pull-right" @command="handleCommand">
          <el-button type="primary" :disabled="!groupId"> 新增<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="database">数据库数据集</el-dropdown-item>
            <el-dropdown-item command="sql">SQL数据集</el-dropdown-item>
            <el-dropdown-item command="api">API数据集</el-dropdown-item>
            <el-dropdown-item command="json">JSON数据集</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <template #name="val, record">
        <el-button type="text" @click="toDetail(record)">{{ val }}</el-button>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleEdit(record)">编辑</el-button>
        <el-button type="text" @click="remove(record.id)">删除</el-button>
      </template>
    </AdvanceTable>
    <CreateDialog
      v-if="visible"
      :dialogData="dialogData"
      @success="
        visible = false
        getList()
      "
      @back="visible = false"
    ></CreateDialog>
    <FullScreen :visible.sync="detailVisible" :title="detailData.name" :isClose="false" :bodyStyle="{ padding: '10px' }" style="height: calc(100vh - 100px)">
      <Details v-if="detailVisible" :detailData="detailData"></Details>
    </FullScreen>
    <el-dialog title="编辑数据集" :visible.sync="editVisible">
      <basic-form :model="editData" ref="formRef">
        <basic-form-item prop="name" validate="required" label="名称：">
          <el-input v-model="editData.name"></el-input>
        </basic-form-item>
      </basic-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { defineComponent, reactive, toRefs, watch, ref } from '@vue/composition-api'
import { Message, MessageBox } from 'element-ui'
import { getDataset, deleteDataset, updateDataset } from 'services/reportform/dataset'
import Details from './detail.vue'
import CreateDialog from './createDialog/index.vue'
import FullScreen from '../components/fullscreen.vue'
const columns = [
  {
    label: '名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '类型',
    prop: 'type'
  },
  {
    label: '创建人',
    prop: 'user'
  },
  {
    label: '创建时间',
    prop: 'gmtCreate'
  },
  {
    label: '修改时间',
    prop: 'gmtModify'
  },
  {
    label: '操作',
    width: '180px',
    scopedSlots: { customRender: 'operate' }
  }
]

export default defineComponent({
  components: {
    CreateDialog,
    Details,
    FullScreen
  },
  props: ['groupId'],
  setup(props) {
    const state = reactive({
      params: {
        page: 1,
        rows: 10
      },
      total: 0,
      searchConfigs: [
        { type: 'Const', value: 'groupId', initValue: '' },
        { type: 'Input', value: 'name', label: '名称' },
        {
          type: 'Select',
          value: 'type',
          label: '类型',
          data: [
            { name: 'database', id: 'database' },
            { name: 'sql', id: 'sql' },
            { name: 'api', id: 'api' },
            { name: 'json', id: 'json' }
          ]
        }
      ],
      listData: [],
      dialogData: {}
    })
    watch(
      () => props.groupId,
      val => {
        state.searchConfigs.splice(0, 1, { type: 'Const', value: 'groupId', initValue: val })
      }
    )
    async function getList() {
      const { data, success } = await getDataset(state.params)
      if (success) {
        state.listData = data.rows
        state.total = data.total
      }
    }
    const visible = ref(false)
    function handleCommand(command) {
      visible.value = true
      state.dialogData = {
        groupId: props.groupId,
        type: command
      }
    }
    const editVisible = ref(false)
    const editData = ref({})
    function handleEdit(data) {
      editVisible.value = true
      editData.value = { ...data }
    }
    const formRef = ref()
    function confirmEdit() {
      formRef.value.validate(async valid => {
        if (valid) {
          const { id, name } = editData.value
          const { success, message } = await updateDataset({ id, name }, id)
          if (success) {
            Message.success(message)
            editVisible.value = false
            getList()
          }
        }
      })
    }
    function remove(id) {
      MessageBox.confirm('确定删除该数据集吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { message, success } = await deleteDataset(id)
        if (success) {
          Message.success(message)
          getList()
        }
      })
    }
    const detailData = ref({})
    const detailVisible = ref(false)
    function toDetail(record) {
      detailData.value = record
      detailVisible.value = true
    }
    return {
      columns,
      ...toRefs(state),
      getList,
      handleCommand,
      visible,
      confirm,
      handleEdit,
      remove,
      detailVisible,
      toDetail,
      detailData,
      editVisible,
      editData,
      confirmEdit,
      formRef
    }
  }
})
</script>
