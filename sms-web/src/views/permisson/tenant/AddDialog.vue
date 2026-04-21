<template>
  <el-dialog
    class="wizard-dialog"
    width="1160px"
    :close-on-click-modal="false"
    :show-close="true"
    v-model="props.dialog.visible"
  >
    <!-- 顶部标题栏 -->
    <template #header>
      <div class="wizard__head">
        <h3 class="wizard__title">{{ props.dialog.title || '新建' }}</h3>
        <p class="wizard__subtitle">{{ props.dialog.des }}</p>
      </div>
    </template>

    <div class="wizard__body">
      <!-- 左侧步骤栏 -->
      <aside class="wizard__aside">
        <ol class="step-list">
          <li
            v-for="(item, idx) in props.dialog.leftStepList"
            :key="item"
            class="step-item"
            :class="{
              'is-active': idx === activeStep,
              'is-done': idx < activeStep
            }"
          >
            <span class="step-item__mark" aria-hidden="true">
              <svg v-if="idx < activeStep" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6.5L5 9l4.5-5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <template v-else>{{ idx + 1 }}</template>
            </span>
            <span class="step-item__label">{{ item }}</span>
            <span
              v-if="idx < props.dialog.leftStepList.length - 1"
              class="step-item__line"
              aria-hidden="true"
            ></span>
          </li>
        </ol>
      </aside>

      <!-- 右侧内容 -->
      <section class="wizard__content">
        <div v-show="activeStep === 0" class="wizard__pane">
          <div class="wizard__section-title">{{ props.dialog.rightContent[0].title }}</div>
          <div class="wizard__form-area">
            <slot name="first"></slot>
          </div>
        </div>
        <div v-show="activeStep === 1" class="wizard__pane">
          <div class="wizard__section-title">{{ props.dialog.rightContent[1].title }}</div>
          <div class="wizard__form-area">
            <slot name="second"></slot>
          </div>
        </div>
        <div v-show="activeStep === 2" class="wizard__pane">
          <div class="wizard__section-title">{{ props.dialog.rightContent[2].title }}</div>
          <div class="wizard__form-area">
            <slot name="third"></slot>
          </div>
        </div>
      </section>
    </div>

    <!-- 底部按钮栏 -->
    <template #footer>
      <div class="wizard__foot">
        <button type="button" class="wiz-btn wiz-btn--ghost" @click="clear">取消</button>
        <button
          v-if="activeStep > 0"
          type="button"
          class="wiz-btn wiz-btn--ghost"
          @click="prevStep"
        >上一步</button>
        <button
          v-if="activeStep < props.dialog.leftStepList.length - 1"
          type="button"
          class="wiz-btn wiz-btn--solid"
          @click="nextStep"
        >下一步</button>
        <button
          v-else
          type="button"
          class="wiz-btn wiz-btn--solid"
          :disabled="loading"
          @click="create"
        >{{ loading ? '提交中…' : '完成' }}</button>
      </div>
    </template>
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
@import '@/common/compat/tokens';

// el-dialog 容器外观（通过 :deep 穿透）
.wizard-dialog :deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: $shadow-floating;
  padding: 0 !important;
}
.wizard-dialog :deep(.el-dialog__header) {
  padding: 20px 28px 14px !important;
  margin: 0 !important;
  border-bottom: 1px solid $border-hairline;
}
.wizard-dialog :deep(.el-dialog__body) {
  padding: 0 !important;
}
.wizard-dialog :deep(.el-dialog__footer) {
  padding: 14px 24px !important;
  border-top: 1px solid $border-hairline;
  background: $bg-subtle;
}
.wizard-dialog :deep(.el-dialog__close) {
  color: $text-muted;
  font-size: 16px;
  transition: color $dur-fast $ease-out;
  &:hover { color: $text-primary; }
}

// 顶部
.wizard__head {
  padding-right: 24px;
}
.wizard__title {
  margin: 0;
  font-family: $font-display;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: $tracking-tight;
  color: $text-primary;
}
.wizard__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: $text-muted;
  letter-spacing: 0.01em;
}

// body：flex 左右分栏
.wizard__body {
  display: flex;
  min-height: 460px;
}

// 左侧步骤栏
.wizard__aside {
  flex: 0 0 220px;
  padding: 28px 24px;
  background: $bg-subtle;
  border-right: 1px solid $border-hairline;
}

.step-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.step-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-family: $font-body;
  font-size: 13px;
  color: $text-muted;
  transition: color $dur-fast $ease-out;

  &__mark {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: $bg-surface;
    color: $text-muted;
    font-size: 12px;
    font-family: $font-mono;
    font-weight: 600;
    border: 1.5px solid $border-solid;
    flex-shrink: 0;
    transition: all $dur-base $ease-out;
  }

  &__label {
    font-weight: 500;
    letter-spacing: 0.01em;
    transition: color $dur-base $ease-out;
  }

  &__line {
    position: absolute;
    top: 36px;
    left: 12.5px;
    bottom: -10px;
    width: 1.5px;
    background: $border-solid;
    z-index: 0;
  }

  &.is-active {
    color: $text-primary;
    .step-item__mark {
      background: $accent;
      color: $text-inverse;
      border-color: $accent;
      box-shadow: 0 0 0 4px $accent-soft;
    }
    .step-item__label {
      color: $text-primary;
      font-weight: 600;
    }
  }

  &.is-done {
    color: $text-secondary;
    .step-item__mark {
      background: $accent;
      color: $text-inverse;
      border-color: $accent;
    }
    .step-item__line {
      background: $accent;
    }
  }
}

// 右侧内容
.wizard__content {
  flex: 1;
  min-width: 0;
  background: $bg-surface;
  padding: 24px 32px;
  overflow-y: auto;
  max-height: 560px;
}

.wizard__pane {
  animation: fade-in 200ms $ease-out;
}

.wizard__section-title {
  font-family: $font-display;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: $tracking-tight;
  color: $text-primary;
  padding-bottom: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid $border-hairline;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 28px;
    height: 2px;
    background: $accent;
    border-radius: 1px;
  }
}

.wizard__form-area {
  padding-top: 4px;
}

// 底部按钮栏
.wizard__foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.wiz-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-family: $font-body;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all $dur-fast $ease-out;

  &:active:not(:disabled) { transform: translateY(1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }

  &--solid {
    background: $accent;
    color: $text-inverse;
    border-color: $accent;
    &:hover:not(:disabled) {
      background: $accent-hover;
      border-color: $accent-hover;
    }
  }
  &--ghost {
    background: $bg-surface;
    color: $text-secondary;
    border-color: $border-solid;
    &:hover:not(:disabled) {
      background: $bg-subtle;
      color: $text-primary;
      border-color: $border-emphasis;
    }
  }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
