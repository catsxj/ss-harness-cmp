import { Group, TextureLoader, MeshBasicMaterial } from 'three';
import * as THREE from 'three';
import { canvasTxture } from './tools'
import Alarm from './Alarm'

const colorMap = {
  danger: 0xf56c6c,
  warning: 0xe6a23c,
  normal: 0x409eff
};
export default class CreateRack {
  constructor(item, options = {}, scene) {
    this.clickRack = options.clickRack;
    this.options = options;
    this.scene = scene;
    this.init(item);
  }

  init(item) {
    // const color = colorMap[item.alarmLevel] || 0x8e8e8e;
    const color = 0x8e8e8e;
    const {
      config: {
        size: { w, h, d },
        position: { px, py, pz, ry = 0 }
      }
    } = item;
    const rackGroup = new Group();
    // rackGroup的平面中心是机柜主体的平面中心
    rackGroup.position.set(px, py, pz);
    rackGroup.rotation.y = ry;
    rackGroup.name = 'rackGroup';
    rackGroup.userData = item;
    const textureSkin = new TextureLoader().load('/static/img/three_room/rack_skin.jpg');
    const rackGeo = new THREE.BoxGeometry(w, h, d);
    const materials = [];
    materials.push(
      new THREE.MeshBasicMaterial({
        color,
        map: textureSkin
      }),
      new THREE.MeshBasicMaterial({
        color,
        map: textureSkin
      }),
      new THREE.MeshBasicMaterial({
        color,
        map: canvasTxture(item.name, { width: 50, height: 40 }) // canvas贴图

      }),
      new THREE.MeshBasicMaterial({
        color,
        map: textureSkin
      }),
      new THREE.MeshBasicMaterial({
        color,
        map: new TextureLoader().load('/static/img/three_room/rack_door_server.png')
      }),
      new THREE.MeshBasicMaterial({
        color,
        map: textureSkin
      })
    );
    const rack = new THREE.Mesh(rackGeo, materials);
    rack.position.set(0, h / 2 + 1, 0);
    rackGroup.add(rack)
    if (item.isAlarm) {
      const alarm = new Alarm({
        px,
        py: 82,
        pz
      });
      this.scene.add(alarm.sprite)
    }
    rackGroup.hover = () => {};
    rackGroup.dblclick = this.clickRack;
    this.scene.add(rackGroup)
  }
}
