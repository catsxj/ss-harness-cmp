/* eslint-disable no-undef */
<template>
  <div class="map-container" id="map">
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Scene, ImageLayer } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'

const list = [
  [120.723364, 31.324542],
  [120.725543, 31.323273],
  [120.721779, 31.322064]
]

onMounted(async () => {
  const scene = new Scene({
    id: 'map',
    map: new GaodeMap({
      pitch: 45,
      center: [120.723343, 31.324036],
      zoom: 13
    })
  })
  scene.on('loaded', () => {
    const layer = new ImageLayer({})
    layer.source(
      '/static/img/test.png',
      {
        parser: {
          type: 'image',
          extent: [120.640872, 31.234622, 120.864791, 31.435865]
        }
      }
    ).style({
      opacity: 1
    })
    scene.addLayer(layer)
  })
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: black
}
</style>
