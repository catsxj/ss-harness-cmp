<template>
  <div>
    <AdvanceTable title="命令列表" :data="list" :params="params" :searchConfigs="searchConfigs" :total="total" :columns="columns" :get-list="getList" :loading="loading">
      <template v-slot:action>
        <el-button @click="handleCreate()" type="primary" icon="el-icon-plus">新增 </el-button>
      </template>
      <template #level="level">
        <status-icon :type="levelFilter(level, 'color')">{{ levelFilter(level) }} </status-icon>
      </template>
      <template #operate="val,record">
        <el-button type="text" @click="handleCreate(record)" icon="el-icon-edit">
          编辑
        </el-button>
        <div class="action-divider"></div>
        <el-button type="text" @click="handleDelete(record)" icon="el-icon-delete">
          删除
        </el-button>
      </template>
    </AdvanceTable>
    <!--新增界面-->
    <el-dialog :title="addData.id ? '编辑命令' : '新增命令'" :close-on-click-modal="false" :visible.sync="dialogFormVisible" v-if="dialogFormVisible" width="35%">
      <basic-form :model="addData" ref="formRef">
        <basic-form-item label="命令名称：" prop="name" validate="required" required-message="请输入命令名称">
          <el-input v-model="addData.name"></el-input>
        </basic-form-item>
        <basic-form-item label="命令级别：" prop="level" validate="required" required-message="请选择命令级别">
          <el-select v-model="addData.level" placeholder="请选择命令级别">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.name" :value="item.value"> </el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="命令内容：" prop="content" required-message="请输入命令内容" validate="required"
        :rules="[noChineseSpace]">
          <el-input type="textarea" v-model.trim="addData.content"></el-input>
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
import { getCommand, createCommand, modifyCommand, removeCommand } from 'services/task/command'
import { defineComponent, ref, unref, Ref } from '@vue/composition-api'
import useTable from 'hooks/useTable'
import { searchConfigs, columns, levelFilter, levelOptions } from './config'
import { Message } from 'element-ui'
import ICommon from '@/models/common'
export default defineComponent({
  setup() {
    const { list, total, params, handleDelete, loading, getList } = useTable({
      getService: getCommand,
      removeService: removeCommand
    });
    // 新增&编辑
    const dialogFormVisible = ref(false);
    const addData: Ref<ICommon> = ref({})
    function handleCreate(data: any) {
      addData.value = {}
      if (data) {
        addData.value = Object.assign({}, data)
      }
      dialogFormVisible.value = true;
    }
    const formRef = ref()
    function addSubmit() {
      const service = addData.value.id ? modifyCommand : createCommand
      formRef.value.validate(async (valid: boolean) => {
        if (valid) {
          loading.value = true
          try {
            const data = await service(unref(addData));
            if (data.success) {
              Message.success(data.message)
              dialogFormVisible.value = false
              getList()
            }
          } catch (error) {
          }
          loading.value = false
        }
      })
    }
    return {
      noChineseSpace: {
        validator: (rule: string, value: string, callback: any) => {
          if (/[\u4e00-\u9fa5\s]/.test(value)) {
            callback(new Error('输入的命令不能包含中文和空格'))
          } else {
            callback()
          }
        }
      },
      levelFilter,
      levelOptions,
      searchConfigs,
      columns,
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
</script>
<style scoped>
</style>
