<template>
  <div class="container">
    <div id="btns">
      <button @click="initFloor">地板</button>
      <button @click="initWall">墙壁</button>
      <button @click="initLight">光源</button>
      <button @click="initStore">货物</button>
    </div>
    <div id="warehouse" ref="whContainer">未渲染前</div>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import createFloor from "./js/floor";
import createWall from "./js/wall";
import createZone from "./js/zone";
import createShelves from "./js/shelves";
export default {
  name: "wms",
  mounted() {
    this.init();
  },
  data() {
    return {
      scene: null, // 场景
      camera: null, // 相机
      renderer: null, // 渲染器
      controls: null, // 鼠标控件
      // 仓库
      wareHouse: {
        width: 40, // 长
        depth: 30, // 深
        height: 5, // 高
      },
      depth: 0.1, // 墙体厚度预设
      // 存储区
      zoneList: [
        {
          name: "存储区1",
          width: 10, // 长
          depth: 4, // 宽
          // 三维位置信息
          position: {
            x: -10,
            y: 0.1,
            z: -8,
          },
          // 存储区上的货架参数
          shelves: {
            name: "货架1",
            rowNum: 3, // 层数
            columnNum: 3, // 列数
            width: 1.8, // 每格宽
            height: 1, // 每格高
            depth: 1.8, // 每格深
          },
        },
        {
          name: "存储区2",
          width: 10, // 长
          depth: 4, // 宽
          // 三维位置信息
          position: {
            x: 6,
            y: 0.1,
            z: -8,
          },
          // 存储区上的货架参数
          shelves: {
            name: "货架2",
            rowNum: 3, // 层数
            columnNum: 5, // 列数
            width: 1.8, // 每格宽
            height: 1, // 每格高
            depth: 1.8, // 每格深
          },
        },
        {
          name: "存储区4",
          width: 12, // 长
          depth: 10, // 宽
          // 三维位置信息
          position: {
            x: 6,
            y: 0.1,
            z: 6,
          },
          // 存储区上的货架参数
          shelves: {
            name: "货架3",
            rowNum: 4, // 层数
            columnNum: 6, // 列数
            width: 1.8, // 每格宽
            height: 1, // 每格高
            depth: 1.8, // 每格深
          },
        },
      ],
    };
  },
  methods: {
    init() {
      let $wh = this.$refs.whContainer;
      // 创建场景 设置场景的背景Color
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xcce0ff);
      // 创建透视相机 设置相机的参数
      this.camera = new THREE.PerspectiveCamera(
        45,
        $wh.clientWidth / $wh.clientHeight,
        0.1,
        20000
      );
      this.camera.position.set(-Math.PI * 10, 20, 40);
      this.camera.focus = 0.1;
      this.scene.add(this.camera);
      // 3维辅助线
      var axes = new THREE.AxesHelper(30);
      axes.position.y = 0.1;
      this.scene.add(axes);
      // 网格辅助线 位置比y轴平面高出一点点
      let gridHelper = new THREE.GridHelper(100, 30, 0x333333, 0x999999);
      gridHelper.position.y = 0.1;
      this.scene.add(gridHelper);
      // 渲染器 抗锯齿 设置尺寸
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize($wh.clientWidth, $wh.clientHeight);
      // 加载之前先删除子节点
      let childNodes = $wh.childNodes;
      if (childNodes[0]) $wh.removeChild(childNodes[0]);
      $wh.appendChild(this.renderer.domElement);
      // 光源
      this.initLight();
      // 地板
      this.initFloor();
      // 围墙
      this.initWall();
      // 存储信息
      this.initStore();
      // 鼠标控件
      this.initControls();
      console.log(this.scene)
      // 开始渲染
      this.animate();
      // 窗口大小改变时重绘
      window.addEventListener("resize", this.onWindowResize, false);
    },
    // 窗口变化后需要重新渲染
    onWindowResize() {
      let $wh = this.$refs.whContainer;
      this.camera.aspect = $wh.clientWidth / $wh.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize($wh.clientWidth, $wh.clientHeight);
    },
    // 初始化光源 颜色 强度
    initLight() {
      var light = new THREE.DirectionalLight(0xdfebff, 1);
      light.position.set(50, 200, 100);
      light.position.multiplyScalar(1.3);

      light.castShadow = true;

      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;

      light.shadow.camera.far = 1;

      this.scene.add(light);
    },
    // 鼠标空间
    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      // 视角最小距离
      this.controls.minDistance = 0.001;
      // 视角最远距离
      this.controls.maxDistance = 50;
      // 最大角度
      this.controls.maxPolarAngle = Math.PI * 0.5;
      this.controls.target = new THREE.Vector3(0.01, 0.01, 0.01);
    },
    // 渲染
    render() {
      this.renderer.render(this.scene, this.camera);
    },
    // 动画
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
    },
    // 初始化地板
    initFloor() {
      // 添加地板(width, height, depth, position, rotation)
      let floorMesh = createFloor(
        this.wareHouse.width,
        this.wareHouse.depth,
        this.depth,
        { x: 0, y: 0, z: 0 },
        { x: Math.PI / 2 }
      );
      // console.log("floor", floorMesh);
      this.scene.add(floorMesh);
    },
    // 初始围墙
    initWall() {
      // 添加后墙面(width, height, depth, position, rotation)
      let backUpWall = createWall(
        this.wareHouse.width,
        this.wareHouse.height,
        this.depth,
        { y: this.wareHouse.height / 2, z: -this.wareHouse.depth / 2 },
        { x: 0 }
      );
      this.scene.add(backUpWall);
      // 添加左墙面(width, height, depth, position, rotation)
      let leftWall = createWall(
        this.wareHouse.depth,
        this.wareHouse.height,
        this.depth,
        { x: -this.wareHouse.width / 2, y: this.wareHouse.height / 2 },
        { y: Math.PI / 2 }
      );
      this.scene.add(leftWall);
      // 添加右墙面(width, height, depth, position, rotation)
      let rightWall = createWall(
        this.wareHouse.depth,
        this.wareHouse.height,
        this.depth,
        { x: this.wareHouse.width / 2, y: this.wareHouse.height / 2 },
        { y: Math.PI / 2 }
      );
      this.scene.add(rightWall);
    },
    // 初始化存储信息
    initStore() {
      // 记载一个字体用来显示存储区的区域名称
      let loader = new THREE.FontLoader();
      loader.load("/wh/fonts/SimHei_Regular.json", (font) => {
        // 生成存储区的区域名称的文字
        // 字体材质
        let matLite = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side: THREE.DoubleSide,
        });
        // 添加文字
        function creatZoneText(zone, group) {
          let zonePos = zone.position;
          // 创建单面字体形状
          let shapes = font.generateShapes(zone.name, 0.2);
          let geometry = new THREE.ShapeBufferGeometry(shapes);
          // 左上区域文字
          let txtPos = {
            x: zonePos.x - zone.width / 2 + 0.05,
            y: zonePos.y + 0.01,
            z: zonePos.z - zone.depth / 2,
          };
          let text = new THREE.Mesh(geometry, matLite);
          text.position.set(txtPos.x, txtPos.y, txtPos.z);
          text.rotation.x = -Math.PI / 2;
          text.rotation.z = -Math.PI / 2;
          if (group) group.add(text);
          // 右下区域文字
          txtPos = {
            x: zonePos.x + zone.width / 2 - 0.05,
            y: zonePos.y + 0.01,
            z: zonePos.z + zone.depth / 2,
          };
          text = new THREE.Mesh(geometry, matLite);
          text.position.set(txtPos.x, txtPos.y, txtPos.z);
          text.rotation.x = -Math.PI / 2;
          text.rotation.z = Math.PI / 2;
          if (group) group.add(text);
        }
        // 遍历存储区每个添加
        this.zoneList.forEach((zone) => {
          this.$set(zone, "height", 0.01);
          // 创建货架摆放区域
          let zoneGroup = createZone(zone);
          // 添加存储区文字标识
          creatZoneText(zone, zoneGroup);
          // 加入场景
          this.scene.add(zoneGroup);
          // 如果有货架恻添加存储区的货架
          if (zone.shelves) {
            // console.log(zone);
            this.$set(zone.shelves, "x", zone.position.x);
            this.$set(zone.shelves, "y", 0.1);
            this.$set(zone.shelves, "z", zone.position.z);
            let shelvesGroup = createShelves(zone);
            // console.log("shelvesGroup", shelvesGroup);
            let zShelves = zone.shelves;
            let boardStartX =
              zShelves.x - zone.width / 2 + zShelves.width / 2 + 0.1;
            let boardX =
              boardStartX + zShelves.width * (zShelves.columnNum - 1);
            let shapes = font.generateShapes(
              `${zone.name}\n${zone.shelves.name}`,
              0.2
            );
            let geometry = new THREE.ShapeBufferGeometry(shapes);
            // 左侧文字
            let text = new THREE.Mesh(geometry, matLite);
            text.position.set(
              boardStartX - zShelves.width / 2 - 0.01,
              zShelves.height + 0.05,
              zShelves.z - 0.5
            );
            text.rotation.y = -Math.PI / 2;
            shelvesGroup.add(text);
            // 右侧文字
            text = new THREE.Mesh(geometry, matLite);
            text.position.set(
              boardX + zShelves.width / 2 + 0.01,
              zShelves.height + 0.05,
              zShelves.z + 0.5
            );
            text.rotation.y = Math.PI / 2;
            shelvesGroup.add(text);
            this.scene.add(shelvesGroup);
          }
        });
      });
    },
  },
};
</script>

<style scoped>
#btns {
  width: 100%;
  height: 15vh;
}
#warehouse {
  width: 90vw;
  height: 80vh;
  margin: 0 auto;
}
</style>