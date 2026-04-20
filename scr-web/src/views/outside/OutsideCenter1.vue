<template>
  <MapEcharts id="test" class="chart" height="100%" width="100%"/>
</template>

<script setup lang="ts">
import MapEcharts from 'components/echarts/map-suzhou/MapCharts.vue'
</script>
<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 100%;
  background: url('/static/img/outside/map.png') no-repeat;
  background-size: 100%;
}
</style>
