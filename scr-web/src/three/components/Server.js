import * as THREE from 'three';
import Alarm from './Alarm'
export default class CreateServer {
  constructor(rackConfig, server, updateServerData) {
    this.init(rackConfig, server);
    this.updateServerData = updateServerData;
  }

  init(rackConfig, server) {
    const {
      position: { px, pz, ry = 0 },
      size: { w, d }
    } = rackConfig;
    const color = 0x9ac0cd;
    const config = server.threeConfig;
    this.h = config.h;

    const serv2Group = new THREE.Group();
    serv2Group.position.set(px, config.y, pz);
    serv2Group.rotation.y = ry;

    // 服务器
    const textureServer = new THREE.TextureLoader().load(
      '/scr-web/static/img/three_room/rack_inside.jpg'
    );
    const serv2Geo = new THREE.BoxGeometry(w - 4, this.h, d - 2); // 这里服务器的尺寸要跟机箱尺寸对应好
    const servMat = new THREE.MeshBasicMaterial({
      color,
      map: textureServer
    });
    const materials = [];
    materials.push(
      servMat,
      servMat,
      servMat,
      servMat,
      new THREE.MeshBasicMaterial({
        color,
        map: new THREE.TextureLoader().load(
          `/scr-web/static/img/three_room/server${config.height || 2}.jpg`
        )
      }),
      servMat
    );
    const serverMesh = new THREE.Mesh(serv2Geo, materials); // 服务器主体
    serverMesh.position.set(0, this.h / 2, 0);
    serverMesh.name = 'server'

    const smb2Materials = [];
    smb2Materials.push(
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(
          `/scr-web/static/img/three_room/server${config.height || 2}.jpg`
        )
      }),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    serv2Group.add(serverMesh);
    if (server.alarm) {
      // const alarm = new Alarm({
      //   px: 0,
      //   py: this.h / 2,
      //   pz: d / 2,
      //   sx: 5,
      //   sy: 5
      // });
      const alarm = this.createAlarm({
        px: 0,
        py: this.h / 2,
        pz: d / 2,
        d
      });
      serv2Group.add(alarm);
    }
    serv2Group.userData = server;
    this.serverGroup = serv2Group;
  }

  createAlarm(options) {
    const { px, py, pz } = options;
    const w = this.h;
    const serv2Geo = new THREE.PlaneGeometry(4, 4); // 这里服务器的尺寸要跟机箱尺寸对应好
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      map: new THREE.TextureLoader().load('/scr-web/static/img/three_room/alarm.png')
    });
    const sprite = new THREE.Mesh(serv2Geo, material);
    sprite.position.set(px, py, pz);
    sprite.name = 'rackAlarm';
    return sprite;
  }
}
