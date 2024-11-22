import * as THREE from './lib/three.module.js';

export class Plane {
  constructor(scene) {
    this.scene = scene

    this.nomarlMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      side: THREE.DoubleSide,
    })

    this.capsuleGeometry = new THREE.CapsuleGeometry(1, 8, 10, 20)
    this.boxGeometry = new THREE.BoxGeometry(2, 2, 2)

    const capsuleGeometryPos = this.capsuleGeometry.attributes.position
    const capsuleGeometryArray = capsuleGeometryPos.array
    for (let i = 0; i < capsuleGeometryArray.length / 3; i++) {
      const p = (1 + capsuleGeometryArray[i * 3 + 1] / 5 / 8)
      capsuleGeometryArray[i * 3] *= p
      capsuleGeometryArray[i * 3 + 2] *= p
    }
    capsuleGeometryPos.needsUpdate = true

    const boxGeometryPos = this.boxGeometry.attributes.position
    const boxGeometryArray = boxGeometryPos.array
    for (let i = 0; i < boxGeometryArray.length / 3; i++) {
      if (boxGeometryArray[i * 3] < 0 && 0 < boxGeometryArray[i * 3 + 2]) {
        boxGeometryArray[i * 3] = 0
        boxGeometryArray[i * 3 + 2] = 0
      }
    }
    boxGeometryPos.needsUpdate = true

    this.container = new THREE.Object3D()
    this.scene.add(this.container)
  }
  create() {
    const body = new THREE.Mesh(this.capsuleGeometry, this.nomarlMaterial)
    this.container.add(body)
    body.scale.y = 1.2
    body.rotation.x = Math.PI / 2

    const rightWing = new THREE.Mesh(this.boxGeometry, this.nomarlMaterial)
    this.container.add(rightWing)
    rightWing.position.copy(new THREE.Vector3(-3, 0, 1.5))
    rightWing.rotation.y = -Math.PI / 12
    rightWing.scale.copy(new THREE.Vector3(3.0, 0.1, 1.5))

    const leftWing = new THREE.Object3D()
    this.container.add(leftWing)
    leftWing.rotation.z = Math.PI
    const leftWingP1 = new THREE.Mesh(this.boxGeometry, this.nomarlMaterial)
    leftWing.add(leftWingP1)
    leftWingP1.position.copy(new THREE.Vector3(-3, 0, 1.5))
    leftWingP1.rotation.y = -Math.PI / 12
    leftWingP1.scale.copy(new THREE.Vector3(3.0, 0.1, 1.5))

    const rightTail = new THREE.Mesh(this.boxGeometry, this.nomarlMaterial)
    this.container.add(rightTail)
    rightTail.position.copy(new THREE.Vector3(-1, 0, -3.7))
    rightTail.rotation.y = -Math.PI / 12
    rightTail.scale.copy(new THREE.Vector3(1.5, 0.1, 1))

    const leftTail = new THREE.Object3D()
    this.container.add(leftTail)
    leftTail.rotation.z = Math.PI
    const leftTailP1 = new THREE.Mesh(this.boxGeometry, this.nomarlMaterial)
    leftTail.add(leftTailP1)
    leftTailP1.position.copy(new THREE.Vector3(-1, 0, -3.7))
    leftTailP1.rotation.y = -Math.PI / 12
    leftTailP1.scale.copy(new THREE.Vector3(1.5, 0.1, 1))

    const centerTail = new THREE.Object3D()
    this.container.add(centerTail)
    centerTail.rotation.z = -Math.PI / 2
    const centerTailP1 = new THREE.Mesh(this.boxGeometry, this.nomarlMaterial)
    centerTail.add(centerTailP1)
    centerTailP1.position.copy(new THREE.Vector3(-1, 0, -3.7))
    centerTailP1.rotation.y = -Math.PI / 12
    centerTailP1.scale.copy(new THREE.Vector3(1.5, 0.1, 1))
  }
}