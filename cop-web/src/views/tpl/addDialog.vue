<template>
  <el-dialog :title="dialog.id ? '编辑场景' : '新增场景'" :close-on-click-modal="false" :visible.sync="dialog.visible" width="800px">
    <basic-form :model="addData" ref="formRef">
      <el-row :gutter="20">
        <el-col :span="12">
          <basic-form-item label="场景名称：" prop="name" validate="required">
            <el-input v-model="addData.name" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
        <el-col :span="12">
          <basic-form-item label="场景编码：" prop="code" validate="required,noChinese">
            <el-input v-model="addData.code" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <basic-form-item label="场景描述：" prop="remark">
            <el-input type="textarea" v-model="addData.remark" auto-complete="off"></el-input>
          </basic-form-item>
        </el-col>
      </el-row>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click.native="addSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Message } from 'element-ui'
import { createScene, modifyScene } from 'services/task/task'
import { defineComponent, ref } from '@vue/composition-api'

type AddSceneProps = {
  dialog: Base.IDialog
}
export default defineComponent({
  props: {
    dialog: {
      type: Object
    }
  },
  setup(props: AddSceneProps, context) {
    const addData = ref({
      ...props.dialog.record
    })
    const loading = ref(false)
    function addSubmit() {
      ;(context.refs.formRef as HTMLFormElement).validate(async (valid: boolean) => {
        if (valid) {
          const http = addData.value.id ? modifyScene : createScene
          loading.value = true
          const res = await http(addData.value)
          loading.value = false
          if (res.success) {
            Message.success(res.message)
            props.dialog.visible = false
            context.emit('getData')
          }
        }
      })
    }
    return {
      addData,
      loading,
      addSubmit
    }
  }
})
</script>
