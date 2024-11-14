import * as THREE from 'three'

export class Obj {
  constructor(obj, textures) {
    this.obj = obj
    this.textures = textures

    this.WorldAMat = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide })
    this.WorldBMat = new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide })
  }
  setWorldA(scene) {
    const torusGeo = new THREE.TorusGeometry(10, 2.5, 2, 30)//, Math.PI
    const torusGeoPos = torusGeo.attributes.position
    const torusGeoArray = torusGeoPos.array
    for (let i = 0; i < torusGeoArray.length / 3; i++) {
      const rot = Math.atan2(torusGeoArray[i * 3 + 1], torusGeoArray[i * 3]) / Math.PI * 180 + (torusGeoArray[i * 3 + 1] < 0 ? 360 : 0)
      torusGeoArray[i * 3 + 2] += (rot / 360) * 12
    }
    torusGeoPos.needsUpdate = true
    torusGeo.computeVertexNormals()

    this.slope = new THREE.Object3D()
    this.slope.rotation.x = -Math.PI / 2
    scene.add(this.slope)

    const torus = new THREE.Mesh(torusGeo, this.WorldAMat)
    torus.position.x = -10
    this.slope.add(torus)
    this.obj.push(torus)

    const corridor = new THREE.Object3D()
    corridor.position.y = 12
    corridor.rotation.x = -Math.PI / 2
    scene.add(corridor)

    const corridorGeo = new THREE.PlaneGeometry(5.0, 24.0)
    const plane = new THREE.Mesh(corridorGeo, this.WorldAMat)
    plane.position.y = 12
    corridor.add(plane)
    this.obj.push(plane)
  }
  setWorldB(scene) {
    const ground = new THREE.Object3D()
    ground.position.y = 12
    ground.position.z = -29.8
    ground.rotation.y = Math.PI
    ground.scale.z = 4
    scene.add(ground)

    const geometry = new THREE.CircleGeometry(2.9, 0)
    const cone = new THREE.Mesh(geometry, this.WorldBMat)
    cone.rotation.x = Math.PI / 2
    cone.rotation.z = Math.PI / 2
    ground.add(cone)
    this.obj.push(cone)

    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true, transparent: true, opacity: 1 })
    const starGeo = new THREE.BufferGeometry()
    const dist = 100
    const vertices = []
    for (let i = 0; i <= 300; ++i) {
      const pos = new THREE.Vector3(Math.random() * dist - (dist * 0.5), Math.random() * dist - (dist * 0.5), Math.random() * dist - (dist * 0.5))
      console.log()
      const length = pos.length()
      if(length < 80){
        pos.multiplyScalar(80 / length)
      }
      vertices.push(pos.x, pos.y, pos.z)
    }

    const stride = 3
    const attribute = new THREE.BufferAttribute(new Float32Array(vertices), stride)
    starGeo.setAttribute('position', attribute);

    const star1 = new THREE.Points(starGeo, starMat.clone())
    star1.material.map = this.textures[2]
    star1.position.set(0, 12, -24)
    scene.add(star1)

    const star2 = new THREE.Points(starGeo, starMat.clone())
    star2.material.map = this.textures[3]
    star2.position.set(0, 12, -24)
    star2.rotation.y = Math.PI / 3
    scene.add(star2)

    const star3 = new THREE.Points(starGeo, starMat.clone())
    star3.material.map = this.textures[4]
    star3.position.set(0, 12, -24)
    star3.rotation.x = Math.PI / 3
    scene.add(star3)


    const corridor = new THREE.Object3D()
    corridor.position.y = 12
    corridor.rotation.x = -Math.PI / 2
    scene.add(corridor)

    const corridorGeo = new THREE.PlaneGeometry(5.0, 24.0)
    const plane = new THREE.Mesh(corridorGeo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }))
    plane.position.y = 12
    corridor.add(plane)
  }
}