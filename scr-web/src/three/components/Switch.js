import * as THREE from 'three';
export default class CreateServer {
  constructor(rack, cell) {
    this.init(rack, cell);
  }

  init(rack, cell) {
    const {
      position: { px, pz, ry },
      size: { w, d }
    } = rack;
    this.h = cell.h;

    const serv2Group = new THREE.Group();
    serv2Group.position.set(px, cell.y, pz);
    serv2Group.rotation.y = ry;

    // 两层的服务器
    const textureServer = new THREE.TextureLoader().load(
      '/scr-web/static/img/three_room/rack_inside.jpg'
    );
    const serv2Geo = new THREE.BoxGeometry(w - 4, this.h, d - 4); // 这里服务器的尺寸要跟机箱尺寸对应好
    const servMat = new THREE.MeshBasicMaterial({
      color: 0x9ac0cd,
      map: textureServer
    });
    const server2 = new THREE.Mesh(serv2Geo, servMat); // 服务器主体
    server2.position.set(0, this.h / 2, 0);

    const server2mGeo = new THREE.BoxGeometry(w - 4, this.h, 0.2); // 服务器面板尺寸
    const smb2Materials = [];
    smb2Materials.push(
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('/scr-web/static/img/three_room/switch.jpg')
      }),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    const server2face = new THREE.Mesh(server2mGeo, smb2Materials);
    server2face.name = 'ctr2';
    server2face.position.set(0, this.h / 2, (d - 4 + 0.2) / 2);
    serv2Group.add(server2, server2face);
    this.switchGroup = serv2Group;
  }
}
