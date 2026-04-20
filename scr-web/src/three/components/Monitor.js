import * as THREE from 'three';
import MTLLoader from '../lib/mtlLoader'
import OBJLoader from '../lib/objLoader'
export default class CreateMonitor {
  constructor(scene, render) {
    this.scene = scene;
    this.render = render;
    this.init();
  }

  async init() {
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    mtlLoader.load('/static/model/girl.mtl', materials => {
      objLoader.setMaterials(materials);
      objLoader.load('/static/model/girl.obj', obj => {
        const mesh = obj;
        mesh.position.set(0, 100, 300);
        mesh.scale.set(100, 100, 100)
        this.scene.add(mesh);
        // this.render()
      });
    });
  }
}
