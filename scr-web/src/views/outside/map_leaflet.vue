/* eslint-disable no-undef */
<template>
  <div class="map-container" id="map">
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getMapToken } from 'services/screen/outside'
import L from 'leaflet'
import Colorizr from './lib/colorizr'
import 'leaflet/dist/leaflet.css'
import { CRS } from 'proj4leaflet'

const list = [
  [120.723364, 31.324542],
  [120.725543, 31.323273],
  [120.721779, 31.322064]
]

interface PixelSrc {
  r: number
  g: number
  b: number
}

const setRgbMinus = function (pixelSrc: PixelSrc, pixelTarget: number[]) {
  pixelSrc.r -= pixelTarget[0]
  pixelSrc.g -= pixelTarget[1]
  pixelSrc.b -= pixelTarget[2]
  return pixelSrc
}

const mapUrlLocal = 'http://58.210.9.131:5080/SIPGIS/tile-services/TileService/SIPSD_sipmap/MapServer'

const initMap = (token: string) => {
  const CRS_4490 = new CRS('EPSG:3587', '+proj=longlat +ellps=GRS80 +no_defs', {
    resolutions: [132.2919312505292, 52.91677250021167, 26.458386250105836, 13.229193125052918, 5.291677250021167, 2.6458386250105836, 1.3229193125052918, 0.5291677250021167, 0.26458386250105836],
    origin: [-272140, 276660],
    bounds: L.bounds([-272141.838900000, -238788.26160000078], [314895.53250000067, 276661.727199999])
  })
  const map = L.map('map', {
    crs: CRS_4490 as L.CRS,
    center: L.latLng(31.324542, 120.723364),
    zoom: 8
  })
  const url = `${mapUrlLocal}?sipsdToken=${token}`
  new Colorizr('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    colorize: function (pixel: PixelSrc) {
      return setRgbMinus(pixel, [0, 0, 0])
    }
  }).addTo(map)
  const icon = L.icon({
    iconUrl: '/static/img/list/test.png',
    iconSize: [77, 94] as L.PointExpression,
    iconAnchor: [22, 94] as L.PointExpression,
    popupAnchor: [-3, -76] as L.PointExpression
  })
  list.forEach((item) => {
    const mark = L.marker([item[1], item[0]], { icon }).addTo(map)
    mark.on('click', function (e: L.LeafletEvent) {
      console.log(e)
    })
  })
}

const init = async () => {
  const { token } = await getMapToken()
  initMap(token)
}
init()
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
