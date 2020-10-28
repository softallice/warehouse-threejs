<template>
  <div class="container">
    <div id="btns"></div>
    <div id="warehouse" ref="whContainer">未渲染前</div>
  </div>
</template>

<script>
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
var dragEleControls = null;
export default {
  name: "wms",
  mounted() {
    this.init();
    this.animate();
  },
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      objects: [],
    };
  },
  methods: {
    init() {
      let $wh = this.$refs.whContainer;

      // 场景
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf0f0f0);

      // 环境光 不能投影 均匀照亮
      this.scene.add(new THREE.AmbientLight(0x505050));

      // 相机
      this.camera = new THREE.PerspectiveCamera(
        70,
        $wh.clientWidth / $wh.clientHeight,
        1,
        5000
      );
      this.camera.position.z = 1000;

      // 立方体
      let geometry = new THREE.BoxBufferGeometry(40, 40, 40);
      for (var i = 0; i < 200; i++) {
        let object = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
        );

        object.position.x = Math.random() * 1000 - 500;
        object.position.y = Math.random() * 600 - 300;
        object.position.z = Math.random() * 800 - 400;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.castShadow = true;
        object.receiveShadow = true;

        this.scene.add(object);
        this.objects.push(object);
      }

      // 渲染器
      let childNodes = $wh.childNodes;
      if (childNodes[0]) $wh.removeChild(childNodes[0]);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize($wh.clientWidth, $wh.clientHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      $wh.appendChild(this.renderer.domElement);

      // 控制器
      this.controls = new TrackballControls(
        this.camera,
        this.renderer.domElement
      );
      this.controls.rotateSpeed = 1.0;
      this.controls.zoomSpeed = 1.2;
      this.controls.panSpeed = 0.8;
      this.controls.noZoom = false;
      this.controls.noPan = false;
      this.controls.staticMoving = true;
      this.controls.dynamicDampingFactor = 0.3;
      // todo
      this.controls.enabled = false;

      // 拖拽
      dragEleControls = new DragControls(
        [...this.objects],
        this.camera,
        this.renderer.domElement
      );
      dragEleControls.addEventListener("hoveron", () => {
        this.controls.enabled = false;
      });
      dragEleControls.addEventListener("hoveroff", () => {
        this.controls.enabled = true;
      });

      window.addEventListener("resize", this.onWindowResize(), false);
    },
    onWindowResize() {
      let $wh = this.$refs.whContainer;
      this.camera.aspect = $wh.clientWidth / $wh.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize($wh.clientWidth, $wh.clientHeight);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
    },
    render() {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
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