<template>
  <div class="container">
    <div id="btns"></div>
    <div id="warehouse" ref="whContainer">未渲染前</div>
  </div>
</template>

<script>
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
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
      //   controls: null, // 鼠标控件
      objects: [],
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
      // 渲染器 抗锯齿 设置尺寸
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize($wh.clientWidth, $wh.clientHeight);

      // todo
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // this.renderer.setSize(window.innerWidth, window.innerHeight);

      // todo
      //   this.renderer.shadowMap.enabled = true;
      //   this.renderer.shadowMap.type = THREE.PCFShadowMap;

      // 加载之前先删除子节点
      let childNodes = $wh.childNodes;
      if (childNodes[0]) $wh.removeChild(childNodes[0]);
      $wh.appendChild(this.renderer.domElement);

      let light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1).normalize();
      this.scene.add(light);

      this.addSomeGeometry();

      // 鼠标控件

      // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      // this.controls.update()
      // 视角最小距离
      //   this.controls.minDistance = 0.001;
      // 视角最远距离
      //   this.controls.maxDistance = 50;
      // 最大角度
      //   this.controls.maxPolarAngle = Math.PI * 0.5;
      //   this.controls.target = new THREE.Vector3(0.01, 0.01, 0.01);

      //   this.controls = new TrackballControls(
      //     this.camera,
      //     this.renderer.domElement
      //   );
      //   this.controls.rotateSpeed = 1.0;
      //   this.controls.zoomSpeed = 1.2;
      //   this.controls.panSpeed = 0.8;
      //   this.controls.noZoom = false;
      //   this.controls.noPan = false;
      //   this.controls.staticMoving = true;
      //   this.controls.dynamicDampingFactor = 0.3;

      let dragDom = new DragControls(
        this.objects,
        this.camera,
        this.renderer.domElement
      );

      dragDom.addEventListener("dragstart", function (event) {
        console.log("dragstart");
        console.log(event);
        console.log(event.object.isMesh);
        event.object.material.emissive.set(0xaaaaaa);
      });
      dragDom.addEventListener("dragend", function (event) {
        console.log("dragend");
        event.object.material.emissive.set(0x000000);
      });

      dragDom.addEventListener("drag", (event) => {
        console.log(
          event.object.position.x,
          event.object.position.y,
          event.object.position.z
        );
      });

      //   dragControls.addEventListener("dragstart", function () {
      //     console.log("dragstart");
      //     this.controls.enabled = false;
      //   });
      //   dragControls.addEventListener("dragend", function () {
      //     console.log("dragend");
      //     this.controls.enabled = true;
      //   });
      // 窗口大小改变时重绘
      window.addEventListener("resize", this.onWindowResize, false);

      // 开始渲染
      this.animate();
    },

    // 添加一些立方体
    addSomeGeometry() {
      let geometry = new THREE.BoxBufferGeometry(20, 20, 20);

      for (var i = 0; i < 1000; i++) {
        let object = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
        );

        object.position.x = Math.random() * 800 - 400;
        object.position.y = Math.random() * 800 - 400;
        object.position.z = Math.random() * 800 - 400;
        // object.position.z = 0;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() + 0.5;
        object.scale.y = Math.random() + 0.5;
        object.scale.z = Math.random() + 0.5;

        object.name = "访谈122112";
        object.objectId = i + 1;

        object.castShadow = true;
        object.receiveShadow = true;

        this.scene.add(object);
        this.objects.push(object);
      }
    },
    // 窗口变化后需要重新渲染
    onWindowResize() {
      let $wh = this.$refs.whContainer;
      this.camera.aspect = $wh.clientWidth / $wh.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize($wh.clientWidth, $wh.clientHeight);
    },
    // 渲染
    render() {
      //   this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },
    // 动画
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
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