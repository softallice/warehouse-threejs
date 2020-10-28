import * as THREE from 'three';
export default function (zoneObj) {
    let zoneGroup = new THREE.Group();
    zoneGroup.name = zoneObj.name;
    creatMesh(zoneObj);
    function creatMesh(zone) {
        let geometry = new THREE.BoxGeometry(zone.width, 0.01, zone.depth);
        let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        let zoneMesh = new THREE.Mesh(geometry, material);
        if (zone.position.x) zoneMesh.position.x = zone.position.x;
        if (zone.position.y) zoneMesh.position.y = zone.position.y;
        if (zone.position.z) zoneMesh.position.z = zone.position.z;
        zoneGroup.add(zoneMesh);
    }
    return zoneGroup;
}
