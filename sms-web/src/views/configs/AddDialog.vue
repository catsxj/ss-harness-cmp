<template>
  <el-dialog width="1100px" :close-on-click-modal="false" v-model="dialog.visible">
    <div class="left-title">
      <div class="left-title__header">
        <h3>{{ dialog.title }}</h3>
        <p>{{ dialog.des }}</p>
      </div>
      <el-steps :active="activeStep" align-center class="m-b" direction="vertical">
        <el-step :title="item" v-for="item in dialog.leftStepList" :key="item"></el-step>
      </el-steps>
    </div>
    <div class="right-content">
      <div :span="24" v-show="activeStep === 0">
        <div class="title">{{ dialog.rightContent[0].title }}</div>
        <div class="wrapper">
          <slot name="first"></slot>
        </div>
        <div class="footer">
          <el-button class="pull-right m-r" type="primary" @click="nextStep()">下一步</el-button>
          <el-button class="pull-right m-r clear" @click="clear">取消</el-button>
        </div>
      </div>
      <div :span="24" v-show="activeStep === 1">
        <div class="title">{{ dialog.rightContent[1].title }}</div>
        <div class="wrapper">
          <slot name="second"></slot>
        </div>
        <div class="footer">
          <el-button class="pull-right m-r" type="primary" @click="create()" :loading="loading">完成</el-button>
          <el-button class="pull-right m-r" type="primary" @click="prevStep()">上一步</el-button>
          <el-button class="pull-right m-r clear" @click="clear">取消</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createTenant } from 'services/system/tenant'
import { createProject } from 'services/system/project'

interface DialogRightItem {
  title: string
  ref: string
}
interface DialogData {
  visible: boolean
  title?: string
  des?: string
  leftStepList: string[]
  rightContent: DialogRightItem[]
  [key: string]: unknown
}

const props = defineProps<{ dialog: DialogData }>()
const emit = defineEmits<{ clearAddDialog: [type: string] }>()

const activeStep = ref(0)
// TODO: type - 表单项提交数据后续补具体类型
const postData = ref<Record<string, any>>({})
const loading = ref(false)

const route = useRoute()
const instance = getCurrentInstance()

async function nextStep() {
  if (activeStep.value === 0) {
    // TODO: type - cmp-element 兼容层，父组件 ref 类型后续由 compat 层提供
    const parentRefs = (instance?.parent?.refs ?? {}) as Record<string, any>
    const data = await parentRefs[props.dialog.rightContent[0].ref]?.getPostData()
    console.log(data)
    if (data) postData.value = data
    else return false
  }
  ++activeStep.value
}

function prevStep() {
  --activeStep.value
}

async function create() {
  // TODO: type - cmp-element 兼容层，父组件 ref 类型后续由 compat 层提供
  const parentRefs = (instance?.parent?.refs ?? {}) as Record<string, any>
  const data = await parentRefs[props.dialog.rightContent[0].ref]?.getPostData()
  const list = await parentRefs[props.dialog.rightContent[1].ref]?.getPostData()
  console.log(list)
  if (data) {
    postData.value = {
      ...data,
      ...list
    }
  }
  console.log(postData.value)
  loading.value = true
  // TODO: type - res 具体返回类型后续由 services 补全
  let res: any = null
  if (route.path.indexOf('tenants') !== -1) {
    res = await createTenant({
      ...data
    }).finally(() => {
      loading.value = false
    })
  } else if (route.path.indexOf('project') !== -1) {
    res = await createProject({
      ...postData.value
    }).finally(() => {
      loading.value = false
    })
  }
  if (res && res.success) {
    props.dialog.visible = false
    ElMessage.success(res.message)
    // TODO: type - cmp-element 兼容层，父组件方法类型后续由 compat 层提供
    const parent = instance?.parent?.exposed as any
    parent?.clearAddDialog?.()
  }
}

function clear() {
  emit('clearAddDialog', 'clear')
}
</script>
<style scoped lang="scss">
.el-dialog__wrapper {
  :deep(.el-dialog) {
    .el-dialog__header {
      padding: 0 !important;
      background-color: #fff !important;
      border: none !important;
      display: none;
    }
    .el-dialog__body {
      padding: 0 !important;
      display: flex;
      height: 508px;
      .left-title {
        color: #ffffff;
        background-color: rgba(33, 36, 46, 1);
        height: 100%;
        flex: 0 0 160px;
        padding: 20px 30px;
        .el-step {
          .is-process {
            color: #fff !important;
            font-weight: 300 !important;
            .is-text {
              background-color: #4d8ef0;
            }
          }
          .is-text {
            background-color: #21242e;
            font-weight: 300;
          }
        }
        .left-title__header {
          h3 {
            padding: 0;
            margin: 0;
            font-size: 14px;
            color: #fff !important;
          }
          p {
            margin-top: 6px;
            font-size: 12px;
          }
        }
      }
      .right-content {
        flex: 1;
        height: 508px;
        background-color: #fff;

        > div {
          position: relative;
          height: 100%;
          padding: 20px;
          .title {
            font-weight: 700;
            margin-bottom: 20px;
          }
          .wrapper {
            height: 420px;
            background-color: #fff;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 40px;
          }
          .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgb(240, 243, 250);
            border-top: 1px solid rgb(221, 221, 221);
            height: 55px;
            .m-r {
              margin-top: 12px;
            }
          }
        }
      }
    }
  }
}
</style>
