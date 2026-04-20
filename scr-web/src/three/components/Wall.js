import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
const ThreeBSP = require('three-js-csg')(THREE);

// 墙的厚度
const wallWidth = 5;
// 隔断宽度
// 墙颜色
const wallColor = 0xbbbccc;
export default class CreateWall {
  constructor(scene, configs) {
    this.scene = scene;
    this.doorFrameConfigs = {
      h: 4,
      bottomH: 1,
      d: 10
    };
    this.configs = configs;
    this.init();
  }

  init() {
    this.configs.forEach(item => {
      if (item.type === 'column') {
        this.createColumn(item);
      } else {
        this.createWall(item);
      }
    });
  }

  createWall(item) {
    const { w, h, px, py, pz, ry } = item;
    const geometry = new THREE.BoxGeometry(w, h, wallWidth);
    const meterials = [];
    meterials.push(
      // push顺序：X轴正、反，Y轴正、反，Z轴正、反
      new THREE.MeshBasicMaterial({
        color: wallColor
      }),
      new THREE.MeshBasicMaterial({
        color: wallColor
      }),
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      }),
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      }),
      new THREE.MeshBasicMaterial({
        color: wallColor
      }),
      new THREE.MeshBasicMaterial({
        color: wallColor
      })
    );
    const wall = new THREE.Mesh(geometry, meterials);
    wall.position.x = px;
    wall.position.y = py;
    wall.position.z = pz;

    wall.rotation.y = ry;

    const wallBsp = new ThreeBSP(wall);
    let bsp = wallBsp;
    // 对窗户进行挖洞处理
    if (item.window) {
      this.createGlassWindow(item);
      const glassWindow = new THREE.Mesh(
        new THREE.BoxGeometry(item.window.w, item.window.h, 5),
        new THREE.MeshBasicMaterial()
      );
      glassWindow.position.x = item.window.px || item.px;
      glassWindow.position.y = item.py;
      glassWindow.position.z = item.pz;

      glassWindow.rotation.y = item.ry || 0;

      // 将两个几何体转换成BSP对象
      const windowBsp = new ThreeBSP(glassWindow);
      // 开始计算从bsp_wall减去bsp_window1后的BSP对象
      bsp = wallBsp.subtract(windowBsp);
    }
    // 对门进行挖洞处理
    if (item.doors) {
      item.doors.forEach(cell => {
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(cell.w, cell.h, wallWidth),
          new THREE.MeshBasicMaterial()
        );
        door.position.x = cell.px;
        door.position.y = cell.py || item.py;
        door.position.z = cell.pz || item.pz;
        door.rotation.y = cell.ry || 0;
        const doorBsp = new ThreeBSP(door);
        this.createDoor({
          py: item.py,
          pz: item.pz,
          ...cell
        });
        bsp = bsp.subtract(doorBsp);
      });
    }
    if (item.window || item.doors) {
      // 生成计算结果的几何体
      const res = new THREE.Mesh(
        bsp.toMesh().geometry,
        new THREE.MeshBasicMaterial({
          color: wallColor
        })
      );
      res.position.x = px;
      res.position.y = py;
      res.position.z = pz;

      res.rotation.y = ry;
      // 将几何体添加到场景中
      this.scene.add(res);
      this.createWallTopWhite(item);
    } else {
      this.scene.add(wall);
    }
  }

  // 生成挖洞顶部的白色元素
  createWallTopWhite(item) {
    const { w, h, px, pz, ry } = item;
    const res = new THREE.Mesh(
      new THREE.BoxGeometry(w, 1, wallWidth),
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      })
    );
    res.position.x = px;
    res.position.y = h + 1;
    res.position.z = pz;

    res.rotation.y = ry;
    // 将几何体添加到场景中
    this.scene.add(res);
  }

  createColumn(item) {
    const { w, h, px, py, pz } = item;
    const geometry = new THREE.BoxGeometry(w, h, w);
    const meterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 1,
      transparent: true,
      side: THREE.DoubleSide
    });
    const column = new THREE.Mesh(geometry, meterial);

    column.position.x = px;
    column.position.y = py;
    column.position.z = pz;

    this.scene.add(column);
  }

  createGlassWindow(item) {
    const {
      px,
      py,
      pz,
      ry,
      window: { w, h, px: wpx }
    } = item;
    const geometry = new THREE.BoxGeometry(w, h, 2);
    const ma = new THREE.MeshBasicMaterial({
      color: 0x003333,
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide
    });
    const glassW = new THREE.Mesh(geometry, ma);

    glassW.position.x = wpx || px;
    glassW.position.y = py;
    glassW.position.z = pz;

    glassW.rotation.y = ry;
    // 对门进行挖洞处理
    if (item.doors) {
      let bsp = new ThreeBSP(glassW);
      item.doors.forEach(cell => {
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(cell.w, cell.h, wallWidth),
          new THREE.MeshBasicMaterial()
        );
        door.position.x = cell.px;
        door.position.y = cell.py || item.py;
        door.position.z = cell.pz || item.pz;
        door.rotation.y = cell.ry || 0;
        const doorBsp = new ThreeBSP(door);
        bsp = bsp.subtract(doorBsp);
      });
      const res = new THREE.Mesh(bsp.toMesh().geometry, ma);
      res.position.x = wpx || px;
      res.position.y = py;
      res.position.z = pz;

      res.rotation.y = ry;
      // 将几何体添加到场景中
      this.scene.add(res);
    } else {
      this.scene.add(glassW);
    }
  }

  // 对门进行开门关门操作
  operateDoor(door) {
    const item = door.parent;
    if (item.rotation.y == 0) {
      new TWEEN.Tween(item.rotation)
        .to(
          {
            y: item.rotation.y + Math.PI / 2
          },
          1500
        )
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
      // item.rotation.y = item.rotation.y + Math.PI / 2;
      // item.position.x = item.position.x + offset;
      // item.position.z = item.position.z + offset;
    } else {
      new TWEEN.Tween(item.rotation).to({
        y: 0
      }, 300).easing(TWEEN.Easing.Elastic.Out).start();
    }
  }

  createDoor(item) {
    const { h: dfh, bottomH, d } = this.doorFrameConfigs;
    const { w, h, px, py, pz, ry = 0 } = item;
    const doorGroup = new THREE.Group();
    // const textureSkin = new THREE.TextureLoader().load(
    //   "/scr-web/static/img/three_room/door_top.jpg"
    // );
    // textureSkin.wrapS = textureSkin.wrapT = THREE.RepeatWrapping;
    // textureSkin.repeat.set(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      // //设置基础材质和贴图dcdddd
      color: 0xc5cfd9
      // map: textureSkin
    });
    doorGroup.position.set(px, py, pz);
    doorGroup.rotation.y = ry;
    const offset = dfh / 2;
    // 上
    const doort = new THREE.Mesh(new THREE.BoxGeometry(w, dfh, d), mat);
    doort.position.set(0, h / 2 - offset, 0);
    // 右
    const doorr = new THREE.Mesh(new THREE.BoxGeometry(dfh, h - 6, d), mat);
    doorr.position.set(w / 2 - offset, 0, 0);
    // 左
    const doorl = new THREE.Mesh(new THREE.BoxGeometry(dfh, h - 6, d), mat);
    doorl.position.set(-w / 2 + offset, 0, 0);
    // 下
    const doorb = new THREE.Mesh(new THREE.BoxGeometry(w, 2, d), mat);
    doorb.position.set(0, -h / 2 + offset, bottomH);

    const doorRotate = new THREE.Group();
    doorRotate.position.set(w / 2, 0, 0);
    const texture = new THREE.TextureLoader().load(
      '/scr-web/static/img/three_room/door_out.png'
    );
    const geometry = new THREE.BoxGeometry(w - 8, h - 5, 3);
    const materialArray = [];
    // order to add materials: x+,x-,y+,y-,z+,z-
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ color: 0xbbbbbb }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture }));
    materialArray.push(
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('/scr-web/static/img/three_room/door_in.png')
      })
    );
    const door = new THREE.Mesh(geometry, materialArray);
    door.position.set(-w / 2, 0, 0);
    door.width = w;
    door.name = 'door';
    door.dblclick = this.operateDoor;
    doorRotate.add(door)
    doorGroup.add(doort, doorl, doorr, doorb, doorRotate);

    this.scene.add(doorGroup);
  }
}
