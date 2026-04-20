import * as THREE from 'three';
import ThreeCore from './ThreeCore'
import { throttle } from 'lodash-es'
import Wall from './components/Wall';
import SimpleRack from './components/SimpleRack';
import RackUsage from './components/RackUsage';
import RackCapacity from './components/RackCapacity';
import Dashboard from './components/Dashboard';
import TemperatureBoard from './components/TemperatureBoard'
// import Monitor from './components/Monitor';
import { canvasTxture, generateRacks } from './components/tools';
import defaultRoom from './data/defaultRoom'

export default class Three extends ThreeCore {
  init() {
    this.createFloor();
    this.alarmElements = [];
    // const test = new Monitor(this.scene, this.render);
    if (this.options.needBindEvent) {
      this.bindEvent();
      const { showRackInfo, closeRackInfo } = this.options;
      this.showRackInfo = showRackInfo;
      this.closeRackInfo = closeRackInfo;
    };
  }

  // 获取顶级父元素
  getParent(obj) {
    if (obj.parent.type !== 'Scene') {
      return this.getParent(obj.parent)
    }
    return obj;
  }

  // 事件绑定
  bindEvent() {
    const target = this.dom || document
    target.ondblclick = event => {
      const obj = this.getOperateObject(event);
      if (!obj) return;
      // const { position } = this.getParent(obj)
      // this.camera.position.set(position.x, position.y, position.z + 100);
      // this.camera.lookAt(position)
      if (typeof obj.dblclick == 'function') {
        obj.dblclick(obj);
      } else if (obj.parent && typeof obj.parent.dblclick === 'function') {
        obj.parent.dblclick(obj.parent);
      }
    };
    target.onmousemove = event => {
      const obj = this.getOperateObject(event);
      if (!obj) return;
      if (typeof obj.hover == 'function') {
        obj.hover(obj);
      } else if (obj.parent && typeof obj.parent.hover === 'function') {
        obj.parent.hover(obj.parent);
        this.showRackInfo(event, obj.parent);
      } else {
        this.closeRackInfo();
      }
    };
  }

  // 清除事件
  clearOther() {
    if (this.temperatureBoard) {
      this.temperatureBoard.clear()
    }
  }

  // 事件移除
  removeEvent() {
    const target = this.dom || document;
    target.ondblclick = null;
    target.onmousemove = null;
  }

  // initModel() {
  //   // FLOOR
  //   this.createFloor();
  //   // 机房长宽高
  //   // const test = generateRacks(4, 5, 680, 500, -317, -230);
  //   // test.forEach(item => {
  //   //   const { position, size } = item;
  //   //   console.log(JSON.stringify({ position, size }))
  //   // })
  //   // this.createPoster();
  //   // const test = new Monitor(this.scene, this.render);
  // }

  createRoom(configs) {
    const { walls = [], airs = [], dashboards = [], marks = [] } = configs || defaultRoom;
    // eslint-disable-next-line no-new
    new Wall(this.scene, walls);
    this.createAir(airs);
    dashboards.forEach(item => {
      const dashboard = new Dashboard(item, this.scene);
    });
    marks.forEach(item => {
      this.createMark(item)
    })
  }

  createRack(racks) {
    const { rackOptions } = this.options;
    racks.forEach(item => {
      // eslint-disable-next-line no-new
      new SimpleRack(item, rackOptions, this.scene);
    });
    this.getAlarmElements();
  }

  getAlarmElements() {
    this.alarmElements = this.scene.children.filter(item => item.name === 'rackAlarm');
  }

  doAnimate = throttle(() => {
    this.alarmElements.forEach(item => {
      item.visible = !item.visible;
    });
  }, 600)

  // 隐藏展示机柜
  operateRacks(visible) {
    this.scene.children.forEach(item => {
      if (item.name === 'rackGroup') {
        item.visible = visible;
      }
    })
  }

  // 重置机柜
  resetRack() {
    this.clearElement(['rackUsage', 'rackCapacity']);
    this.operateRacks(true);
  }

  // 移除元素
  clearElement(names = ['rackUsage']) {
    const arr = this.scene.children.filter(x => names.includes(x.name));
    arr.forEach(item => this.dispose(this.scene, item));
  }

  // 温度云控制
  operateTemperature() {
    console.log(this.renderer.info)
    if (this.temperatureBoard) {
      const board = this.temperatureBoard.board;
      board.visible = !board.visible;
    } else {
      this.temperatureBoard = new TemperatureBoard({}, this.scene)
    }
  }

  // 机柜利用率展示
  createRackUsage(racks) {
    racks.forEach(item => {
      const rack = new RackUsage(item);
      this.scene.add(rack.rackUsage);
    });
    this.operateRacks(false);
    this.clearElement(['rackCapacity'])
  }

  // 机柜容量展示
  createRackCapacity(racks) {
    racks.forEach(item => {
      const rack = new RackCapacity(item);
      this.scene.add(rack.rackCapacity);
    });
    this.operateRacks(false);
    this.clearElement(['rackUsage'])
  }

  createAir(airs) {
    airs.forEach(item => this.createAirConditioner(item));
  }

  createFloor() {
    const texture = new THREE.TextureLoader().load('/scr-web/static/img/three_room/floor.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1200 / 500, 1000 / 500);
    // FLOOR
    const floorMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    const floorGeometry = new THREE.PlaneGeometry(1200, 1000);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // floor.position.x = 0;
    // floor.position.y = 0;
    // floor.position.z = 0;

    floor.rotation.x = Math.PI / 2;
    this.scene.add(floor);
    // targetList.push(floor);

    return floor;
  }

  createMark(config = {}) {
    const { width = 160, text = '区 域 D', height = 60, textConfig = {}, px = 250, py = 2, pz = 0, rx = -Math.PI / 2, ry = 0, rz = Math.PI / 2 } = config;
    const material = new THREE.MeshBasicMaterial({
      map: canvasTxture(text, { width, height, font: 'bold 30px SimHei', fillColor: 'rgba(0,0,0,0)', color: '#5c7373', ...textConfig }),
      side: THREE.DoubleSide,
      transparent: true
    });
    const geometry = new THREE.PlaneGeometry(width, height);
    const mark = new THREE.Mesh(geometry, material);
    mark.position.set(px, py, pz);
    mark.rotation.set(rx, ry, rz);
    this.scene.add(mark);
  }

  createAirConditioner({ w, h, d, px, py, pz, ry = Math.PI / 2 }) {
    const texture = new THREE.TextureLoader().load('/scr-web/static/img/three_room/air.png');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    const geometry = new THREE.BoxGeometry(w, h, d);
    // var material = new THREE.MeshBasicMaterial( { map: texture } );
    // Create an array of materials to be used in a cube, one for each side
    const materialArray = [];
    // order to add materials: x+,x-,y+,y-,z+,z-
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture }));
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));

    const air = new THREE.Mesh(geometry, materialArray);

    air.position.x = px;
    air.position.y = py;
    air.position.z = pz;
    air.rotation.y = ry;
    this.scene.add(air);
    // targetList.push(air);

    return air;
  }
}
