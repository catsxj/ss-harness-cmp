<template>
  <div>
    <AdvanceTable :columns="columns" :data="listData" :search-configs="searchConfigs" :params="params" :get-list="getList" :total="total" @selection-change="selectionChange">
      <template #action>
        <el-button
          type="primary"
          @click="
            visible = true
            dialogData = {}
          "
          >新增</el-button
        >
        <el-button type="primary" @click="removeAll">批量删除</el-button>
      </template>
      <template #name="val, record">
        <span class="detail-href" @click="createBind(record)">{{ val }}</span>
      </template>
      <template #isTenant="val">{{ val ? '是' : '否' }}</template>
      <template #operate="val, record">
        <el-button
          type="text"
          @click="
            visible = true
            dialogData = record
          "
          >编辑</el-button
        >
        <el-button type="text" @click="remove(record.id)">删除</el-button>
        <!-- <el-button type="text" @click="createBind(record)">关联</el-button> -->
      </template>
    </AdvanceTable>
    <el-dialog width="960px" :visible.sync="visible" :close-on-click-modal="false" :title="dialogData.id ? '编辑' : '新增'">
      <basic-form :model="dialogData" label-width="200px" ref="formRef">
        <el-row>
          <el-col :span="12">
            <basic-form-item label="资源名称" prop="name" validate="required">
              <el-input v-model.trim="dialogData.name" type="text"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="资源类型" prop="resourceType" validate="required">
              <el-input v-model.trim="dialogData.resourceType" type="text"></el-input>
            </basic-form-item>
          </el-col>
          <el-col :span="12">
            <basic-form-item label="是否在租户端显示" prop="isTenant">
              <el-switch v-model="dialogData.isTenant"></el-switch>
            </basic-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <basic-form-item label="描述" prop="remark">
              <el-input v-model.trim="dialogData.remark" type="text"></el-input>
            </basic-form-item>
          </el-col> -->
        </el-row>
      </basic-form>
      <div slot="footer">
        <el-button @click.native="visible = false">取消</el-button>
        <el-button type="primary" @click.native="confirmCreate">确定</el-button>
      </div>
    </el-dialog>
    <Metrics v-if="bindData.visible" :visible.sync="bindData.visible" :resourceType="bindData.type" :titleName="bindData.name"></Metrics>
  </div>
</template>
<script>
import { defineComponent, ref } from '@vue/composition-api'
import { getMonitorSettings, createMonitorSetting, updateMonitorSetting, deleteMonitorSetting, deleteAllMonitorSetting, bindMonitorList } from 'services/services/monitor'
import { MessageBox, Message } from 'element-ui'
import Metrics from './metrics.vue'

const columns = [
  { type: 'selection' },
  {
    label: '资源名称',
    prop: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    label: '资源类型',
    prop: 'resourceType'
  },
  {
    label: '是否租户端展示',
    prop: 'isTenant',
    scopedSlots: { customRender: 'isTenant' }
  },
  // {
  //   label: '描述',
  //   prop: 'remark'
  // },
  {
    label: '操作',
    scopedSlots: { customRender: 'operate' }
  }
]

export default defineComponent({
  components: { Metrics },
  setup() {
    const listData = ref([])
    const params = ref({
      page: 1,
      rows: 10
    })
    const total = ref(0)
    const searchConfigs = ref([
      { type: 'Input', value: 'name', label: '资源名称' },
      { type: 'Input', value: 'resourceType', label: '资源类型' },
      {
        type: 'Select',
        label: '是否在租户端展示',
        value: 'isTenant',
        data: [
          { name: '是', id: true },
          { name: '否', id: false }
        ]
      }
    ])
    const getList = async () => {
      const { data, success } = await getMonitorSettings(params.value)
      if (success) {
        listData.value = data.rows
        total.value = data.total
      }
    }
    getList()

    const visible = ref(false)
    const dialogData = ref({})
    const formRef = ref(null)
    const confirmCreate = () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          const fn = dialogData.value.id ? updateMonitorSetting : createMonitorSetting
          const { success, message } = await fn({ ...dialogData.value, isTenant: !!dialogData.value.isTenant }, dialogData.value.id)
          if (success) {
            Message.success(message)
            visible.value = false
            getList()
          }
        }
      })
    }

    const remove = (id) => {
      MessageBox.confirm('确定要删除该资源吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(() => {
        deleteMonitorSetting(id).then(({ success, message }) => {
          if (success) {
            Message.success(message)
            getList()
          }
        })
      })
    }
    const removeIds = ref([])
    const selectionChange = (selection) => {
      removeIds.value = selection.map((item) => item.id)
    }
    const removeAll = () => {
      MessageBox.confirm('确定要删除所选中资源吗？', '提示', {
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }).then(async () => {
        const { success, message } = await deleteAllMonitorSetting({ ids: removeIds.value })
        if (success) {
          Message.success(message)
          getList()
        }
      })
    }
    const bindData = ref({
      visible: false,
      type: ''
    })
    const createBind = (record) => {
      bindData.value.visible = true
      bindData.value.type = record.resourceType
      bindData.value.name = record.name
    }
    return {
      listData,
      params,
      total,
      searchConfigs,
      columns,
      visible,
      dialogData,
      getList,
      confirmCreate,
      remove,
      removeAll,
      selectionChange,
      createBind,
      bindData,
      formRef
    }
  }
})
</script>
