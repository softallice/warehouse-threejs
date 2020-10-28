<template>
  <div id="app">
    <Demo />
  </div>
</template>

<script>
import Demo from "./components/demo.vue";
// import Wms2 from "./components/wms2.vue";
// import dragEle from "./components/dragEle.vue";

export default {
  name: "App",
  components: {
    Demo,
  },
};
</script>

<style>
html,body{
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
}
</style>
