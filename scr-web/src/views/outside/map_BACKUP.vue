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

<script>
import { onMounted, reactive, toRefs, nextTick } from '@vue/composition-api'
import { getMapToken, getMapConfig, mapUrl } from 'services/screen/outside'
import TileGrid from 'ol/tilegrid/TileGrid'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import OSM from 'ol/source/OSM'
import { transform } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style, Text } from 'ol/style'
import VectorSource from 'ol/source/Vector'
import { Vector as VectorLayer } from 'ol/layer'
import Overlay from 'ol/Overlay'

const dcList = [
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
];
const departList = [
  {
    id: 1,
    coordinate: [63601.581372370296, 46117.92964733732]
  },
  {
    id: 2,
    coordinate: [63629.11883950074, 46119.58603633764]
  },
  {
    id: 3,
    coordinate: [63601.581372370296, 46117.92964733732]
  },
  {
    id: 4,
    coordinate: [63668.25102963349, 46108.19836196039]
  },
  {
    id: 5,
    coordinate: [63622.49328349943, 46099.91641695875]
  },
  {
    id: 6,
    coordinate: [63610.27741462202, 46101.36575733404]
  },
  {
    id: 7,
    coordinate: [63646.0968267541, 46101.158708708994]
  },
  {
    id: 8,
    coordinate: [63624.97786699992, 46056.85030295023]
  },
  {
    id: 9,
    coordinate: [63673.22019663447, 46063.88995620162]
  },
  {
    id: 10,
    coordinate: [63671.14971038406, 46051.467038699164]
  },
  {
    id: 11,
    coordinate: [63630.36113125099, 46049.18950382371]
  }
]
export default {
  props: {
    scale: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    const state = reactive({
      step: 1
    });
    let step3Overlays = []
    let map = null
    let view = null
    let stepOverlay = null
    const initMap = (token, options) => {
      const { fullExtent, tileInfo, resolutions } = options
      view = new View({
        center: [63603.76576501422, 46081.73856770954],
        // center: transform([21376.84679999994, 18936.732799999416], 'EPSG:3857', 'EPSG:4326'),
        // center: [120.723364, 31.324542],
        // projection: 'EPSG:4326',
        zoom: 18.1
      })
      map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            // source: new OSM()
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
      map.on('singleclick', function (e) {
        featureClick(e)
      })
      map.on('moveend', function (e) {
        // 缩放重置状态，等于1时直接返回
        if (state.step === 1) return
        const zoom = view.getZoom() // 获取当前地图的缩放级别
        if (zoom <= 18) {
          if (step3Overlays.length) {
            step3Overlays.forEach(item => {
              map.removeOverlay(item)
            });
            step3Overlays = [];
          }
          state.step = 1
          // addFeatures(dcList)
        }
      })
    }
    // 添加mark
    let vectorLayer = null
    const addFeatures = (list) => {
      const features = list.map((item) => {
        const iconFeature = new Feature({
          geometry: new Point(item.coordinate),
          coordinate: item.coordinate
        })
        const iconMap = {
          1: '/static/img/outside/one_icon.png',
          2: '/static/img/outside/test.gif',
          3: '/static/img/outside/icon.png'
        }
        const iconStyle = new Style({
          image: new Icon({
            anchor: [0.5, 0.5],
            src: iconMap[state.step]
          })
          // 设置marker的label
          // text: new Text({
          //   textAlign: 'center',
          //   textBaseline: 'bottom',
          //   // font: font,
          //   offsetX: 0,
          //   offsetY: 20,
          //   padding: [0, 2, 0, 2],
          //   text: '1111'
          // })
        })
        iconFeature.setStyle(iconStyle)
        return iconFeature
      })
      var vectorSource = new VectorSource({
        features: features
      })

      vectorLayer = new VectorLayer({
        source: vectorSource
      })
      map.addLayer(vectorLayer)
    }
    // popup
    const addPopup = (item, options = {}) => {
      const { id = '', coordinate } = item
      const { prefix = 'popup', overlayOpt = {} } = options
      const container = document.getElementById(`${prefix}${id}`)
      const overlay = new Overlay({
        element: container, // 绑定 Overlay 对象和 DOM 对象的
        autoPan: true, // 定义弹出窗口在边缘点击时候可能不完整 设置自动平移效果
        autoPanAnimation: {
          duration: 250 // 自动平移效果的动画时间 9毫秒
        },
        ...overlayOpt
      })
      map.addOverlay(overlay)
      coordinate && overlay.setPosition(coordinate);
      return overlay;
    }
    // mark单机操作
    const featureClick = (e) => {
      const removeLayer = () => {
        map.removeLayer(vectorLayer)
        vectorLayer = null
      }
      const [x, y] = e.pixel
      // 通过scale计算出缩放后的真实坐标
      map.forEachFeatureAtPixel(
        [x / props.scale, y / props.scale],
        function (feature) {
          const coordinate = feature.values_.coordinate
          switch (state.step) {
            case 1:
              removeLayer()
              state.step = 2
              addFeatures([
                {
                  coordinate
                }
              ])
              view.setZoom(20)
              view.setCenter(coordinate)
              break
            case 2:
              removeLayer()
          }
        }
      )
    }
    // 选择数据中心
    const selectDc = (item) => {
      state.step = 2
      const { coordinate } = item
      stepOverlay.setPosition(coordinate)
      view.setZoom(20)
      view.setCenter(coordinate)
    }
    // 去往第三步
    const goStep3 = async () => {
      state.step = 3;
      await nextTick();
      step3Overlays = [];
      departList.forEach(item => {
        const overlay = addPopup(item, {
          prefix: 'step3-popup',
          overlayOpt: {
            offset: [-30, -30]
          }
        });
        step3Overlays.push(overlay)
        // addFeatures(departList)
      })
    }
    const init = async () => {
      const { token } = await getMapToken()
      const res = await getMapConfig(token)
      const { fullExtent, tileInfo } = res
      const resolutions = tileInfo.lods.map((item) => item.resolution)
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
    init();
    const getData = item => {
      console.log(map);
    }
    return {
      ...toRefs(state),
      dcList,
      departList,
      selectDc,
      goStep3,
      getData
    }
  }
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
