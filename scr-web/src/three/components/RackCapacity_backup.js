import { Group, TextureLoader, MeshBasicMaterial } from 'three';
import * as THREE from 'three';
const ThreeBSP = require('three-js-csg')(THREE);

const colorMap = {
  1: '#64CCC7',
  2: '#AD60C5',
  3: '#B6B950',
  4: '#CA6062'
}
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
    const rackGeo = new THREE.BoxGeometry(w, h, d);
    const base = new THREE.Mesh(rackGeo, new THREE.MeshBasicMaterial({
    }));
    base.position.set(0, h / 2 + 1, 0);
    let bsp = new ThreeBSP(base);
    hosts.forEach(cell => {
      const server = this.createServer(cell, {
        w, d, py
      });
      const serverBsp = new ThreeBSP(server);
      bsp = bsp.subtract(serverBsp)
      rackGroup.add(server);
    });
    const res = new THREE.Mesh(
      bsp.toMesh().geometry,
      new THREE.MeshLambertMaterial({
        color: '#E3E3E3'
      })
    );
    res.position.set(0, h / 2 + 1, 0);
    rackGroup.add(res);
    this.rackCapacity = rackGroup;
  }

  createServer(cell, config) {
    const { w, d, py } = config;

    const { start = 10, height = 2 } = JSON.parse(cell.props || null) || {};
    const h = 2 * height;
    const y = py + start * 2 + 3.8
    const serv2Geo = new THREE.BoxGeometry(w + 0.2, h, d + 0.2); // 这里服务器的尺寸要跟机箱尺寸对应好
    const servMat = new THREE.MeshBasicMaterial({
      color: colorMap[height],
      transparent: true,
      opacity: 1
    });
    const serverMesh = new THREE.Mesh(serv2Geo, servMat); // 服务器主体
    serverMesh.position.set(0, y, 0);
    return serverMesh;
  }
}
