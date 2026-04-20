<template>
  <!-- TODO: cmp-element - 自研包在 compat 层处理：common-detail / basic-form / basic-form-item / AdvanceTable / status-icon 等 -->
  <el-dialog :title="'关联' + appStore.systemConfig.projectConfigLabel" v-model="config.visible" width="700px">
    <el-transfer v-model="config.value" :props="transferProps" :data="config.projects" :titles="['未选择', '已选择']" filterable :filter-method="filterMethod" filter-placeholder="请输入搜索内容"> </el-transfer>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="config.visible = false">取 消</el-button>
        <el-button type="primary" @click="sumbit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'

interface ProjectItem {
  id: number | string
  name: string
}
interface RelationConfig {
  visible: boolean
  value: Array<number | string>
  projects: ProjectItem[]
  id?: number | string
}

const props = withDefaults(
  defineProps<{
    config: RelationConfig
  }>(),
  {}
)

const emit = defineEmits<{ afterRelation: [ids: Array<number | string>] }>()

const appStore = useAppStore()

const transferProps = {
  key: 'id',
  label: 'name'
}

function filterMethod(query: string, item: ProjectItem) {
  return item.name.indexOf(query) > -1
}

function sumbit() {
  props.config.visible = false
  console.log(props.config.value)
  emit('afterRelation', props.config.value)
}

// 暴露给父组件的方法（原 Options API 下暴露 getPostData）
function getPostData() {
  return {
    groupIds: props.config.value
  }
}

defineExpose({ getPostData })
</script>

<style scoped lang="scss">
.el-transfer {
  display: flex;
  justify-content: center;
  :deep(.el-transfer__buttons) {
    display: flex;
    align-items: center;
    button {
      margin-bottom: 0 !important;
    }
  }
}
</style>
