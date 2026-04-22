/* eslint-disable func-call-spacing */
<template>
  <div>
    <AdvanceTable title="认证账号列表" :data="list" :params="params" :searchConfigs="searchConfigs" :total="total" :columns="columns" :get-list="getList" :loading="loading">
      <template v-slot:action>
        <el-button @click="handleCreate()" type="primary" icon="el-icon-plus">新增 </el-button>
      </template>
      <template #operate="val, record">
        <el-button type="text" @click="handleCreate(record)" icon="el-icon-edit"> 编辑 </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)" icon="el-icon-delete"> 删除 </el-button>
      </template>
    </AdvanceTable>
    <!--新增界面-->
    <el-dialog :title="addData.id ? '编辑账号' : '新增账号'" :close-on-click-modal="false" v-if="dialogFormVisible" :visible.sync="dialogFormVisible" @close="resetForm('addData')" width="35%">
      <basic-form :model="addData" ref="formRef">
        <basic-form-item label="认证名称：" prop="username" validate="required,name" required-message="请输入认证名称">
          <el-input v-model="addData.username" auto-complete="off"></el-input>
        </basic-form-item>
        <basic-form-item label="认证密码：" prop="password" v-if="!addData.id" validate="required" required-message="请输入认证密码">
          <el-input type="password" v-model="addData.password" auto-complete="off" show-password></el-input>
        </basic-form-item>
        <basic-form-item label="认证备注：">
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

<script lang="ts">
import { Message } from 'element-ui'
import { encrypt } from 'utils/crypto'
import { getIdents, createIdents, modifyIdents, removeIdents } from 'services/task/ident'
import { defineComponent, ref, unref, Ref } from '@vue/composition-api'
import useTable from 'hooks/useTable'
import ICommon from '@/models/common'
interface IIdent extends ICommon {
  password?: string;
}
const columns = [
  { label: '认证账户', prop: 'username' },
  { label: '备注', prop: 'remark' },
  { label: '操作', disabled: true, width: '160px', scopedSlots: { customRender: 'operate' } }
]
export default defineComponent({
  setup() {
    const { list, total, params, handleDelete, loading, getList } = useTable({
      getService: getIdents,
      removeService: removeIdents,
      deleteTipKey: 'username'
    });
    // 新增&编辑
    const dialogFormVisible = ref(false);
    const addData: Ref<IIdent> = ref({})
    function handleCreate(data: any) {
      addData.value = {}
      if (data) {
        addData.value = Object.assign({}, data)
      }
      dialogFormVisible.value = true;
    }
    const formRef = ref()
    function addSubmit() {
      const service = addData.value.id ? modifyIdents : createIdents
      formRef.value.validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          const { password } = addData.value;
          const data = await service({
            ...unref(addData),
            password: encrypt(password)
          });
          if (data.success) {
            Message.success(data.message)
            dialogFormVisible.value = false
            getList()
          }
        }
      })
    }
    return {
      columns,
      searchConfigs: [{ label: '认证账户', value: 'username', type: 'Input' }],
      list,
      total,
      params,
      handleDelete,
      loading,
      getList,
      // 新增
      dialogFormVisible,
      addData,
      formRef,
      handleCreate,
      addSubmit
    }
  }
})

//   private resetForm(form: string) {
//     ;(this.$refs[form] as Form).resetFields()
//     this.addData = {}
//   }

</script>
