# 3d-wms

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

```js
// 修改部门drag源码 three/examples/jsm/controls/
import { DragControls } from "three/examples/jsm/controls/DragControls";

// 修改设置拖拽的向量平面
// _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );
_plane.setFromNormalAndCoplanarPoint(new Vector3(0,1,0),new Vector3(0,1,0));
```