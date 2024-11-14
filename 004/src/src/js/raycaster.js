import * as THREE from 'three'

export class Raycaster {
  constructor(camera, obj) {
    this.camera = camera
    this.obj = obj
    this.raycaster_userFoot = new THREE.Raycaster()
  }
  setClick(params) {
    const raycaster = new THREE.Raycaster()

    const { targets, onUpdate } = params

    window.addEventListener('click', (e) => {
      const x = e.clientX / window.innerWidth * 2.0 - 1.0
      const y = e.clientY / window.innerHeight * 2.0 - 1.0
      const v = new THREE.Vector2(x, -y)
      raycaster.setFromCamera(v, this.camera)

      const intersects = raycaster.intersectObjects(targets)
      if (intersects.length > 0) {
        onUpdate(intersects[0].object.userData.index)
      }
    }, false)
  }
  setHover(params) {
    const raycaster = new THREE.Raycaster()

    const { targets, onUpdate } = params

    window.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth * 2.0 - 1.0
      const y = e.clientY / window.innerHeight * 2.0 - 1.0
      const v = new THREE.Vector2(x, -y)
      raycaster.setFromCamera(v, this.camera)

      const intersects = raycaster.intersectObjects(targets)
      if (intersects.length > 0) {
        onUpdate(intersects[0].object.userData.index)
      }
    }, false)
  }
  getUserFoot(pos) {
    pos.y += 0.1
    this.raycaster_userFoot.set(pos, new THREE.Vector3(0, -1, 0))

    const intersects = this.raycaster_userFoot.intersectObjects(this.obj, true)
    if (intersects.length > 0) {
      return Math.max(0, intersects[0].point.y)
    } else {
      return 0
    }
  }
}