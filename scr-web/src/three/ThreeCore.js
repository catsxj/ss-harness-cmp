import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import TWEEN from '@tweenjs/tween.js';
import Stats from 'stats.js'
export default class ThreeCore {
  constructor(dom, options = {}) {
    this.options = options;
    const { dev = false } = options;
    this.dom = dom;
    if (this.scene) return;
    this.width = options.width || dom.offsetWidth;
    this.height = options.height || dom.offsetHeight;
    this.initScene();
    this.initCamera();
    this.initLight();
    this.initThree(dom);
    this.initControls();
    // 3d性能监控
    if (dev) this.initStates()
    this.animate();
    this.onResize();
    this.init();
  }

  initStates() {
    const stats = new Stats();
    this.stats = stats;
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
  }

  init() {}

  animate() {
    this.render();
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  // 获取操作对象
  getOperateObject(event) {
    event.preventDefault();
    const { offsetWidth, offsetHeight } = this.dom;
    const { left, top } = this.dom.getBoundingClientRect();
    // 页面缩放比例
    const { scale = 1 } = this.options;
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - left) / scale / offsetWidth) * 2 - 1;
    mouse.y = -((event.clientY - top) / scale / offsetHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, this.camera)
    // 4、计算射线相机到的对象，可能有多个对象，因此返回的是一个数组，按离相机远近排列
    // 将射线投影到屏幕，如果scene.children里的某个或多个形状相交，则返回这些形状
    // 第二个参数是设置是否递归，默认是false，也就是不递归。当scene里面添加了Group对象的实例时，就需要设置这个参数为true
    // 第一个参数不传scene.children也可以，传一个group.children或一个形状数组都可以（这样可以实现一些特别的效果如点击内部的效果）
    // 另外，因为返回的是一个数组，所以遍历数组就可以获得所有相交的对象，当元素重叠时，特别有用
    const intersects = raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length) {
      return intersects[0].object;
    }
    return null;
  }

  onResize() {
    window.onresize = () => {
      // 设置延迟，因为宽高取得是父元素的，窗口变化时父元素还未完成变化
      setTimeout(() => {
        this.width = this.dom.offsetWidth;
        this.height = this.dom.offsetHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      }, 1000)
    }
  }

  // 对材质和集合对象进行释放
  dispose (parent, child) {
    function clearMaterial(material) {
      if (material.length) {
        material.forEach(item => {
          // 清除texture
          if (item.map) {
            item.map.dispose();
          }
          item.dispose()
        })
      } else {
        if (material.map) material.map.dispose();
        material.dispose();
      }
    }
    if (child.children.length) {
      const arr = child.children.filter(x => x);
      arr.forEach(a => {
        this.dispose(child, a)
      })
    }
    const typeArr = ['Mesh', 'Sprite', 'Line', 'LineSegments']
    if (typeArr.includes(child.type)) {
      clearMaterial(child.material);
      child.geometry.dispose();
    }
    child.remove();
    parent.remove(child);
  }

  // 清除场景对象，threejs不能自动清除，只能通过手动方式，不然会内存溢出
  clearScene() {
    const arr = this.scene.children.filter(x => x)
    arr.forEach(a => {
      this.dispose(this.scene, a);
    });
    this.scene.remove();
    this.scene = null;
  }

  destory() {
    const target = this.dom || document
    target.ondblclick = null;
    target.onmousemove = null;
    window.onresize = null;
    this.camera = null;
    this.controls = null;
    this.clearScene();
    this.clearOther && this.clearOther();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.content = null;
    this.renderer.domElement = null;
    cancelAnimationFrame(this.rafId);
    this.rafId = null;
    console.log('3d销毁', this.renderer.info)
  }

  /**
   * 创建渲染器对象
   */
  initThree(dom) {
    const { background = 0x0D1A34 } = this.options;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, // 抗锯齿:true
      alpha: true
    });
    this.renderer.setSize(this.width, this.height); // 设置渲染区域尺寸
    // this.renderer.setClearColor(background); // 背景色
    dom.appendChild(this.renderer.domElement); // body元素中插入canvas对象
  }

  /**
   * 创建场景对象Scene
   */
  initScene() {
    this.scene = new THREE.Scene();
    // //添加坐标轴
    // this.scene.add(new THREE.AxesHelper(150));
  }

  /**
   * 相机设置
   */
  initCamera() {
    const { camera: { VIEW_ANGLE = 45, NEAR = 0.1, FAR = 2000, position: { x = 0, y = 400, z = 1000 } = {} } = {} } = this.options;
    const ASPECT = this.width / this.height;
    // 创建相机对象
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.camera.position.set(x, y, z); // 设置相机位置
    this.camera.lookAt(this.scene.position); // 设置相机方向(指向的场景对象)
  }

  /**
   * 光源设置
   */
  initLight() {
    const point = new THREE.PointLight(0xffffff);
    point.position.set(100, 100, 100); // 点光源位置
    this.scene.add(point); // 点光源添加到场景中
    // //环境光
    const light = new THREE.AmbientLight(0xcccccc);
    light.position.set(0, 0, 0);
    this.scene.add(light);
  }

  // 创建控件对象
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement); // 创建控件对象
    this.controls.addEventListener('change', () => this.render()); // 监听鼠标、键盘事件
  }

  render() {
    if (!this.scene || !this.camera) return;
    // 如果存在，更新时渲染其他数据
    if (typeof this.update === 'function') this.update();
    const { needTween = true } = this.options
    needTween && TWEEN.update();
    this.doAnimate && this.doAnimate();
    this.renderer.render(this.scene, this.camera); // 执行渲染操作
    if (this.stats) {
      this.stats.begin();
      this.stats.end();
    }
  }
}
