
import { Vector as SourceVec } from 'ol/source'
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke';
import { asArray } from 'ol/color';
import GeoJSON from 'ol/format/GeoJSON'
import * as turf from '@turf/turf'
/**
 * 创建线
 * @param {经纬度数组} lnglats
 * @param {参数，有color颜色，width线的粗细} params
 */

var turfFormat = new GeoJSON()
function getTurfArcFeature(start, end, opt) {
  const [f = 0.8, e = 0.5] = opt;
  var line = turf.lineString([
    start,
    [start[0] + (end[0] - start[0]) * f,
      start[1] + (end[1] - start[1]) * e],
    end
  ]);
  var curved = turf.bezierSpline(line);
  const length = turf.length(curved, { units: 'meters' });
  var bF = turfFormat.readFeature(curved);
  // bF.getGeometry().transform('EPSG:4326', 'EPSG:3857');
  // bF.setProperties(opt);
  bF.set('length', length);
  return bF;
}
export function addLineString(list, params) {
  if (!params) {
    params = {}
  }
  if (!params.color) {
    params.color = '#5DCFDD'
  }
  if (!params.width) {
    params.width = 3
  }
  const features = [];
  list.forEach(item => {
    // 设置源特征
    // const feature = new Feature({
    //   geometry: new LineString(item.coords),
    //   layout: {},
    //   name: 'Line'
    // });
    const feature = getTurfArcFeature(item.coords[0], item.coords[1], JSON.parse(item.props) || [])
    features.push(feature)
  })
  // 创建图层源
  const sourceVec = new SourceVec({
    features: features
  })
  // 创建图层
  const vercorLayer = new VectorLayer({
    source: sourceVec,
    style: new Style({
      stroke: new Stroke({
        width: params.width,
        // lineDash: [5],
        lineJoin: 'bevel',
        color: asArray(params.color)
      })
    })
  })
  return { vercorLayer, features }
}
