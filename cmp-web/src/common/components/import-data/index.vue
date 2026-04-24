<template>
  <span>
    <el-button class="m-l-sm m-r-sm" @click.stop="openDialog" icon="el-icon-upload2">导入 </el-button>
    <el-dialog title="导入Excel新增数据" :close-on-click-modal="false" v-model:visible="dialogVisible" width="480px" append-to-body>
      <el-row>
        <el-col :span="24">
          <el-alert title="" type="warning" :closable="false">
            <template #default>
              <div class="text-center">
                <p>您是否有标准的Excel模版，需要依照模版导入，否则会失败。</p>
                <a class="text-info cur-point" @click="exportData()">还没有Excel模版?请下载模版</a>
              </div>
            </template>
          </el-alert>
        </el-col>
        <el-col :span="24" class="text-center m-t">
          <el-upload ref="uploadRef" class="upload-demo" drag accept=".xlsx" :on-success="handleSuccess" :action="url" :headers="headers" :data="params">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传excel文件</div>
          </el-upload>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </span>
</template>
<script lang="ts">
import { downloadFile } from 'utils/index'
import { getToken } from 'utils/auth'
import { reactive, toRefs, ref, defineComponent } from 'vue'
import { ElMessage as Message } from "element-plus"

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true
    },
    templateUrl: {
      type: String,
      required: true
    },
    params: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  setup(props: any, context: any) {
    const state = reactive({
      dialogVisible: false,
      headers: { token: getToken() }
    })
    const uploadRef = ref(null)
    function openDialog() {
      uploadRef.value && (uploadRef.value as any).clearFiles()
      state.dialogVisible = true
      state.headers.token = getToken()
    }
    // 导出数据
    function exportData() {
      downloadFile(props.templateUrl, props.params)
    }
    // 数据导入成功回调
    function handleSuccess(res: Base.IResponseData) {
      if (res.success) {
        Message.success(res.message)
        state.dialogVisible = false
        context.emit('getData')
      } else {
        Message.error(res.message)
      }
    }
    return {
      ...toRefs(state),
      uploadRef,
      openDialog,
      exportData,
      handleSuccess
    }
  }
})
</script>
