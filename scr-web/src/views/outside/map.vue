/* eslint-disable no-undef */
<template>
  <div class="map-container" id="map">
    <div class="popup-container" :id="`popup${item.id}`" v-for="(item) in dcList" :key="item.id">
      <img class="logo-icon" v-if="item.cloud" :src="`/static/img/outside/${item.cloud}_cloud.png`" @click="selectCloud(item)">
      <div class="location-icon" @click="selectDc(item.id)">
        <img src="/static/img/outside/icon.png" alt="">
        <div class="location-name">{{item.name}}</div>
      </div>
    </div>
    <div class="node-item" v-for="(item, index) in nodeList" :key="`node${index}`" :id="`step3-popup${item.id}`">
      <img width="30px" src="/static/img/outside/circle.png" alt="">
      <span>{{item.name}}</span>
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
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon, Style, Text } from 'ol/style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import CircleStyle from 'ol/style/Circle'
import Overlay from 'ol/Overlay'
import ImageLayer from 'ol/layer/Image'
import Static from 'ol/source/ImageStatic'
import { getVectorContext } from 'ol/render'
import OutsideCenter from './OutsideCenter'
import { addLineString } from './tools'
import { getMapRelation } from 'services/screen/cloud_network'

export default {
  components: { OutsideCenter },
  props: {
    scale: {
      type: Number,
      default: 1
    }
  },
  setup(props, context) {
    const state = reactive({
      dcList: [{ config: {} }],
      nodeList: [],
      params: {
        type: '',
        tenant: ''
      }
    })
    let map = null
    let view = null
    const initMap = (token, options) => {
      const { fullExtent, tileInfo, resolutions } = options
      view = new View({
        center: [63641.82242120001, 46084.01155038807],
        zoom: 13.4
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
    }
    const addImageLayer = () => {
      var imageLayer = new ImageLayer({
        opacity: 1,
        source: new Static({
          url: '/static/img/outside/map.png',
          imageExtent: [
            55656.38659914988,
            35894.30966144678,
            77019.57345087627,
            58318.62269787157
          ]

          // imageExtent: [-272141.8389000008, -238788.26160000078, 314895.53250000067, 276661.7271999996]
        })
      })
      map.addLayer(imageLayer)
    }
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
      coordinate && overlay.setPosition(coordinate)
      return overlay
    }
    // 添加线
    const addLines = lines => {
      const { vercorLayer, features } = addLineString(lines)
      const arcStyle = new Style({
        stroke: new Stroke({
          color: [0, 122, 122, 0.7],
          width: 1
        })
      })

      const dotStyle = new Style({
        image: new CircleStyle({
          fill: new Fill({
            color: [255, 255, 255, 0.7]
          }),
          radius: 5
        })
      })
      vercorLayer.on('postrender', (evt) => {
        const veContext = getVectorContext(evt)
        features.forEach((item, index) => {
          veContext.drawFeature(item, arcStyle)
          const time = (evt.frameState.time - item.get('start')) / 1000
          let frac = time / 5 - index / features.length
          if (!item.get('start')) item.set('start', new Date().getTime())
          if (frac >= 1) {
            item.set('start', new Date().getTime())
            frac = 0
          }
          const along = item.getGeometry().getCoordinateAt(frac)
          const pF = new Feature(new Point(along))
          veContext.drawFeature(pF, dotStyle)
        })
        map.render()
      })
      map && map.addLayer(vercorLayer)
    }
    // 添加关系图
    const createRelation = async () => {
      const res = await getMapRelation();
      if (res.success) {
        const { nodes, edges } = res.data;
        state.nodeList = nodes
        addLines(edges);
        await nextTick();
        nodes.forEach((item) => {
          addPopup(item, {
            prefix: 'step3-popup',
            overlayOpt: {
              offset: [-15, -9]
            }
          })
        })
      }
    };
    createRelation();
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
      map.on('singleclick', function (e) {
        // console.log(e.coordinate);
        // featureClick(e)
      })
      addImageLayer()
    }
    init()
    const addDcList = async (dcs) => {
      state.dcList = dcs.map((item) => {
        const {
          id,
          name,
          config: { cloud, coordinate }
        } = item
        return {
          id,
          name,
          cloud,
          coordinate
        }
      })
      await nextTick()
      state.dcList.forEach((item) => {
        if (!item.coordinate) return
        addPopup(item, {
          overlayOpt: {
            offset: [-86, -48]
          }
        })
      })
    }
    const selectCloud = (type) => {
      state.params.type = type
      context.emit('getData', state.params)
    }
    const selectDc = (id) => {
      window.open(`/#/room/3d/${id}`)
    }
    return {
      ...toRefs(state),
      addDcList,
      selectCloud,
      selectDc
    }
  }
}
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: black;
}
.popup-container {
  position: relative;
  .logo-icon {
    position: absolute;
    top: -110px;
    left: 25px;
    height: 118px;
    cursor: pointer;
  }
  .location-icon {
    text-align: center;
    cursor: pointer;
    img {
      width: 173px;
    }
    .location-name {
      position: relative;
      top: -60px;
      font-size: 15px;
      font-family: Microsoft YaHei;
      font-weight: bold;
      color: #f2f7fd;
    }
  }
}
.node-item {
  display: flex;
  flex-direction: column;
  text-align: center;
  color: #fff;
}
</style>
