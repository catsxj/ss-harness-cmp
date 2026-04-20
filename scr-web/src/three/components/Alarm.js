import { Group, TextureLoader, MeshBasicMaterial } from 'three';
import * as THREE from 'three';
export default class CreateAlarm {
  constructor(options) {
    this.createAlarm(options);
  }

  // 创建告警
  createAlarm(options) {
    const { px, py, pz, sx = 10, sy = 10, sz = 1 } = options
    const spriteMaterial = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('/scr-web/static/img/three_room/alarm.png')
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(px, py, pz);
    sprite.scale.set(sx, sy, sz);
    sprite.name = 'rackAlarm';
    this.sprite = sprite;
  }
}
