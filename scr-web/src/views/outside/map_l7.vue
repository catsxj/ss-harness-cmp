/* eslint-disable no-undef */
<template>
  <div class="map-container" id="map">
  </div>
</template>

<script>
import { onMounted } from '@vue/composition-api'
import { Scene, ImageLayer } from '@antv/l7';
import { Mapbox, GaodeMap } from '@antv/l7-maps';
import { CityLayer } from '@antv/l7-district';

const list = [
  [120.723364, 31.324542],
  [120.725543, 31.323273],
  [120.721779, 31.322064]
]
export default {
  data: () => {
    return {
    }
  },
  setup() {
    onMounted(async () => {
      const scene = new Scene({
        id: 'map',
        map: new GaodeMap({
          // style: 'dark',
          // style: {
          //   version: 8,
          //   name: 'Mapbox Streets',
          //   // sprite: 'http://localhost:8080/mapbox_build/sprite/sprite',
          //   // glyphs: 'http://localhost:8080/mapbox_build/fonts/{fontstack}/{range}.pbf',
          //   sources: {
          //     'osm-tiles': {
          //       type: 'raster',
          //       tiles: [
          //         'http://10.40.20.145:9090/img/{z}/{x}/{y}.png'
          //       ],
          //       tileSize: 256
          //     }
          //   },
          //   layers: [{
          //     id: '123',
          //     type: 'raster',
          //     source: 'osm-tiles',
          //     'source-layer': 'osmtiles'
          //   }]
          // },
          pitch: 45,
          center: [120.723343, 31.324036],
          zoom: 13
        })
      });
      scene.on('loaded', () => {
        const layer = new ImageLayer({});
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
        });
        scene.addLayer(layer)
      });
    })
    return {}
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: black
}
</style>
