import heatmap from 'heatmapjs'
import * as THREE from 'three';

export default class TemperatureBoard {
  constructor(options, scene) {
    this.scene = scene;
    this.options = options;
    this.createBoard(options);
    this.timer = null;
  }

  createBoard(options) {
    const { width = 680, height = 500, position = {} } = options;
    const texture = new THREE.CanvasTexture(this.createTemperatureImage());
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({
      map: texture
      // color: 0xffffff,
      // side: THREE.DoubleSide
    });
    material.map.needsUpdate = true;
    material.map.image.needsUpdate = true;
    const geometry = new THREE.PlaneGeometry(width, height);
    const board = new THREE.Mesh(geometry, material);
    const { px = -60, py = 1, pz = 0 } = position;
    board.position.x = px;
    board.position.y = py;
    board.position.z = pz;

    board.rotation.x = -Math.PI / 2;
    board.name = 'temperatureBoard';
    this.board = board;
    this.scene.add(board);
    this.timer = setInterval(() => {
      material.map.dispose();
      const texture = new THREE.CanvasTexture(this.createTemperatureImage());
      material.map = texture;
    }, 1000 * 5)
  }

  clear() {
    clearInterval(this.timer);
    this.timer = null;
  }

  createTemperatureImage() {
    const { width = 680, height = 500 } = this.options;
    const root = document.getElementById('app');
    const ele = document.createElement('div');
    ele.style.cssText = `width:${width}px;height:${height}px`;
    root.appendChild(ele)
    const instance = heatmap.create({
      container: ele,
      width,
      height,
      // backgroundColor: 'red', // '#121212'    'rgba(0,102,256,0.2)'
      // gradient: {
      //   0.5: 'blue',
      //   0.8: 'red',
      //   0.95: 'white',
      //   0.6: 'yellow'
      // },
      radius: width / 2, // [0,+∞)
      maxOpacity: 1,
      minOpacity: 0,
      opacity: 0.8
    });
    const data = [];
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const value = Math.random() * 100;
      data.push({ x, y, value })
    }
    instance.setData({
      min: 0,
      max: 100,
      data
      // data: [
      //   { x: 0, y: 0, value: 50 },
      //   { x: 0, y: 500, value: 50 },
      //   { x: 500, y: 0, value: 50 },
      //   { x: 500, y: 500, value: 50 },
      //   { x: 100, y: 100, value: 80 },
      //   { x: 100, y: 400, value: 80 },
      //   { x: 400, y: 100, value: 90 },
      //   { x: 400, y: 400, value: 80 },
      //   { x: 250, y: 250, value: 100 }
      // ]
    });
    root.removeChild(ele)
    return instance._renderer.canvas;
  }
}
