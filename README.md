# 3d-wms

## Project setup
```js
npm i
// 修改部门drag源码
npm run serve
```

## 修改部门drag源码
```js
// 目录three/examples/jsm/controls/ 修改设置拖拽的向量平面
// _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );
_plane.setFromNormalAndCoplanarPoint(new Vector3(0,1,0),new Vector3(0,1,0));

// import { DragControls } from "three/examples/jsm/controls/DragControls";
```