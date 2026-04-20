<template>
  <el-dialog width="1160px" :close-on-click-modal="false" v-model="props.dialog.visible">
    <div class="left-title">
      <div class="left-title__header">
        <h3>{{ props.dialog.title }}</h3>
        <p>{{ props.dialog.des }}</p>
      </div>
      <el-steps :active="activeStep" align-center class="m-b" direction="vertical">
        <el-step :title="item" v-for="item in props.dialog.leftStepList" :key="item"></el-step>
      </el-steps>
    </div>
    <div class="right-content">
      <div v-show="activeStep === 0">
        <div class="title">{{ props.dialog.rightContent[0].title }}</div>
        <div class="wrapper">
          <slot name="first"></slot>
        </div>
        <div class="footer">
          <el-button class="pull-right m-r" type="primary" @click="nextStep()">下一步</el-button>
          <el-button class="pull-right m-r clear" @click="clear">取消</el-button>
        </div>
      </div>
      <div v-show="activeStep === 1">
        <div class="title">{{ props.dialog.rightContent[1].title }}</div>
        <div class="wrapper">
          <slot name="second"></slot>
        </div>
        <div class="footer">
          <el-button class="pull-right m-r" type="primary" @click="nextStep()">下一步</el-button>
          <el-button class="pull-right m-r" type="primary" @click="prevStep()">上一步</el-button>
          <el-button class="pull-right m-r clear" @click="clear">取消</el-button>
        </div>
      </div>
      <div v-show="activeStep === 2">
        <div class="title">{{ props.dialog.rightContent[2].title }}</div>
        <div class="wrapper">
          <slot name="third"></slot>
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

interface RightContentItem {
  title: string
  ref: string
}
interface AddDialogItem {
  visible: boolean
  title: string
  des: string
  leftStepList: string[]
  rightContent: RightContentItem[]
  parentId?: number
}

const props = defineProps<{ dialog: AddDialogItem }>()
const emit = defineEmits<{
  getData: []
  clearAddDialog: []
}>()

const activeStep = ref(0)
const postData = ref<any>({})
const loading = ref(false)
const route = useRoute()

// 保留 $parent 访问叶子 ref 的行为（外部通过具名 slot 传入，父级在 refs 中注册）
const instance = getCurrentInstance()

function getParentRef(name: string): any {
  const parentRefs = (instance?.parent as any)?.refs
  return parentRefs?.[name]
}

async function nextStep() {
  if (activeStep.value === 0) {
    const data = await getParentRef(props.dialog.rightContent[0].ref)?.getPostData()
    if (data) postData.value = data
    else return false
  }
  ++activeStep.value
}

function prevStep() {
  --activeStep.value
}

async function create() {
  const list = getParentRef(props.dialog.rightContent[1].ref)?.getPostData()
  const data = getParentRef(props.dialog.rightContent[2].ref)?.getPostData()
  loading.value = true
  let res: any = null
  if (route.path.indexOf('tenants') !== -1) {
    res = await createTenant({ ...postData.value, ...list, ...data })
  } else if (route.path.indexOf('project') !== -1) {
    res = await createProject({ ...postData.value, ...list, ...data })
  }
  if (res?.success) {
    props.dialog.visible = false
    ElMessage.success(res.message)
    emit('getData')
  }
  loading.value = false
}

function clear() {
  emit('clearAddDialog')
}
</script>

<style scoped lang="scss">
@import 'index';
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
            z-index: 99;
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
