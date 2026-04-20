import { Group, TextureLoader, MeshBasicMaterial } from 'three';
import * as THREE from 'three';
import { fill } from 'lodash-es'
const ThreeBSP = require('three-js-csg')(THREE);

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
      },
      hosts = []
    } = item;
    const rackGroup = new Group();
    // rackGroup的平面中心是机柜主体的平面中心
    rackGroup.position.set(px, py, pz);
    rackGroup.name = 'rackCapacity';
    rackGroup.userData = item;
    const arr = new Array(43)
    const pos = fill(arr, 0);
    const res = {}
    hosts.forEach(cell => {
      const { start = 10, height = 2 } = JSON.parse(cell.props || null) || {};
      res[start] = [start, height, 1] // 1表示是服务器
      for (let i = 0; i < height; i++) {
        pos[start + i] = 1;
      }
    });
    let start = 0; let height = 0;
    let first = false;
    pos.forEach((item, index) => {
      if (item === 1 || index === 42) {
        if (first === false) return;
        first = false;
        res[start] = [start, height]
        height = 0;
      } else
      if (item === 0) {
        if (!first) {
          start = index;
          first = true;
        }
        height++
      }
    });
    const result = this.formatData(res);
    result.forEach((cell, index) => {
      const cube = this.createCube(cell, {
        w, d, py, index
      });
      rackGroup.add(cube);
    });
    this.rackCapacity = rackGroup;
  }

  // 生成有序的坐标数组
  formatData(res) {
    const keys = Object.keys(res).sort(function(a, b) {
      return a - b;
    })
    return keys.map(key => res[key]);
  }

  getColor(height, isServer) {
    if (isServer) return '#fff';
    const colorMap = {
      1: '#BC7070',
      2: '#BC7070',
      3: '#B6B950',
      4: '#AF61C7'
    }
    return colorMap[height] || '#62CF63'
  }

  createCube(cell, config) {
    const { w, d, py, index } = config;

    const [start, height, isServer] = cell;
    const h = 2 * height;
    const y = py + start * 2 + 1 + height + index * 0.4;
    const serv2Geo = new THREE.BoxGeometry(w, h, d); // 这里服务器的尺寸要跟机箱尺寸对应好
    const servMat = new THREE.MeshLambertMaterial({
      color: this.getColor(height, isServer),
      transparent: true,
      opacity: 0.9
    });
    const serverMesh = new THREE.Mesh(serv2Geo, servMat); // 服务器主体
    serverMesh.position.set(0, y, 0);
    return serverMesh;
  }
}
