import * as THREE from './lib/three.module.js';
import { Param } from './param.js';

export class Car {
  constructor(scene, signalPat) {
    this.scene = scene
    this.car_array = []
    this.initSignalPat = signalPat
    this.plaCount = 0

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    })

    this.sphereGeometry = new THREE.SphereGeometry(1)
    this.boxGeometry = new THREE.BoxGeometry(1, 1.0, 2.0);

    this.tmpVec = new THREE.Vector3();
    this.tmpEuler = new THREE.Euler();

    this.lane = {
      '[1,0,0]': [[], [], [], []],
      '[-1,0,0]': [[], [], [], []],
      '[0,1,0]': [[], [], [], []],
      '[0,-1,0]': [[], [], [], []],
      '[0,0,1]': [[], [], [], []],
      '[0,0,-1]': [[], [], [], []]
    }

    this.laneInitRot = {
      '[1,0,0]': new THREE.Euler(0, 0, 0),
      '[-1,0,0]': new THREE.Euler(0, Math.PI, 0),
      '[0,1,0]': new THREE.Euler(0, Math.PI / 2, Math.PI / 2),
      '[0,-1,0]': new THREE.Euler(0, -Math.PI / 2, -Math.PI / 2),
      '[0,0,1]': new THREE.Euler(-Math.PI / 2, 0, -Math.PI / 2),
      '[0,0,-1]': new THREE.Euler(Math.PI / 2, 0, -Math.PI / 2)
    }

    this.carGeometry = new THREE.BoxGeometry(1, 0.5, 2.0)
    this.carGeometry2 = new THREE.BoxGeometry(1, 0.4, 2.0)
    this.carGeometry3 = new THREE.TorusGeometry(0.15, 0.1, 10, 32)
    this.carGeometry4 = new THREE.PlaneGeometry(1, 1)
    this.carGeometry5 = new THREE.SphereGeometry(0.1, 16, 16)

    this.material = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide })
    this.material2 = new THREE.MeshBasicMaterial({
      color: 0xffffff, side: THREE.DoubleSide, transparent: true,
      opacity: 0.3
    })
    this.materials = [
      new THREE.MeshStandardMaterial({ color: 0x9B7843, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0x9B7B6C, side: THREE.DoubleSide }),
      new THREE.MeshStandardMaterial({ color: 0x90AD66, side: THREE.DoubleSide }),
    ]

    const carGeometryPos = this.carGeometry.attributes.position
    const carGeometryArray = carGeometryPos.array
    for (let i = 0; i < carGeometryArray.length / 3; i++) {
      if (0 < carGeometryArray[i * 3 + 1]) {
        carGeometryArray[i * 3] *= 0.8
        carGeometryArray[i * 3 + 2] *= 0.5
        carGeometryArray[i * 3 + 2] -= 0.15
      }
    }
    carGeometryPos.needsUpdate = true

    const carGeometryPos2 = this.carGeometry4.attributes.position
    const carGeometryArray2 = carGeometryPos2.array
    for (let i = 0; i < carGeometryArray2.length / 3; i++) {
      if (0 < carGeometryArray2[i * 3 + 1]) {
        carGeometryArray2[i * 3] *= 0.85
      }
    }
    carGeometryPos2.needsUpdate = true
  }
  calc(vecA, vecB) {
    const arrayA = JSON.parse(vecA)
    const arrayB = Object.values(vecB)
    let resultA = []
    let resultB = []
    for (let i = 0; i < 3; i++) {
      if (arrayA[i] !== 0) { resultA = [i, arrayA[i]] }
      if (arrayB[i] !== 0) { resultB = [i, arrayB[i]] }
    }

    let c = [0, 0, 0]
    let index = 0
    for (let i = 0; i < 3; i++) {
      if (i !== resultA[0] && i !== resultB[0]) {
        if ((resultA[0] + 1) % 3 == resultB[0]) {
          c[i] = 1 * resultA[1] * resultB[1]
          index = resultA[1] === -1 ? 3 : 1
        } else {
          c[i] = -1 * resultA[1] * resultB[1]
          index = resultB[1] === -1 ? 2 : 0
        }
      }
    }

    //console.log(JSON.stringify([arrayA, arrayB, c, index]))
    return [c, index]
    //return JSON.stringify([arrayA, arrayB, c, index])
  }
  create(rot, sectionIndex) {
    const array = {
      horizontal: '',
      vertical: '',
      car: '',
      plaCount: this.plaCount,
      update: true,
      straight: false,
      turn: false,
      id: this.car_array.length
    }
    this.car_array.push(array)
    this.plaCount++

    const rotKey = JSON.stringify(rot)

    const horizontalContainer = new THREE.Object3D();
    horizontalContainer.rotation.copy(this.laneInitRot[rotKey])
    horizontalContainer.flag = false
    horizontalContainer.trun = false
    horizontalContainer.rotY = 0
    horizontalContainer.axis = new THREE.Vector3()
    this.scene.add(horizontalContainer)
    array.horizontal = horizontalContainer

    horizontalContainer.laneLabel = rotKey
    horizontalContainer.laneIndex = (sectionIndex + 3) % 4
    horizontalContainer.initLaneIndex = horizontalContainer.laneIndex
    horizontalContainer.turnJudgeTiming = sectionIndex
    this.lane[horizontalContainer.laneLabel][horizontalContainer.laneIndex].push(array)

    let signalArray
    if (horizontalContainer.laneLabel === '[1,0,0]' || horizontalContainer.laneLabel === '[-1,0,0]') { signalArray = [...this.initSignalPat.x] }
    else if (horizontalContainer.laneLabel === '[0,1,0]' || horizontalContainer.laneLabel === '[0,-1,0]') { signalArray = [...this.initSignalPat.y] }
    else if (horizontalContainer.laneLabel === '[0,0,1]' || horizontalContainer.laneLabel === '[0,0,-1]') { signalArray = [...this.initSignalPat.z] }
    let signalIndex = (horizontalContainer.laneIndex + 1) % 4

    const verticalContainer = new THREE.Object3D()
    verticalContainer.rotation.x = sectionIndex * Math.PI / 2 - (this.lane[horizontalContainer.laneLabel][horizontalContainer.laneIndex].length - 1) * Math.PI / 12
    verticalContainer.rotX = 0
    verticalContainer.maxRotX = signalArray[signalIndex] == 1 ? verticalContainer.rotation.x : Math.ceil(verticalContainer.rotation.x / (Math.PI / 2)) * Math.PI / 2 + Math.PI / 2
    verticalContainer.speed = 1
    horizontalContainer.add(verticalContainer)
    array.vertical = verticalContainer

    const container = new THREE.Object3D()
    container.rotation.x = -Math.PI / 6.2
    verticalContainer.add(container)

    const car = new THREE.Object3D()
    car.position.set(1.1, 10.55, 0)
    car.rotation.z = -Math.PI / 36
    container.add(car)
    this.createCar(car, Math.round(Math.random() * 2))
    array.car = car
  }
  move(time, deltaTime, option) {
    this.car_array.forEach(function (car_array) {
      car_array.update = true
      car_array.straight = false
      car_array.turn = false
    })

    for (let key in this.lane) {
      const lane = this.lane[key]
      for (let i = 0; i < lane.length; i++) {
        const section = lane[i]
        for (let h = 0; h < section.length; h++) {
          const car_array = section[h]

          if (car_array.update) {
            car_array.update = false

            const horizontalContainer = section[h].horizontal
            const verticalContainer = section[h].vertical
            const car = section[h].car

            let signalArray
            if (horizontalContainer.laneLabel === '[1,0,0]' || horizontalContainer.laneLabel === '[-1,0,0]') { signalArray = [...option.signal.x] }
            else if (horizontalContainer.laneLabel === '[0,1,0]' || horizontalContainer.laneLabel === '[0,-1,0]') { signalArray = [...option.signal.y] }
            else if (horizontalContainer.laneLabel === '[0,0,1]' || horizontalContainer.laneLabel === '[0,0,-1]') { signalArray = [...option.signal.z] }

            let signalIndex = (i + 1) % 4
            if (horizontalContainer.laneLabel === '[-1,0,0]' || horizontalContainer.laneLabel === '[0,-1,0]' || horizontalContainer.laneLabel === '[0,0,-1]') {
              signalIndex = (4 - signalIndex) % 4
            }

            let curtIndex = Math.ceil(verticalContainer.rotation.x / (Math.PI / 2))
            let curtRot = (verticalContainer.rotation.x % (Math.PI / 2)) * 180 / Math.PI
            if (curtRot < 0) { curtRot += Math.PI / 2 * 180 / Math.PI }

            if (70 < curtRot && curtRot < 80) {
              if (signalArray[signalIndex] == 1) { verticalContainer.maxRotX = curtIndex * Math.PI / 2 }
              else { verticalContainer.maxRotX = curtIndex * Math.PI / 2 + Math.PI / 2 }
            }

            if (verticalContainer.maxRotX > verticalContainer.rotation.x) {
              if (horizontalContainer.flag === 'right') {
                if (h !== 0) {
                  if (this.safeDistance(section[h - 1].car, car) > Param.CAR_PARAM.safeDistance) {
                    if (!(this.safeDistance(section[h - 1].car, car) - Param.CAR_PARAM.safeDistance < 0.05 && section[h - 1].horizontal.trun)) {
                      verticalContainer.rotation.x += Math.min(verticalContainer.rotX, deltaTime / 2)
                      verticalContainer.rotX = Math.max(0, verticalContainer.rotX - deltaTime / 2)
                    }
                  }
                } else {
                  verticalContainer.rotation.x += Math.min(verticalContainer.rotX, deltaTime / 2)
                  verticalContainer.rotX = Math.max(0, verticalContainer.rotX - deltaTime / 2)
                }

                if (verticalContainer.rotX < Math.PI / 6.2 / 4) {
                  const qtn = new THREE.Quaternion().setFromAxisAngle(horizontalContainer.axis, -Math.min(horizontalContainer.rotY, deltaTime * 1.5))
                  horizontalContainer.quaternion.premultiply(qtn)
                  horizontalContainer.rotY = Math.max(0, horizontalContainer.rotY - deltaTime * 1.5)
                  horizontalContainer.trun = true
                  if (horizontalContainer.rotY === 0) {
                    horizontalContainer.flag = false
                    horizontalContainer.trun = false

                    const newLane = this.calc(horizontalContainer.laneLabel, horizontalContainer.axis)
                    car_array.prevLaneLabel = horizontalContainer.laneLabel
                    car_array.prevLaneIndex = horizontalContainer.laneIndex % 4

                    horizontalContainer.laneLabel = JSON.stringify(newLane[0])
                    horizontalContainer.laneIndex = (newLane[1] + 3) % 4

                    car_array.turn = true
                    car_array.section = section
                  }
                  else if (horizontalContainer.rotY < Math.PI / 4) { verticalContainer.rotation.x += deltaTime / 6 }
                }

              } else {
                if (h !== 0) {
                  if (this.safeDistance(section[h - 1].car, car) > Param.CAR_PARAM.safeDistance) {
                    if (!(this.safeDistance(section[h - 1].car, car) - Param.CAR_PARAM.safeDistance < 0.05 && section[h - 1].horizontal.trun)) {
                      verticalContainer.rotation.x += deltaTime / 2 * verticalContainer.speed
                    }
                  }
                } else {
                  const frontLane = lane[(i + 1) % lane.length]
                  if (frontLane.length > 0) {
                    if (this.safeDistance(frontLane[frontLane.length - 1].car, car) > Param.CAR_PARAM.safeDistance) {
                      verticalContainer.rotation.x += deltaTime / 2 * verticalContainer.speed
                    }
                  }
                  else { verticalContainer.rotation.x += deltaTime / 2 * verticalContainer.speed }
                }

                const progress = Math.round((verticalContainer.rotation.x + Math.PI / 12.4) / (Math.PI / 2)) + (horizontalContainer.initLaneIndex === 3 ? 3 : -1)
                if (progress > horizontalContainer.laneIndex) {
                  horizontalContainer.progress = progress
                  car_array.straight = true
                  car_array.section = section
                }

                const turnJudgeTiming = Math.round(verticalContainer.rotation.x / (Math.PI / 2))
                if (horizontalContainer.turnJudgeTiming !== turnJudgeTiming) {
                  horizontalContainer.turnJudgeTiming = turnJudgeTiming
                  if (Math.random() > 0.5) { this.nextTurnRight(car_array) }
                }
              }
            }
            verticalContainer.rotation.x = Math.min(verticalContainer.rotation.x, verticalContainer.maxRotX)
          }
        }
      }
    }

    this.car_array.forEach((car_array) => {
      if (car_array.turn) {
        for (let i = 0; i < 4; i++) {
          let tgt = this.lane[car_array.prevLaneLabel][i]
          let index = tgt.findIndex(item => item.id === car_array.id)
          if (index !== -1) {
            tgt.splice(index, 1)
            this.lane[car_array.horizontal.laneLabel][car_array.horizontal.laneIndex].push(car_array)
          }
        }
      } else if (car_array.straight) {
        for (let i = 0; i < 4; i++) {
          let tgt = this.lane[car_array.horizontal.laneLabel][i]
          let index = tgt.findIndex(item => item.id === car_array.id)

          if (index !== -1) {
            tgt.splice(index, 1)
            this.lane[car_array.horizontal.laneLabel][(i + 1) % 4].push(car_array)
            car_array.horizontal.laneIndex = car_array.horizontal.progress
            break
          }
        }
      }
    })

    let ccc = 0
    for (let key in this.lane) {
      const lane = this.lane[key]
      ccc += lane[0].length + lane[1].length + lane[2].length + lane[3].length
    }
  }
  safeDistance(frontCar, car) {
    frontCar.getWorldPosition(this.tmpVec)
    const v1 = new THREE.Vector3(0, 0, 0).copy(this.tmpVec).normalize()

    car.getWorldPosition(this.tmpVec)
    const v2 = new THREE.Vector3(0, 0, 0).copy(this.tmpVec).normalize()

    return Math.abs(Math.acos(v1.dot(v2)))
  }
  signalJugde(signalPat) {
    this.car_array.forEach(function (car) {
      const h = car.horizontal
      const v = car.vertical
      let signalArray
      if (h.laneLabel === '[1,0,0]' || h.laneLabel === '[-1,0,0]') { signalArray = [...signalPat.x] }
      else if (h.laneLabel === '[0,1,0]' || h.laneLabel === '[0,-1,0]') { signalArray = [...signalPat.y] }
      else if (h.laneLabel === '[0,0,1]' || h.laneLabel === '[0,0,-1]') { signalArray = [...signalPat.z] }

      let curtRot = (v.rotation.x % (Math.PI / 2)) * 180 / Math.PI
      let signalIndex = ((curtRot < 40 ? 1 : 0) + h.laneIndex + 1) % 4
      v.maxRotX = signalArray[signalIndex] == 1 ? v.maxRotX : Math.ceil(v.rotation.x / (Math.PI / 2)) * Math.PI / 2 + Math.PI / 2

      if (0.01 < curtRot && curtRot < 75) { v.maxRotX = Math.ceil(v.rotation.x / (Math.PI / 2)) * Math.PI / 2 + Math.PI / 2 }
    })

  }
  nextTurnRight(car_array) {
    const horizontalContainer = car_array.horizontal
    const verticalContainer = car_array.vertical
    const car = car_array.car

    horizontalContainer.flag = 'right'
    horizontalContainer.rotY = Math.PI / 2
    verticalContainer.rotX = Math.round((verticalContainer.rotation.x) / (Math.PI / 2)) * Math.PI / 2 + Math.PI / 6.2 - verticalContainer.rotation.x
    verticalContainer.delay = 2 + Math.round(Math.random() * 3)
    this.tmpEuler.copy(verticalContainer.rotation)
    verticalContainer.rotation.x = Math.round((verticalContainer.rotation.x) / (Math.PI / 2)) * Math.PI / 2 + Math.PI / 6.2
    car.position.x = 0

    car.getWorldPosition(this.tmpVec);
    this.tmpVec.normalize();
    horizontalContainer.axis.copy(this.tmpVec)
    horizontalContainer.axis.x = Math.round(horizontalContainer.axis.x)
    horizontalContainer.axis.y = Math.round(horizontalContainer.axis.y)
    horizontalContainer.axis.z = Math.round(horizontalContainer.axis.z)

    verticalContainer.rotation.copy(this.tmpEuler)
    car.position.x = 1.1
  }
  createCar(wrap, matIndex) {
    const part1 = new THREE.Mesh(this.carGeometry, this.materials[matIndex]);
    part1.position.set(0, 0.25, 0)
    wrap.add(part1)

    const part2 = new THREE.Mesh(this.carGeometry2, this.materials[matIndex]);
    part2.position.set(0, -0.2, 0)
    wrap.add(part2)

    for (let i = 0; i < 4; i++) {
      const part3 = new THREE.Object3D()
      part3.position.set(i < 2 ? 0.3 : -0.3, -0.4, i % 2 == 0 ? 0.4 : -0.4)
      wrap.add(part3)

      const part3_1 = new THREE.Mesh(this.carGeometry3, this.material);
      part3_1.rotation.y = Math.PI / 2
      part3.add(part3_1)
    }

    const part4 = new THREE.Object3D()
    part4.position.set(0, 0.28, 0.65)
    wrap.add(part4)

    const part4_1 = new THREE.Mesh(this.carGeometry4, this.material2);
    part4_1.scale.x = 0.8
    part4_1.scale.y = 0.5
    part4_1.rotation.x = -Math.PI / 3.4
    part4.add(part4_1)

    for (let i = 0; i < 2; i++) {
      const part5 = new THREE.Object3D()
      part5.position.set(i == 0 ? 0.3 : -0.3, -0.02, 1)
      wrap.add(part5)

      const part5_1 = new THREE.Mesh(this.carGeometry5, this.material2);
      part5_1.rotation.x = -Math.PI / 8
      part5_1.scale.z = 0.7
      part5.add(part5_1)
    }
  }
}