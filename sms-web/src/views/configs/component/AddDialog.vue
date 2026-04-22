<template>
  <el-dialog width="1100px" v-model="dialogData.visible">
    <div class="nav">
      <el-steps direction="vertical" :active="currentStepIndex + 1">
        <el-step :title="item.step" v-for="(item, index) in dialogData.steps" :key="index"></el-step>
      </el-steps>
    </div>
    <div class="content">
      <div v-for="(item, index) in dialogData.steps" :key="index" v-show="index === currentStepIndex">
        <slot :name="item.slot"></slot>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogData.visible = false">取 消</el-button>
        <el-button @click="prev" v-if="currentStepIndex !== 0">上一步</el-button>
        <el-button @click="next" v-if="currentStepIndex !== dialogData.steps.length - 1">下一步</el-button>
        <el-button type="primary" @click="submit()">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface StepItem {
  step: string
  slot: string
}
interface DialogData {
  visible: boolean
  steps: StepItem[]
}

defineProps<{ dialogData: DialogData }>()
const emit = defineEmits<{
  getBasicPostData: []
  postData: []
}>()

const currentStepIndex = ref(0)

function handleClose() {
  /* noop */
}

function next() {
  emit('getBasicPostData')
  currentStepIndex.value += 1
}

function prev() {
  currentStepIndex.value -= 1
}

function submit() {
  emit('postData')
}

defineExpose({ handleClose, currentStepIndex, next, prev, submit })
</script>

<style>
.el-dialog {
  height: 600px;
}
.el-dialog .el-dialog__body {
  display: flex;
  padding: 0;
  height: 500px;
}
.el-dialog__header {
  display: none;
}
.nav {
  width: 240px;
  background-color: rgb(104, 75, 75);
}
.content {
  position: relative;
  width: 100%;
}
.dialog-footer {
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
}
</style>
