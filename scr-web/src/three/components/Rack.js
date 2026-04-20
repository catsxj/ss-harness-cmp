import { Group, TextureLoader, MeshBasicMaterial } from 'three';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Alarm from './Alarm'
import { canvasTxture } from './tools';

const colorMap = {
  danger: 0xf56c6c,
  warning: 0xe6a23c,
  normal: 0x409eff
};
export default class CreateRack {
  constructor(item, options = {}) {
    this.clickRack = options.clickRack;
    this.options = options;
    this.init(item);
  }

  init(item) {
    const color = 0x8e8e8e;
    const {
      config: {
        size: { w, h, d },
        position: { px, py, pz, ry = 0 },
        type = 'serverDoor'
      }
    } = item;
    const rackGroup = new Group();
    // rackGroup的平面中心是机柜主体的平面中心
    rackGroup.position.set(px, py, pz);
    rackGroup.rotation.y = ry;
    rackGroup.name = 'rackGroup';
    rackGroup.userData = item;
    const textureSkin = new TextureLoader().load('/scr-web/static/img/three_room/rack_skin.jpg');
    const textureLeft = new TextureLoader().load('/scr-web/static/img/three_room/rack_left.jpg');
    const textureRight = new TextureLoader().load(
      '/scr-web/static/img/three_room/rack_right.jpg'
    );
    // const rackMatLambert = new MeshLambertMaterial({
    //   //设置朗伯材质和贴图
    //   color,
    //   map: textureSkin
    // });
    const rackMatBasic = new MeshBasicMaterial({
      // 设置基础材质和贴图
      color,
      map: textureSkin
    });
    const rackdGeo = new THREE.BoxGeometry(w, 2, d); // 箱主体 底
    const rackd = new THREE.Mesh(rackdGeo, rackMatBasic);
    rackd.position.set(0, 1, 0);

    // 箱左侧
    const rackzGeo = new THREE.BoxGeometry(2, h, w);
    const rackzMaterials = [];
    rackzMaterials.push(
      // push顺序：X轴正、反，Y轴正、反，Z轴正、反
      rackMatBasic,
      rackMatBasic,
      rackMatBasic,
      rackMatBasic,
      new THREE.MeshBasicMaterial({
        color,
        map: textureLeft
      }),
      rackMatBasic
    );
    const rackl = new THREE.Mesh(rackzGeo, rackzMaterials);
    rackl.position.set(-w / 2 + 1, h / 2 + 2, 0);

    // 右侧
    const rackyGeo = new THREE.BoxGeometry(2, h, w); // 箱左侧，厚2，高88，长40
    const rackyMaterials = [];
    rackyMaterials.push(
      rackMatBasic,
      rackMatBasic,
      rackMatBasic,
      rackMatBasic,
      new THREE.MeshBasicMaterial({
        color: 0xbebebe,
        map: textureRight
      }),
      rackMatBasic
    );
    const rackr = new THREE.Mesh(rackyGeo, rackyMaterials);
    rackr.position.set(w / 2 - 1, h / 2 + 2, 0);
    // 后板
    const rackhGeo = new THREE.BoxGeometry(w, h, 2);
    const rackb = new THREE.Mesh(rackhGeo, rackMatBasic);
    rackb.position.set(0, h / 2 + 2, -d / 2 + 1);

    const racksGeo = new THREE.BoxGeometry(w, 2, d);
    const racksMaterials = [];
    racksMaterials.push(
      rackMatBasic,
      rackMatBasic,
      new THREE.MeshLambertMaterial({
        color,
        map: canvasTxture(item.name, { width: 50, height: 40 }) // canvas贴图
      }),
      rackMatBasic,
      rackMatBasic,
      rackMatBasic
    );
    const rackt = new THREE.Mesh(racksGeo, racksMaterials);
    rackt.position.set(0, h + 2 + 1, 0);

    // 设置机箱门
    const doorGroup = new THREE.Group();
    doorGroup.position.set(w / 2, 0, d / 2);
    const doorGeo = new THREE.BoxGeometry(w, h + 4, 1); // 机箱们宽，高，厚
    const mMaterials = [];
    const doorColor = 0x474747;
    const doorKinMap = {
      normal: 'rack_door_front',
      serverDoor: 'rack_door_server'
    }
    mMaterials.push(
      new THREE.MeshBasicMaterial({ color: doorColor }),
      new THREE.MeshBasicMaterial({ color: doorColor }),
      new THREE.MeshBasicMaterial({ color: doorColor }),
      new THREE.MeshBasicMaterial({ color: doorColor }),
      new THREE.MeshBasicMaterial({
        color,
        map: new TextureLoader().load(`/scr-web/static/img/three_room/${doorKinMap[type]}.png`)
      }),
      new THREE.MeshBasicMaterial({
        color,
        map: new TextureLoader().load('/scr-web/static/img/three_room/rack_door_back.jpg')
      })
    );

    const door = new THREE.Mesh(doorGeo, mMaterials);
    door.position.set(-15, h / 2 + 1, 0);
    door.dblclick = this.operateDoor;
    door.name = 'rack_door';
    doorGroup.add(door);
    rackGroup.add(rackd, rackt, rackb, rackl, rackr, doorGroup);
    if (item.isAlarm) {
      const alarm = new Alarm({ px: 0, py: 96, pz: 0 })
      rackGroup.add(alarm.sprite);
    }
    rackGroup.name = 'rackGroup';
    rackGroup.hover = this.showRackInfo;
    rackGroup.dblclick = this.clickRack;
    this.rackGroup = rackGroup;
  }

  showRackInfo() {
  }

  operateDoor(door) {
    const item = door.parent;
    if (item.rotation.y == 0) {
      new TWEEN.Tween(item.rotation).to({
        y: 0.5 * Math.PI
      }, 1500).easing(TWEEN.Easing.Elastic.Out).start();
    } else {
      new TWEEN.Tween(item.rotation).to({
        y: 0
      }, 300).start();
    }
  }
}
