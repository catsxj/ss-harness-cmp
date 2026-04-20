<template>
  <div>
    <AdvanceTable :card-border="false" :search-configs="searchConfigs" :data="list" :params="params" :columns="columns" :get-list="getList" :total="total" :loading="loading">
      <template v-slot:action>
        <el-button @click="handleCreate()" type="primary" icon="el-icon-plus"> 新增 </el-button>
      </template>
      <template #reserved="val">
        {{ val | booleanFilter }}
      </template>
      <template #operate="val, record">
        <!-- 控制内置服务是否删除  :disabled="record.reserved" -->
        <el-button type="text" icon="el-icon-edit" @click="handleCreate(record)" :disabled="record.reserved"> 编辑 </el-button>
        <div class="action-divider"></div>
        <!-- 控制内置服务是否删除  :disabled="record.reserved" -->
        <el-button type="text" icon="el-icon-delete" @click="handleDelete(record)"> 删除 </el-button>
      </template>
    </AdvanceTable>
    <!--新增界面-->
    <el-dialog :title="addData.id ? '编辑服务类型' : '新增服务类型'" :close-on-click-modal="false" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" width="35%" append-to-body>
      <basic-form :model="addData" ref="formRef">
        <basic-form-item label="类型名称：" prop="name" validate="required" required-message="请输入系统名称">
          <el-input v-model="addData.name" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="类型编码：" prop="code" validate="required">
          <el-input v-model="addData.code" auto-complete="off"></el-input>
        </basic-form-item>
        <!-- <basic-form-item label="角色ID：" v-if="code === 'VP'" prop="props" validate="required,positiveNumber" required-message="请输入角色ID">
            <el-input type="number" v-model="addData.props" auto-complete="off"></el-input>
          </basic-form-item>
          <basic-form-item label="部署方式：" v-if="code === 'MYSQL'" prop="props" validate="required">
            <el-radio-group v-model="addData.props">
              <el-radio-button :label="item.value" v-for="(item, index) in deployList" :key="index">{{item.name}}</el-radio-button>
            </el-radio-group>
          </basic-form-item> -->
        <basic-form-item label="类型描述：">
          <el-input v-model="addData.remark" auto-complete="off" type="textarea"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="loading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import useTable from 'hooks/useTable'
import { Message } from 'element-ui'
import { getCategory, modifyCategory, createCategory, removeCategory } from 'services/services/spec'
import { defineComponent, reactive, toRefs } from '@vue/composition-api'
const deployList = [
  { name: '单点部署', value: 'standalone' },
  { name: '集群部署', value: 'cluster' }
]
const columns = [
  {
    label: '类型名称',
    prop: 'name'
  },
  {
    label: '系统内置',
    prop: 'reserved',
    scopedSlots: { customRender: 'reserved' }
  },
  {
    label: '描述',
    prop: 'remark'
  },
  {
    label: '操作',
    disabled: true,
    width: '220px',
    scopedSlots: { customRender: 'operate' }
  }
]
const searchConfigs = [
  {
    label: '类型名称',
    value: 'name',
    type: 'Input'
  },
  {
    value: 'serviceId',
    initValue: '',
    type: 'Const'
  }
]
export default defineComponent({
  props: {
    data: {
      type: Object
    }
  },
  setup(props, context) {
    console.log('dsd')
    // 产品类型
    const { list, total, params, getList, handleDelete, loading } = useTable({
      getService: getCategory,
      removeService: removeCategory
    })
    searchConfigs[1].initValue = props.data.id
    // 类型创建
    const state = reactive({
      addData: {},
      dialogFormVisible: false
    })
    function handleCreate(data) {
      state.dialogFormVisible = true
      if (data) {
        state.addData = { ...data }
      } else {
        state.addData = {}
      }
    }
    function addSubmit() {
      context.refs.formRef.validate(async (valid) => {
        if (valid) {
          loading.value = true
          const params = {
            serviceId: props.data.id,
            ...state.addData
          }
          const http = state.addData.id ? modifyCategory : createCategory
          const data = await http(params)
          loading.value = false
          if (data.success) {
            Message({
              message: data.message,
              type: 'success'
            })
            state.dialogFormVisible = false
            getList()
          }
        }
      })
    }
    return {
      columns,
      searchConfigs,
      list,
      total,
      params,
      getList,
      handleDelete,
      loading,
      // 类型创建
      ...toRefs(state),
      handleCreate,
      addSubmit
    }
  }
})
</script>
