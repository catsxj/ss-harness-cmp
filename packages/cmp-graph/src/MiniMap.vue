<template>
  <div id="navigator">
    <div class="panel-title">导航器</div>
    <div id="Minimap"></div>
    <div id="zoom-slider">
      <el-slider
        v-model="curZoom"
        :min="minZoom"
        :max="maxZoom"
        :step="0.01"
        :format-tooltip="formatTooltip"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Vue 3 port of original/cmp-graph/src/components/MiniMap.vue
// g6-editor 通过 #Minimap id 挂缩略图；el-slider 控制缩放
const curZoom = ref(1)
const minZoom = ref(0.5)
const maxZoom = ref(2)

const emit = defineEmits<{
  'change-zoom': [value: number]
}>()

function formatTooltip(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

function handleChange(value: number | number[]): void {
  // el-slider@Element Plus 可能传 number 或 number[]（range 模式）；此处单值
  const v = Array.isArray(value) ? value[0] : value
  emit('change-zoom', v)
}
</script>

<style lang="scss" scoped>
#navigator {
  width: 200px;
  height: 182px;
  position: absolute;
  border: 1px solid #dce3e8;
  background: #ebeef2;
  bottom: 0;
  right: 0;
  z-index: 3;

  .panel-title {
    height: 32px;
    line-height: 32px;
    text-align: center;
    border-bottom: 1px solid #dce3e8;
  }

  .slider {
    margin: 7px 10px 10px;
    float: left;
    width: 120px;
  }

  #Minimap {
    width: 200px;
    height: 120px;
  }

  #zoom-slider {
    padding: 0 20px;

    :deep(.el-slider__runway) {
      margin-top: 10px;
      margin-bottom: 10px;
    }
  }
}
</style>
