<template>
  <el-select clearable :model-value="iconName" placeholder="请选择图标" filterable @change="change">
    <el-option v-for="item in iconData" :key="item" :label="item" :value="item">
      <svg-icon :icon-name="item"></svg-icon>
      {{ item }}
    </el-option>
  </el-select>
</template>
<script setup lang="ts">
import elementIcons from './elementIcons'
import svgIcons from './svgIcons'

defineProps<{ iconName: string }>()
const emit = defineEmits<{ change: [val: string] }>()

const iconData = [...svgIcons, ...elementIcons.map((item) => `el-icon-${item}`)]

const change = (val: string) => {
  emit('change', val)
}
</script>
