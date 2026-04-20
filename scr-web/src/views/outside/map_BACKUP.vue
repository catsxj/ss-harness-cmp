/* eslint-disable no-undef */
<template>
  <div class="map-container" id="map">
    <div @click="selectDc(item)" class="popup-container" :class="step === 1 && 'show'" :id="`popup${item.id}`" v-for="(item, index) in dcList" :key="index">
      <div class="content">
        <div class="header">{{item.name}}</div>
        <div class="count-wrapper">
          <div class="count-item">
            <span class="count-label">云主机</span>
            <span class="count-value">{{item.vm}}(个)</span>
          </div>
          <div class="count-item">
            <span class="count-label">内存</span>
            <span class="count-value">{{item.mem}}(GB)</span>
          </div>
          <div class="count-item">
            <span class="count-label">CPU</span>
            <span class="count-value">{{item.cpu}}(C)</span>
          </div>
          <div class="count-item">
            <span class="count-label">存储</span>
            <span class="count-value">{{item.disk}}(TB)</span>
          </div>
        </div>
      </div>
      <div class="location-icon">
        <img src="/static/img/outside/icon.gif" alt="">
      </div>
    </div>
    <div id="step2-popup" v-show="step === 2" @click="goStep3()">
      <img src="/static/img/outside/two_icon.gif" alt="">
    </div>
    <div v-if="step === 3">
      <img @click="getData(item)" width="100px" :id="`step3-popup${item.id}`" src="/static/img/outside/one_icon.gif" v-for="(item, index) in departList" :key="index" alt="">
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, nextTick } from 'vue'
import { getMapToken, getMapConfig, mapUrl } from 'services/screen/outside'
import TileGrid from 'ol/tilegrid/TileGrid'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style } from 'ol/style'
import VectorSource from 'ol/source/Vector'
import { Vector as VectorLayer } from 'ol/layer'
import Overlay from 'ol/Overlay'

interface DcItem {
  id: number
  name: string
  vm: number
  mem: number
  cpu: number
  disk: number
  coordinate: number[]
}

interface DepartItem {
  id: number
  coordinate: number[]
}

interface Props {
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 1
})

const dcList: DcItem[] = [
  {
    id: 1,
    name: '政务云',
    vm: 256,
    mem: 345,
    cpu: 236,
    disk: 111,
    coordinate: [63641.82242120001, 46084.01155038807]
  },
  {
    id: 2,
    name: '华为云',
    vm: 256,
    mem: 345,
    cpu: 236,
    disk: 111,
    coordinate: [63492.63401205533, 45838.25950269735]
  },
  {
    id: 3,
    name: '天翼云',
    vm: 256,
    mem: 345,
    cpu: 236,
    disk: 111,
    coordinate: [63850.3490805519, 45963.65337766594]
  }
]

const departList: DepartItem[] = [
  { id: 1, coordinate: [63601.581372370296, 46117.92964733732] },
  { id: 2, coordinate: [63629.11883950074, 46119.58603633764] },
  { id: 3, coordinate: [63601.581372370296, 46117.92964733732] },
  { id: 4, coordinate: [63668.25102963349, 46108.19836196039] },
  { id: 5, coordinate: [63622.49328349943, 46099.91641695875] },
  { id: 6, coordinate: [63610.27741462202, 46101.36575733404] },
  { id: 7, coordinate: [63646.0968267541, 46101.158708708994] },
  { id: 8, coordinate: [63624.97786699992, 46056.85030295023] },
  { id: 9, coordinate: [63673.22019663447, 46063.88995620162] },
  { id: 10, coordinate: [63671.14971038406, 46051.467038699164] },
  { id: 11, coordinate: [63630.36113125099, 46049.18950382371] }
]

const state = reactive({
  step: 1
})

const { step } = toRefs(state)

let step3Overlays: Overlay[] = []
let map: InstanceType<typeof Map> | null = null
let view: InstanceType<typeof View> | null = null
let stepOverlay: Overlay | null = null

const initMap = (token: string, options: Record<string, unknown>) => {
  const { fullExtent, tileInfo, resolutions } = options as {
    fullExtent: { xmin: number; ymin: number; xmax: number; ymax: number }
    tileInfo: { origin: { x: number; y: number }; cols: number; rows: number }
    resolutions: number[]
  }
  view = new View({
    center: [63603.76576501422, 46081.73856770954],
    zoom: 18.1
  })
  map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          tileGrid: new TileGrid({
            extent: [
              fullExtent.xmin,
              fullExtent.ymin,
              fullExtent.xmax,
              fullExtent.ymax
            ],
            origin: [tileInfo.origin.x, tileInfo.origin.y],
            resolutions,
            tileSize: [tileInfo.cols, tileInfo.rows]
          }),
          url: mapUrl + '/tile/{z}/{y}/{x}?sipsdToken=' + token
        })
      })
    ],
    view
  })
  map.on('singleclick', function (e: unknown) {
    featureClick(e as { pixel: number[] })
  })
  map.on('moveend', function () {
    if (state.step === 1) return
    const zoom = view!.getZoom()!
    if (zoom <= 18) {
      if (step3Overlays.length) {
        step3Overlays.forEach((item) => {
          map!.removeOverlay(item)
        })
        step3Overlays = []
      }
      state.step = 1
    }
  })
}

// 添加mark
let vectorLayer: VectorLayer<VectorSource> | null = null
const addFeatures = (list: { coordinate: number[] }[]) => {
  const features = list.map((item) => {
    const iconFeature = new Feature({
      geometry: new Point(item.coordinate),
      coordinate: item.coordinate
    })
    const iconMap: Record<number, string> = {
      1: '/static/img/outside/one_icon.png',
      2: '/static/img/outside/test.gif',
      3: '/static/img/outside/icon.png'
    }
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        src: iconMap[state.step]
      })
    })
    iconFeature.setStyle(iconStyle)
    return iconFeature
  })
  const vectorSource = new VectorSource({
    features: features
  })

  vectorLayer = new VectorLayer({
    source: vectorSource
  })
  map!.addLayer(vectorLayer)
}

// popup
const addPopup = (item: { id?: number | string; coordinate?: number[] }, options: { prefix?: string; overlayOpt?: Record<string, unknown> } = {}) => {
  const { id = '', coordinate } = item
  const { prefix = 'popup', overlayOpt = {} } = options
  const container = document.getElementById(`${prefix}${id}`)
  const overlay = new Overlay({
    element: container!,
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    },
    ...overlayOpt
  })
  map!.addOverlay(overlay)
  coordinate && overlay.setPosition(coordinate)
  return overlay
}

// mark单击操作
const featureClick = (e: { pixel: number[] }) => {
  const removeLayer = () => {
    map!.removeLayer(vectorLayer!)
    vectorLayer = null
  }
  const [x, y] = e.pixel
  map!.forEachFeatureAtPixel(
    [x / props.scale, y / props.scale],
    function (feature: Feature) {
      const coordinate = feature.get('coordinate') as number[]
      switch (state.step) {
        case 1:
          removeLayer()
          state.step = 2
          addFeatures([{ coordinate }])
          view!.setZoom(20)
          view!.setCenter(coordinate)
          break
        case 2:
          removeLayer()
      }
    }
  )
}

// 选择数据中心
const selectDc = (item: DcItem) => {
  state.step = 2
  const { coordinate } = item
  stepOverlay!.setPosition(coordinate)
  view!.setZoom(20)
  view!.setCenter(coordinate)
}

// 去往第三步
const goStep3 = async () => {
  state.step = 3
  await nextTick()
  step3Overlays = []
  departList.forEach((item) => {
    const overlay = addPopup(item, {
      prefix: 'step3-popup',
      overlayOpt: {
        offset: [-30, -30]
      }
    })
    step3Overlays.push(overlay)
  })
}

const init = async () => {
  const { token } = await getMapToken()
  const res = await getMapConfig(token)
  const { fullExtent, tileInfo } = res
  const resolutions = tileInfo.lods.map((item: { resolution: number }) => item.resolution)
  initMap(token, {
    fullExtent,
    tileInfo,
    resolutions
  })
  dcList.forEach((item) => {
    addPopup(item, {
      overlayOpt: {
        offset: [-10, -170]
      }
    })
  })
  stepOverlay = addPopup({}, {
    prefix: 'step2-popup',
    overlayOpt: {
      positioning: 'center-center'
    }
  })
}
init()

const getData = (item: DepartItem) => {
  console.log(map)
}
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: black;
}
.popup-container {
  position: relative;
  display: none;
  width: 379px;
  height: 124px;
  background: url('/static/img/outside/popup_bg.png') no-repeat;
  background-size: 100% 100%;
  .location-icon {
    position: absolute;
    bottom: -105px;
    left: -38px;
    img {
      width: 100px;
    }
  }
  &.show {
    display: inline-block;
  }
  .header {
    color: #fff;
    font-size: 22px;
    height: 37px;
    line-height: 37px;
    padding: 2px 35px;
  }
  .count-wrapper {
    padding: 8px 20px;
    display: flex;
    flex-wrap: wrap;
  }
  .count-item {
    width: 50%;
    margin-bottom: 15px;
    display: flex;
    font-size: 16px;
  }
  .count-label {
    width: 60px;
    color: rgba(255, 255, 255, 0.8);
  }
  .count-value {
    color: #ffffff;
    font-weight: bold;
    flex: 1;
    text-align: left;
  }
}
</style>
<style>
.ol-layer canvas {
  /* hue-rotate(380deg) invert(1)*/
  filter: invert(1) !important;
  filter: sepia(50%);
}
</style>
