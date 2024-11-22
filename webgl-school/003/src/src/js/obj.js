import * as THREE from './lib/three.module.js';
import { Param } from './param.js';

export class Obj {
  constructor(scene, material_array, tex) {
    this.scene = scene
    this.material_array = material_array
    this.ground_array = []
    this.road_array = []
    this.roadLine_array = []
    this.buildingSet_array = []
    this.building_array = []
    this.bulbs_array = {
      x: [],
      y: [],
      z: []
    }

    this.nomarlMaterial = new THREE.MeshStandardMaterial({
      color: 0x999999,
      side: THREE.DoubleSide,
    })
    this.buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, map: tex }),
      new THREE.MeshStandardMaterial({ color: 0xbbbbbb, side: THREE.DoubleSide, map: tex }),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, side: THREE.DoubleSide, map: tex })
    ]
    this.signalMaterial = [
      this.nomarlMaterial.clone(),
      this.nomarlMaterial.clone(),
      this.nomarlMaterial.clone()
    ]
    this.signalMaterial[0].color.setHex(0x55ffff)
    this.signalMaterial[1].color.setHex(0xffff55)
    this.signalMaterial[2].color.setHex(0xff5555)

    this.cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 32)
    this.capsuleGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 2, 4)
    this.bulbGeometry = new THREE.SphereGeometry(0.15, 8, 8, 0, Math.PI)
    this.buildingGeometry = new THREE.BoxGeometry(2, 6, 2)
    this.groundGeometry = new THREE.SphereGeometry(9.8, 32, 32)
    this.roadGeometry = new THREE.SphereGeometry(10, 32, 32)
    this.centerLineGeometry = new THREE.CylinderGeometry(10.0, 10.0, 0.15, 64, 64, true, Math.PI / 15 + Math.PI / 30, Math.PI / 3.4);
    this.stopLineGeometry = new THREE.CylinderGeometry(10.0, 10.0, 0.15, 64, 64, true, Math.PI / 1.96, Math.PI / 24);

    const groundGeometryPos = this.groundGeometry.attributes.position;
    const groundGeometryArray = groundGeometryPos.array;
    for (let i = 0; i < groundGeometryArray.length; i += 3) {
      if (groundGeometryArray[i] < Param.ROAD_PARAM.width) { groundGeometryArray[i] = Param.ROAD_PARAM.width - groundGeometryArray[i] / 500 }
      if (groundGeometryArray[i + 1] < Param.ROAD_PARAM.width) { groundGeometryArray[i + 1] = Param.ROAD_PARAM.width - groundGeometryArray[i + 1] / 500 }
      if (groundGeometryArray[i + 2] < Param.ROAD_PARAM.width) { groundGeometryArray[i + 2] = Param.ROAD_PARAM.width - groundGeometryArray[i + 2] / 500 }
    }
    groundGeometryPos.needsUpdate = true

    const roadGeometryPos = this.roadGeometry.attributes.position;
    const roadGeometryArray = roadGeometryPos.array;
    for (let i = 0; i < roadGeometryArray.length; i += 3) {
      roadGeometryArray[i] = Math.min(Param.ROAD_PARAM.width2, Math.max(-Param.ROAD_PARAM.width2, roadGeometryArray[i]))
    }
    roadGeometryPos.needsUpdate = true

    this.container = new THREE.Object3D()
    this.scene.add(this.container)
  }
  create(rot, label) {
    const container = new THREE.Object3D()
    container.rotation.copy(rot)
    this.container.add(container)

    if (label === 'road') {
      this.road_array.push(container)
      const road = new THREE.Mesh(this.roadGeometry, this.material_array.road)
      container.add(road)
    }
    else if (label === 'building') {
      const rotContainer = new THREE.Object3D()
      rotContainer.rotation.z = -Math.PI / 3.3
      container.add(rotContainer)

      let count = 6 + Math.round(Math.random() * 10)
      for (let i = 0; i < count; i++) {
        const offsetContainer = new THREE.Object3D()
        const rot = Math.PI * 2 / (count - 1) * (i - 1) + Math.PI / 12 * (Math.random() - 0.5)
        const dist = i === 0 ? 0 : 3 - Math.random() * 1
        const scaleXZ = 1 - 0.7 * dist / 3
        offsetContainer.scale.copy(new THREE.Vector3(scaleXZ, Math.random() * 0.7 + 0.3, scaleXZ))
        offsetContainer.position.copy(new THREE.Vector3(dist * Math.sin(rot), 9, dist * Math.cos(rot)))
        rotContainer.add(offsetContainer)
        this.building_array.push(offsetContainer)
        offsetContainer.set = {
          scaleY: offsetContainer.scale.y,
          speed: 1 + Math.random() * 3,
          delay: Math.PI * 2 * Math.random()
        }

        const building = new THREE.Mesh(this.buildingGeometry, this.buildingMaterials[Math.round(Math.random() * 2)])
        building.position.y = 3
        offsetContainer.add(building)
      }
      this.buildingSet_array.push(container)
    }
    else if (label === 'signal') {
      let key
      if (rot.y === 0 && rot.z === 0) { key = 'x' }
      else if (rot.x === 0) { key = 'y' }
      else { key = 'z' }
      this.bulbs_array[key].push([])

      for (let h = 0; h < 2; h++) {
        const rotContainer = new THREE.Object3D()
        rotContainer.rotation.y = Math.PI * h
        container.add(rotContainer)

        const offsetContainer = new THREE.Object3D()
        offsetContainer.position.set(-2.2, 9.7, -2.2)
        rotContainer.add(offsetContainer)
        const cylinder = new THREE.Mesh(this.cylinderGeometry, this.nomarlMaterial)
        const capsule = new THREE.Mesh(this.capsuleGeometry, this.nomarlMaterial)
        capsule.position.set(0.5, 2.2, 0)
        capsule.rotation.set(Math.PI / 4, 0, Math.PI / 2)

        for (let i = 0; i < 3; i++) {
          const bulb = new THREE.Mesh(this.bulbGeometry, this.signalMaterial[i])
          bulb.position.set(0.23 + 0.3 * i, 2.2, 0.13)
          offsetContainer.add(bulb)

          const bulbCover = new THREE.Mesh(this.bulbGeometry, this.nomarlMaterial)
          bulbCover.position.set(0.23 + 0.3 * i, 2.2, 0.14)
          bulbCover.activeFlag = true
          offsetContainer.add(bulbCover)
          this.bulbs_array[key][this.bulbs_array[key].length - 1].push(bulbCover)
        }
        offsetContainer.add(cylinder, capsule)
      }
    }
    else if (label === 'ground') {
      this.ground_array.push(container)
      const ground = new THREE.Mesh(this.groundGeometry, this.material_array.ground)
      container.add(ground)
    }
    else if (label === 'roadLine') {
      this.roadLine_array.push(container)
      const centerLine = new THREE.Mesh(this.centerLineGeometry, this.material_array.roadLine)

      const stopLineContainer = new THREE.Object3D()
      stopLineContainer.rotation.set(0.0, -Math.PI / 8.5, 0.0)
      const stopLine = new THREE.Mesh(this.stopLineGeometry, this.material_array.roadLine)
      stopLine.rotation.set(Math.PI / 2, 0.0, 0.0)
      stopLineContainer.add(stopLine)

      const stopLineContainer2 = new THREE.Object3D()
      stopLineContainer2.rotation.copy(new THREE.Euler(Math.PI / 32, -Math.PI / 2.58, -Math.PI / 32))
      const stopLine2 = new THREE.Mesh(this.stopLineGeometry, this.material_array.roadLine)
      stopLine2.rotation.set(Math.PI / 2, 0.0, 0.0)
      stopLineContainer2.add(stopLine2)

      container.add(centerLine, stopLineContainer, stopLineContainer2)
    }
  }
  moveBuilding(time) {
    this.building_array.forEach((building) => {
      let p = Math.sin(time * 3 * building.set.speed + building.set.delay)
      building.scale.y = building.set.scaleY + p * p * 0.05
    })
  }
  signalYellow(signalPat) {
    for (let key in this.bulbs_array) {
      for (let i = 0; i < this.bulbs_array[key].length; i++) {
        if (signalPat[key][i] == 1 && this.bulbs_array[key][i][0].position.z === 0.1) {
          for (let h = 0; h < this.bulbs_array[key][i].length; h++) {
            if (h % 3 == 1) { this.bulbs_array[key][i][h].position.z = 0.1 }
            else if (h % 3 == 0 || h % 3 == 2) { this.bulbs_array[key][i][h].position.z = 0.14 }
          }
        }
      }
    }
  }
  signalUpdate(signalPat) {
    for (let key in this.bulbs_array) {
      for (let i = 0; i < this.bulbs_array[key].length; i++) {
        for (let h = 0; h < this.bulbs_array[key][i].length; h++) {
          if (signalPat[key][i] == 1) {
            if (h % 3 == 0 || h % 3 == 1) { this.bulbs_array[key][i][h].position.z = 0.14 }
            else if (h % 3 == 2) { this.bulbs_array[key][i][h].position.z = 0.1 }
          } else {
            if (h % 3 == 0) { this.bulbs_array[key][i][h].position.z = 0.1 }
            else if (h % 3 == 1 || h % 3 == 2) { this.bulbs_array[key][i][h].position.z = 0.14 }
          }
        }
      }
    }
  }
}