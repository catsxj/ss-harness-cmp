import { Group, BoxGeometry, EdgesGeometry, LineBasicMaterial, LineSegments, MeshBasicMaterial, Mesh } from 'three';
import TWEEN from '@tweenjs/tween.js';
export default class CreateRack {
  constructor(item, options = {}) {
    this.clickRack = options.clickRack;
    this.options = options;
    this.init(item);
  }

  init(item) {
    const {
      config: {
        size: { w, h, d },
        position: { px, py, pz }
      }
    } = item;
    const rackGroup = new Group();
    // rackGroup的平面中心是机柜主体的平面中心
    rackGroup.position.set(px, py, pz);
    rackGroup.name = 'rackUsage';
    rackGroup.userData = item;
    const rackGeo = new BoxGeometry(w, h, d);
    const edges = new EdgesGeometry(rackGeo);
    // 立方体线框，不显示中间的斜线
    const edgesMaterial = new LineBasicMaterial({
      color: 0xB3C2C8
    });
    var line = new LineSegments(edges, edgesMaterial);
    line.position.set(0, h / 2 + 1, 0);
    rackGroup.add(line);
    if (item.usage) {
      const cube = this.createCube(item)
      rackGroup.add(cube);
    }
    this.rackUsage = rackGroup;
  }

  getCubeColor(usage) {
    if (usage > 90) {
      return '#F84540'
    } else if (usage > 75) {
      return '#FF9900'
    } else if (usage > 50) {
      return '#2D8CF0'
    }
    return '#19BE6B'
  }

  createCube(item) {
    const {
      config: {
        size: { w, h, d }
      },
      usage
    } = item;
    const height = h * usage;
    const cubeGeo = new BoxGeometry(w, 1, d);
    const cubemate = new MeshBasicMaterial({
      color: this.getCubeColor(usage * 100)
    });
    const cube = new Mesh(cubeGeo, cubemate);
    cube.position.set(0, height / 2 + 1, 0);
    new TWEEN.Tween(cube.scale).to({
      y: height
    }, 1000).easing(TWEEN.Easing.Elastic.Out).start();
    return cube;
  }
}
