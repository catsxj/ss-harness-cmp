import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
const ThreeBSP = require('three-js-csg')(THREE);

export default class CreateDashboard {
  constructor(item, scene) {
    this.scene = scene;
    this.createFrame(item);
  }

  createFrame(item) {
    const { w, h, d, px, py, pz, ry = 0, bg = '/scr-web/static/img/list/room.png', color = '#454545', frameWidth = 6 } = item;
    const geometry = new THREE.BoxGeometry(w, h, d);
    const frame = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
    }));
    frame.position.x = px;
    frame.position.y = py;
    frame.position.z = pz;

    frame.rotation.y = ry;

    const wallBsp = new ThreeBSP(frame);
    let bsp = wallBsp;
    const posterWindow = new THREE.Mesh(
      new THREE.BoxGeometry(w - frameWidth, h - frameWidth, d),
      new THREE.MeshBasicMaterial()
    );
    posterWindow.position.x = px;
    posterWindow.position.y = py;
    posterWindow.position.z = pz;

    posterWindow.rotation.y = ry;

    // 将两个几何体转换成BSP对象
    const windowBsp = new ThreeBSP(posterWindow);
    // 开始计算从bsp_wall减去bsp_window1后的BSP对象
    bsp = wallBsp.subtract(windowBsp);
    // 生成计算结果的几何体
    const res = new THREE.Mesh(
      bsp.toMesh().geometry,
      new THREE.MeshBasicMaterial({
        color
      })
    );
    res.position.x = px;
    res.position.y = py;
    res.position.z = pz;

    res.rotation.y = ry;
    // 将几何体添加到场景中
    this.scene.add(res);
    this.createPoster(item)
  }

  createPoster(item) {
    const { w = 77, h = 43, d = 2, px, py, pz, ry = 0, bg = '/scr-web/static/img/list/room.png', frameWidth = 6 } = item;
    const material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(bg)
    });
    const geometry = new THREE.PlaneGeometry(w - frameWidth, h - frameWidth);
    const poster = new THREE.Mesh(geometry, material);
    poster.position.set(px, py, pz - 1);
    poster.rotation.y = ry
    this.scene.add(poster);
  }
}
