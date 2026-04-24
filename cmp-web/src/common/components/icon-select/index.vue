<template>
  <el-select clearable :value="iconName" placeholder="请选择图标" filterable="" @change="change">
    <el-option v-for="item in iconData" :key="item" :label="item" :value="item">
      <svg-icon :icon-name="item"></svg-icon>
      {{ item }}
    </el-option>
  </el-select>
</template>
<script lang="ts">
import elementIcons from './elementIcons'
import svgIcons from './svgIcons'
import { defineComponent } from 'vue'

export default defineComponent({
  model: {
    prop: 'iconName',
    event: 'change'
  },
  props: {
    iconName: {
      required: true
    }
  },
  setup(props, context) {
    const iconData = [...svgIcons, ...elementIcons.map((item) => `el-icon-${item}`)]
    const change = (val: string) => {
      context.emit('change', val)
    }
    return {
      iconData,
      change
    }
  }
})
</script>
