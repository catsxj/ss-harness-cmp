/* eslint-disable no-undef */
<template>
  <div class="map-container" id="map">
  </div>
</template>

<script>
import { onMounted } from '@vue/composition-api'
import { getMapToken } from 'services/screen/outside'
import L from 'leaflet'
import Colorizr from './lib/colorizr'
import 'leaflet/dist/leaflet.css'
import { CRS } from 'proj4leaflet'

// eslint-disable-next-line new-cap
const list = [
  [120.723364, 31.324542],
  [120.725543, 31.323273],
  [120.721779, 31.322064]
]
const setRgbMinus = function(pixelSrc, pixelTarget) {
  pixelSrc.r -= pixelTarget[0];
  pixelSrc.g -= pixelTarget[1];
  pixelSrc.b -= pixelTarget[2];
  return pixelSrc
}
const mapUrl = 'http://58.210.9.131:5080/SIPGIS/tile-services/TileService/SIPSD_sipmap/MapServer'
export default {
  data: () => {
    return {
      list,
      center: L.latLng(31.324542, 120.723364)
    }
  },
  setup() {
    const initMap = token => {
      const CRS_4490 = new CRS('EPSG:3587', '+proj=longlat +ellps=GRS80 +no_defs', {
        resolutions: [132.2919312505292, 52.91677250021167, 26.458386250105836, 13.229193125052918, 5.291677250021167, 2.6458386250105836, 1.3229193125052918, 0.5291677250021167, 0.26458386250105836],
        origin: [-272140, 276660],
        bounds: L.bounds([-272141.838900000, -238788.26160000078], [314895.53250000067, 276661.727199999])
        // 这里可以有origin、transformation、scales、resulutions、bounds几个参数提供
        // 选择，其中scales与resolutions不能同时配置
      });
      const map = L.map('map', {
        crs: CRS_4490,
        // center: [21376.84679999994, 18936.732799999416],
        center: L.latLng(31.324542, 120.723364),
        zoom: 8
      });
      const url = `${mapUrl}?sipsdToken=${token}`
      // http://10.40.20.145:9090/img/{z}/{x}/{y}.png
      // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
      new Colorizr('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        colorize: function (pixel) {
          return setRgbMinus(pixel, [0, 0, 0]);
        }
      }).addTo(map);
      const icon = L.icon({
        iconUrl: '/static/img/list/test.png',
        iconSize: [77, 94],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
      // shadowUrl: 'my-icon-shadow.png',
      // shadowSize: [68, 95],
      // shadowAnchor: [22, 94]
      });
      list.forEach(item => {
        const mark = L.marker([item[1], item[0]], { icon, data: { dd: 122 } }).addTo(map);
        mark.on('click', function(e) {
          console.log(e)
        })
      })
    }
    const init = async () => {
      const { token } = await getMapToken();
      initMap(token)
    }
    init()
    return {}
  },
  mounted() {
    // const scene = new Scene({
    //   id: 'map',
    //   map: new Mapbox({
    //     style: 'dark',
    //     pitch: 45,
    //     center: [120.723364, 31.324542],
    //     zoom: 15
    //   })
    // });
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
<style>
.leaflet-zoom-animated img {
    /* hue-rotate(380deg) invert(1)*/
    filter: invert(1)!important;
    filter:sepia(50%)
}
</style>
