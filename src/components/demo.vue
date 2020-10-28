<template>
  <div class="container">
    <!-- <img src="../assets/shelves/textures/material_0_normal.png" alt /> -->
    <div id="operate-container">
      <el-row>
        <el-button @click="dialogVisible = true" size="mini" type="primary"
          >新增货架</el-button
        >
      </el-row>
      <el-row>
        <el-switch
          @change="dragStatusChange"
          v-model="dragStatus"
          active-text="编辑货架位置"
          inactive-text=""
        >
        </el-switch>
      </el-row>
    </div>
    <div id="warehouse" ref="whContainer">未渲染前</div>
    <el-dialog title="新增货架" :visible.sync="dialogVisible" width="30%">
      <el-form :model="form">
        <el-form-item label="货架名" :label-width="formLabelWidth">
          <el-input v-model.trim="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="排数" :label-width="formLabelWidth">
          <el-input-number
            v-model="form.row"
            :min="1"
            :max="10"
            label="排数"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="列数" :label-width="formLabelWidth">
          <el-input-number
            v-model="form.col"
            :min="1"
            :max="10"
            label="列数"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          :disabled="form.name ? false : true"
          type="primary"
          @click="addShelve"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <el-dialog title="储位信息" :visible.sync="detailDialogVisible" width="30%">
      <span>{{ `货架：${boxDetail.shelfName}` }}</span>
      <p>{{ `${boxDetail.rowIndex}排 - ${boxDetail.colIndex}列` }}</p>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
let dragEleControls = null;
import createFloor from "./js/floor";
import createWall from "./js/wall";
// import createZone from "./js/zone";
import createShelves from "./js/shelves";
// import html2canvas from "html2canvas";
// async function createSpriteText(selcetor, conf) {
//   const elem = document.querySelector(selcetor); // selector是传入的选择器
//   const canvas = await html2canvas(elem, {
//     // 加入x、y配置，防止画布偏移，不加这两个配置，画布有可能偏移，产生空白区域
//     x: elem.offsetLeft,
//     y: elem.offsetTop,
//   });
//   const texture = new THREE.CanvasTexture(canvas);
//   texture.magFilter = THREE.NearestFilter; // 提高清晰度，不加这两句画布会变模糊
//   texture.minFilter = THREE.NearestFilter;
//   const spriteMaterial = new THREE.SpriteMaterial({
//     map: texture,
//     opacity: 0.8,
//   }); // 创建精灵材质，map属性设置贴图，为了更高的可配置度，我们选择用canvas贴图
//   const sprite = new THREE.Sprite(spriteMaterial); // 要创建精灵几何体必须要用精灵材质
//   initConfig(sprite, conf);
//   return sprite;
// }
// function initConfig(mesh, conf) {
//   if (conf) {
//     const { position, rotation, scale, repeat } = conf;
//     if (position) {
//       const { x, y, z } = position;
//       x ? (mesh.position.x = x) : null;
//       y ? (mesh.position.y = y) : null;
//       z ? (mesh.position.z = z) : null;
//     }
//     if (rotation) {
//       const { x, y, z } = rotation;
//       x ? (mesh.rotation.x = x) : null;
//       y ? (mesh.rotation.y = y) : null;
//       z ? (mesh.rotation.z = z) : null;
//     }
//     if (scale) {
//       const { x, y, z } = scale;
//       x ? (mesh.scale.x = x) : null;
//       y ? (mesh.scale.y = y) : null;
//       z ? (mesh.scale.z = z) : null;
//     }
//     if (repeat) {
//       const { x, y } = repeat;
//       // 对Texture的repeat进行处理
//       if (x) {
//         // 设置x方向的重复数
//         mesh.wrapS = THREE.RepeatWrapping;
//         mesh.repeat.x = x;
//       }
//       if (y) {
//         // 设置y方向的重复数
//         mesh.wrapT = THREE.RepeatWrapping;
//         mesh.repeat.y = y;
//       }
//     }
//   }
// }

let boxs = [];
let shelves = [];
let INTERSECTED;
let scene = null, // 场景
  camera = null, // 相机
  renderer = null, // 渲染器
  controls = null, // 鼠标控件
  mouse = null,
  font = null,
  raycaster = null;
export default {
  name: "wms",
  mounted() {
    this.init();
  },
  data() {
    return {
      formLabelWidth: "70px",
      form: {
        name: "",
        row: 1,
        col: 1,
      },
      dialogVisible: false,
      detailDialogVisible: false,
      boxDetail: {
        shelfName: "",
        rowIndex: "",
        colIndex: "",
      },
      dragStatus: false,
      // 仓库
      wareHouse: {
        width: 100, // 长
        depth: 100, // 深
        height: 5, // 高
      },
      depth: 0.1, // 墙体厚度预设
      // 存储区
      zoneList: [
        {
          name: "存储区1",
          width: 12, // 长
          depth: 2, // 宽
          // 三维位置信息
          position: {
            x: -10,
            y: 0.1,
            z: -12,
          },
          // 存储区上的货架参数
          shelves: {
            name: "xxx",
            rowNum: 9, // 层数
            columnNum: 12, // 列数
            width: 1.8, // 每格宽
            height: 1.2, // 每格高
            depth: 1.6, // 每格深
          },
        },
        {
          name: "存储区3",
          width: 12, // 长
          depth: 2, // 宽
          // 三维位置信息
          position: {
            x: -10,
            y: 0.1,
            z: -4,
          },
          // 存储区上的货架参数
          shelves: {
            name: "xxx",
            rowNum: 9, // 层数
            columnNum: 12, // 列数
            width: 1.8, // 每格宽
            height: 1.2, // 每格高
            depth: 1.6, // 每格深
          },
        },
        {
          name: "存储区5",
          width: 12, // 长
          depth: 2, // 宽
          // 三维位置信息
          position: {
            x: -10,
            y: 0.1,
            z: 4,
          },
          // 存储区上的货架参数
          shelves: {
            name: "xxx",
            rowNum: 9, // 层数
            columnNum: 12, // 列数
            width: 1.8, // 每格宽
            height: 1.2, // 每格高
            depth: 1.6, // 每格深
          },
        },
        {
          name: "存储区7",
          width: 12, // 长
          depth: 2, // 宽
          // 三维位置信息
          position: {
            x: -10,
            y: 0.1,
            z: 12,
          },
          // 存储区上的货架参数
          shelves: {
            name: "xxx",
            rowNum: 9, // 层数
            columnNum: 12, // 列数
            width: 1.8, // 每格宽
            height: 1.2, // 每格高
            depth: 1.6, // 每格深
          },
        },
      ],
    };
  },
  methods: {
    async init() {
      let $wh = this.$refs.whContainer;
      // 创建场景 设置场景的背景Color
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xb0c4de);
      // 创建透视相机 设置相机的参数
      camera = new THREE.PerspectiveCamera(
        45,
        $wh.clientWidth / $wh.clientHeight,
        0.1,
        20000
      );
      camera.position.set(-Math.PI * 10, 60, 80);
      camera.focus = 0.1;
      scene.add(camera);
      // 3维辅助线
      // let axes = new THREE.AxesHelper(30);
      // axes.position.y = 0.1;
      // scene.add(axes);
      // 网格辅助线 位置比y轴平面高出一点点
      // let gridHelper = new THREE.GridHelper(100, 30, 0x333333, 0x999999);
      // gridHelper.position.y = 0.1;
      // scene.add(gridHelper);
      // 渲染器 抗锯齿 设置尺寸
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.outline = "none";
      renderer.setSize($wh.clientWidth, $wh.clientHeight);
      // 加载之前先删除子节点
      let childNodes = $wh.childNodes;
      if (childNodes[0]) $wh.removeChild(childNodes[0]);
      $wh.appendChild(renderer.domElement);
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
      mouse = new THREE.Vector2();
      raycaster = new THREE.Raycaster();
      $wh.addEventListener("click", this.handleCLick, false);

      //   const sprite = await createSpriteText("#canvas", {
      //     position: { x: 0, y: 6 },
      //     scale: { x: 3, y: 3 },
      //   });
      //   scene.add(sprite);

      // 开始渲染
      this.animate();
      // 窗口大小改变时重绘
      window.addEventListener("resize", this.onWindowResize, false);

      this.loadGltfShelves();
    },
    handleCLick(event) {
      if (this.dragStatus) {
        return;
      }
      event.preventDefault();
      let $wh = this.$refs.whContainer;
      mouse.x = ((event.clientX - $wh.offsetLeft) / $wh.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - $wh.offsetTop) / $wh.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      let intersects = raycaster.intersectObjects(boxs);

      if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
          if (INTERSECTED) {
            INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
          }

          INTERSECTED = intersects[0].object;
          INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
          INTERSECTED.material.emissive.setHex(0x4682b4);
          this.showBoxDetail(INTERSECTED);
        }
      } else {
        if (INTERSECTED) {
          INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        }
        INTERSECTED = null;
      }

      renderer.render(scene, camera);
    },
    // 窗口变化后需要重新渲染
    onWindowResize() {
      let $wh = this.$refs.whContainer;
      camera.aspect = $wh.clientWidth / $wh.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize($wh.clientWidth, $wh.clientHeight);
    },
    // 初始化光源 颜色 强度
    initLight() {
      // var light2 = new THREE.AmbientLight();
      // scene.add(light2);

      var light = new THREE.DirectionalLight();
      light.position.set(20, 50, 40);
      // light.castShadow = true;
      // 设置计算阴影的区域，最好刚好紧密包围在对象周围
      // 计算阴影的区域过大：模糊  过小：看不到或显示不完整
      // light.shadow.camera.near = 0.5;
      // light.shadow.camera.far = 300;
      // light.shadow.camera.left = -50;
      // light.shadow.camera.right = 50;
      // light.shadow.camera.top = 200;
      // light.shadow.camera.bottom = -100;

      // var helper = new THREE.DirectionalLightHelper(light, 5);

      // scene.add(helper);

      scene.add(light);
    },
    // 鼠标空间
    initControls() {
      controls = new OrbitControls(camera, renderer.domElement);
      // 视角最小距离
      controls.minDistance = 0.001;
      // 视角最远距离
      controls.maxDistance = 100;
      // 最大角度
      controls.maxPolarAngle = Math.PI * 0.5;
      controls.target = new THREE.Vector3(0.01, 0.01, 0.01);
    },
    // 渲染
    render() {
      renderer.render(scene, camera);
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
      scene.add(floorMesh);
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
      scene.add(backUpWall);
      // 添加左墙面(width, height, depth, position, rotation)
      let leftWall = createWall(
        this.wareHouse.depth,
        this.wareHouse.height,
        this.depth,
        { x: -this.wareHouse.width / 2, y: this.wareHouse.height / 2 },
        { y: Math.PI / 2 }
      );
      scene.add(leftWall);
      // 添加右墙面(width, height, depth, position, rotation)
      let rightWall = createWall(
        this.wareHouse.depth,
        this.wareHouse.height,
        this.depth,
        { x: this.wareHouse.width / 2, y: this.wareHouse.height / 2 },
        { y: Math.PI / 2 }
      );
      scene.add(rightWall);
    },
    // 初始化存储信息
    initStore() {
      // 记载一个字体用来显示存储区的区域名称
      let loader = new THREE.FontLoader();
      loader.load("/wh/fonts/SimHei_Regular.json", (_font) => {
        font = _font;
        // 生成存储区的区域名称的文字
        // 字体材质
        let matLite = new THREE.MeshBasicMaterial({
          color: 0x000000,
          side: THREE.DoubleSide,
        });
        // 添加文字
        // function creatZoneText(zone, group) {
        //   let zonePos = zone.position;
        //   // 创建单面字体形状
        //   let shapes = font.generateShapes(zone.name, 0.2);
        //   let geometry = new THREE.ShapeBufferGeometry(shapes);
        //   // 左上区域文字
        //   let txtPos = {
        //     x: zonePos.x - zone.width / 2 + 0.05,
        //     y: zonePos.y + 0.01,
        //     z: zonePos.z - zone.depth / 2,
        //   };
        //   let text = new THREE.Mesh(geometry, matLite);
        //   text.position.set(txtPos.x, txtPos.y, txtPos.z);
        //   text.rotation.x = -Math.PI / 2;
        //   text.rotation.z = -Math.PI / 2;
        //   if (group) group.add(text);
        //   // 右下区域文字
        //   txtPos = {
        //     x: zonePos.x + zone.width / 2 - 0.05,
        //     y: zonePos.y + 0.01,
        //     z: zonePos.z + zone.depth / 2,
        //   };
        //   text = new THREE.Mesh(geometry, matLite);
        //   text.position.set(txtPos.x, txtPos.y, txtPos.z);
        //   text.rotation.x = -Math.PI / 2;
        //   text.rotation.z = Math.PI / 2;
        //   if (group) group.add(text);
        // }
        // 遍历存储区每个添加
        this.zoneList.forEach((zone) => {
          this.$set(zone, "height", 0.01);
          // 创建货架摆放区域
          // let zoneGroup = createZone(zone);
          // 添加存储区文字标识
          // creatZoneText(zone, zoneGroup);
          // 加入场景
          //   console.log(zoneGroup)
          //   scene.add(zoneGroup);
          // 如果有货架恻添加存储区的货架
          if (zone.shelves) {
            this.$set(zone.shelves, "x", zone.position.x);
            this.$set(zone.shelves, "y", 0.1);
            this.$set(zone.shelves, "z", zone.position.z);
            let qq = createShelves(zone);
            let shelvesGroup = qq.shelves;
            boxs = boxs.concat(...qq.all_boxs);
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
            // zoneGroup.add(shelvesGroup);
            scene.add(shelvesGroup);
            shelves.push(shelvesGroup);
            // scene.add(shelvesGroup);
          }
        });
        dragEleControls = new DragControls(
          [...shelves],
          camera,
          renderer.domElement
        );
        dragEleControls.addEventListener("hoveron", () => {
          controls.enabled = false;
        });
        dragEleControls.addEventListener("hoveroff", () => {
          controls.enabled = true;
        });
        this.dragStatusChange();
      });
    },
    dragStatusChange() {
      if (this.dragStatus) {
        dragEleControls.activate();
      } else {
        dragEleControls.deactivate();
        if (this.detailDialogVisible) {
          this.detailDialogVisible = false;
        }
      }
    },
    showBoxDetail({ shelf, box }) {
      // this.boxDetail = {
      //   shelfName: shelf.name,
      //   rowIndex: box.rowIndex,
      //   colIndex: box.colIndex,
      // };
      // this.detailDialogVisible = true;
      if (box.status === 1) {
        this.$notify.error({
          title: `${shelf.name} - ${box.rowIndex}排 ${box.rowIndex}列`,
          dangerouslyUseHTMLString: true,
          message: `<strong><i>库存异常</i></strong><br/>xxxxxx<br/>xxxxxx`,
        });
        return;
      }
      this.$notify({
        title: `${shelf.name} - ${box.rowIndex}排 ${box.rowIndex}列`,
        dangerouslyUseHTMLString: true,
        type: box.status === 2 ? "warning" : "",
        message: `<strong><i>${
          box.status === 2 ? "库存告警" : "库存正常"
        }</i></strong><br/>xxxxxx<br/>xxxxxx`,
      });
    },
    addShelve() {
      if (!this.form.name) {
        return;
      }
      let test = {
        name: this.form.name,
        width: 12, // 长
        depth: 2, // 宽
        // 三维位置信息
        position: {
          x: 0,
          y: 0.1,
          z: 0,
        },
        // 存储区上的货架参数
        shelves: {
          name: "xxx",
          rowNum: this.form.row, // 层数
          columnNum: this.form.col, // 列数
          width: 1.8, // 每格宽
          height: 1.2, // 每格高
          depth: 1.6, // 每格深
        },
      };
      this.form.name = "";
      this.newStore(test);
    },
    newStore(zone) {
      // 记载一个字体用来显示存储区的区域名称
      // 字体材质
      let matLite = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
      });

      zone.height = 0.01;
      if (zone.shelves) {
        zone.shelves.x = zone.position.x;
        zone.shelves.y = 0.1;
        zone.shelves.z = zone.position.z;
        let qq = createShelves(zone);
        let shelvesGroup = qq.shelves;
        boxs = boxs.concat(...qq.all_boxs);
        let zShelves = zone.shelves;
        let boardStartX =
          zShelves.x - zone.width / 2 + zShelves.width / 2 + 0.1;
        let boardX = boardStartX + zShelves.width * (zShelves.columnNum - 1);
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
        // zoneGroup.add(shelvesGroup);
        scene.add(shelvesGroup);
        shelves.push(shelvesGroup);
        // scene.add(shelvesGroup);
      }

      dragEleControls.dispose();
      dragEleControls = new DragControls(
        [...shelves],
        camera,
        renderer.domElement
      );
      dragEleControls.addEventListener("hoveron", () => {
        controls.enabled = false;
      });
      dragEleControls.addEventListener("hoveroff", () => {
        controls.enabled = true;
      });
      this.dragStatusChange();
      this.dialogVisible = false;
    },
    loadGltfShelves() {
      var loader = new GLTFLoader();
      loader.load(
        "/wh/model/desk/scene.gltf",
        function (gltf) {
          console.log(gltf);
          gltf.scene.scale.set(0.01, 0.01, 0.01);
          gltf.scene.position.set(26, 0.1, 26);
          gltf.scene.traverse(function (child) {
            child.castShadow = true;
            if (child.isMesh) {
              // child.castShadow = true;
              // child.receiveShadow = true;
            }

            // if (child.isMesh) {
            //   child.material.emissive = child.material.color;
            //   child.material.emissiveMap = child.material.map;
            // }
          });

          scene.add(gltf.scene);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    },
  },
};
</script>

<style scoped>
/* #canvas {
  width: 10vw;
  height: 10vh;
  background-color: rgba(0, 222, 222, 0.5);
} */
.container {
  position: relative;
}
#operate-container {
  position: absolute;
  left: 20px;
  top: 20px;
  display: inline-block;
  width: auto;
  height: auto;
  overflow: hidden;
}
#warehouse {
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
}
.el-row {
  padding-bottom: 10px;
}
</style>