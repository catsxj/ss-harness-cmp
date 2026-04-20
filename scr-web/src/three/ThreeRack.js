import * as THREE from 'three';
import ThreeCore from './ThreeCore'
import { throttle } from 'lodash-es'
import TWEEN from '@tweenjs/tween.js';
import Rack from './components/Rack';
import Server from './components//Server';
import Switch from './components/Switch';

export default class Three extends ThreeCore {
  init() {
    this.bindEvent();
    this.alarmElements = [];
    // this.createFloor()
  }

  //  关闭机柜门时，将机柜中的服务器收起
  closeAllServer(servers) {
    servers.forEach(item => {
      item.position.z = 0;
    });
    this.updateServerData({})
  }

  findRack() {
    const item = this.scene.children.find(item => item.name === 'rackGroup');
    return item;
  }

  // 事件绑定
  bindEvent() {
    const target = this.dom || document
    target.ondblclick = event => {
      const obj = this.getOperateObject(event);
      if (!obj) return;
      // 服务器移出移入
      if (obj.name === 'server') {
        const item = obj.parent;
        if (item.position.z == 0) {
          const rack = this.findRack();
          this.closeAllServer(rack.servers);
          new TWEEN.Tween(item.position).to({
            z: item.position.z + 10
          }, 500).easing(TWEEN.Easing.Elastic.Out).start();
          if (this.updateServerData) {
            this.updateServerData(item.userData)
          }
        } else {
          new TWEEN.Tween(item.position).to({
            z: item.position.z - 10
          }, 500).easing(TWEEN.Easing.Elastic.Out).start();
          this.updateServerData({})
        }
      }
      if (typeof obj.dblclick == 'function') {
        obj.dblclick(obj);
        if (obj.name === 'rack_door') {
          const rackGroup = obj.parent;
          if (rackGroup.rotation.y === 0) return;
          this.closeAllServer(rackGroup.parent.servers);
        }
      }
    };
  }

  createRack(item, config) {
    this.rackConfig = {
      size: { w: 30, h: 88, d: 30 }, // 尺寸
      position: { px: 0, py: -44, pz: 0 },
      type: 'normal',
      ...config
    }
    const rack = new Rack({
      ...item,
      config: this.rackConfig
    });
    this.scene.add(rack.rackGroup);
    this.rack = rack.rackGroup;
  }

  getAlarmElements() {
    const rack = this.scene.children.filter(item => item.name === 'rackGroup' && item.userData.isAlarm)[0];
    if (!rack) return;
    // const arr = rack.children.filter(item => item.name === 'rackAlarm');
    const arr = [];
    rack.servers.forEach(item => {
      const cell = item.children.filter(item => item.name === 'rackAlarm');
      arr.push(...cell)
    })
    this.alarmElements = arr;
  }

  doAnimate = throttle(() => {
    this.alarmElements.forEach(item => {
      item.visible = !item.visible;
    });
  }, 600)

  createServer(servers = [], updateServerData) {
    this.updateServerData = updateServerData;
    const config = this.rackConfig;
    this.rack.servers = [];
    servers.forEach(cell => {
      let obj = '';
      if (cell.type === 'switch') {
        const switchItem = new Switch(config, cell);
        obj = switchItem.switchGroup;
      } else {
        const server = new Server(config, cell, updateServerData);
        obj = server.serverGroup;
      }
      this.scene.add(obj);
      this.rack.servers.push(obj)
    });
    this.getAlarmElements();
  }
}
