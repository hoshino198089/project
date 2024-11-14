import * as THREE from 'three';
import { Param } from './param.js';

export class User {
  constructor(scene) {
    this.scene = scene
    this.Raycaster = null

    this.mats = {
      body: new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }),
      shadow: new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
    }

    const sphereGeometry = new THREE.SphereGeometry(10)
    const cylinderGeometry = new THREE.CylinderGeometry(5, 5, 10, 32)

    this.meshArray = []

    this.container = new THREE.Object3D();
    this.container.position.copy(Param.USER_PARAM.initPos)
    this.container.rotation.y = Math.PI
    this.container.scale.set(Param.USER_PARAM.scale, Param.USER_PARAM.scale, Param.USER_PARAM.scale)
    this.scene.add(this.container)

    this.fullBody = new THREE.Object3D();
    this.fullBody.position.baseY = 34.5
    this.fullBody.position.y = this.fullBody.position.baseY
    this.fullBody.rotation.set(Math.PI / 2, 0, Math.PI / 2)
    this.container.add(this.fullBody);

    const top = new THREE.Object3D();

    this.head = new THREE.Mesh(sphereGeometry, this.mats.body);
    this.head.position.z = -20
    this.head.scale.set(1.1, 1.1, 1.1)
    this.meshArray.push(this.head)

    const body = new THREE.Mesh(sphereGeometry, this.mats.body);
    body.scale.set(0.9, 1, 1.1)
    this.meshArray.push(body)

    const shoulder = new THREE.Object3D();
    shoulder.position.z = -5
    shoulder.scale.set(0.5, 0.5, 0.65)
    top.add(this.head, body, shoulder);

    const bottom = new THREE.Object3D();
    bottom.position.z = 5
    this.fullBody.add(top, bottom);

    this.joint = {
      shoulder: [],
      elbow: [],
      elbow2: [],
      hip: [],
      hip2: [],
      knee: []
    }

    for (let i = 0; i < 2; i++) {
      const sign = i == 0 ? -1 : 1

      const part0 = new THREE.Mesh(sphereGeometry, this.mats.body);
      part0.position.set(0, 6 * sign, 5)
      part0.scale.set(0.5, 0.5, 0.5)
      top.add(part0);
      this.meshArray.push(part0)

      const hipJoint = new THREE.Object3D();
      bottom.add(hipJoint);
      this.joint.hip.push(hipJoint)

      const hipJoint2 = new THREE.Object3D();
      hipJoint.add(hipJoint2);
      this.joint.hip2.push(hipJoint2)

      const part1 = new THREE.Object3D();
      part1.position.set(0, 6 * sign, 15)
      hipJoint2.add(part1);

      const part1_1 = new THREE.Mesh(cylinderGeometry, this.mats.body);
      part1_1.position.z = -7.5
      part1_1.scale.y = 1.5
      part1_1.rotation.x = Math.PI / 2
      this.meshArray.push(part1_1)

      const part1_2 = new THREE.Mesh(sphereGeometry, this.mats.body);
      part1_2.position.z = 0
      part1_2.scale.set(0.5, 0.5, 0.5)
      part1.add(part1_1, part1_2)
      this.meshArray.push(part1_2)

      const part2 = new THREE.Object3D();
      part1.add(part2);
      this.joint.knee.push(part2)

      const part2_1 = new THREE.Mesh(cylinderGeometry, this.mats.body);
      part2_1.position.z = 5
      part2_1.scale.y = 1
      part2_1.rotation.x = Math.PI / 2
      this.meshArray.push(part2_1)

      const part2_2 = new THREE.Mesh(sphereGeometry, this.mats.body);
      part2_2.position.z = 10
      part2_2.scale.set(0.5, 0.5, 0.5)
      part2.add(part2_1, part2_2);
      this.meshArray.push(part2_2)

      const shoulderJoint = new THREE.Object3D();
      shoulderJoint.position.y = 17 * sign
      shoulder.add(shoulderJoint);
      this.joint.shoulder.push(shoulderJoint)

      const part3 = new THREE.Object3D();
      part3.rotation.x = -Math.PI / 5.5 * sign
      shoulderJoint.add(part3);

      const part4 = new THREE.Mesh(sphereGeometry, this.mats.body);
      part4.scale.set(0.5, 0.5, 0.5)
      this.meshArray.push(part4)

      const part5 = new THREE.Object3D();
      part5.position.z = 15
      part3.add(part4, part5);

      const part5_1 = new THREE.Mesh(cylinderGeometry, this.mats.body);
      part5_1.position.z = -7.5
      part5_1.scale.y = 1.5
      part5_1.rotation.x = Math.PI / 2
      this.meshArray.push(part5_1)

      const part5_2 = new THREE.Mesh(sphereGeometry, this.mats.body);
      part5_2.position.z = 0
      part5_2.scale.set(0.5, 0.5, 0.5)
      part5.add(part5_1, part5_2);
      this.meshArray.push(part5_2)

      const part6 = new THREE.Object3D();
      part5.add(part6);
      this.joint.elbow.push(part6)

      const part7 = new THREE.Object3D();
      part7.rotation.baseX = Math.PI / 5 * sign
      part7.rotation.x = part7.rotation.baseX
      part6.add(part7);
      this.joint.elbow2.push(part7)

      const part7_1 = new THREE.Mesh(cylinderGeometry, this.mats.body);
      part7_1.position.z = 5
      part7_1.scale.y = 1
      part7_1.rotation.x = Math.PI / 2
      this.meshArray.push(part7_1)

      const part7_2 = new THREE.Mesh(sphereGeometry, this.mats.body);
      part7_2.position.z = 10
      part7_2.scale.set(0.5, 0.5, 0.5)
      part7.add(part7_1, part7_2)
      this.meshArray.push(part7_2)
    }

    this.worldPosition = new THREE.Vector3()
    this.rot = 0

    this.accumulateRunStrength = 0
  }
  setRaycaster(Raycaster) {
    this.Raycaster = Raycaster
  }
  move(progressTime, frameTime, keys) {
    if (keys["KeyW"] || keys["KeyS"]) {
      const x = Math.sin(this.container.rotation.y) * frameTime * 2 * this.accumulateRunStrength
      const z = Math.cos(this.container.rotation.y) * frameTime * 2 * this.accumulateRunStrength
      if (keys["KeyW"]) {
        const userPos = this.container.position.clone()
        userPos.x += x
        userPos.z += z
        const y = this.Raycaster.getUserFoot(userPos)
        if (Math.abs(y - this.container.position.y) < 0.1) {
          this.container.position.copy(userPos)
        }
      }
      if (keys["KeyS"]) {
        const userPos = this.container.position.clone()
        userPos.x -= x * 0.45
        userPos.z -= z * 0.45
        const y = this.Raycaster.getUserFoot(userPos)
        if (Math.abs(y - this.container.position.y) < 0.1) {
          this.container.position.copy(userPos)
        }
      }

      if (keys["KeyW"] && keys["KeyS"]) {
        this.accumulateRunStrength -= frameTime / 1
      } else {
        this.accumulateRunStrength += frameTime / 5
      }
    }

    if (keys["KeyA"]) {
      this.container.rotation.y += frameTime / 5
      if (!keys["KeyW"] && !keys["KeyS"]) {
        this.accumulateRunStrength = 0.2
      }
    }
    if (keys["KeyD"]) {
      this.container.rotation.y += -frameTime / 5
      if (!keys["KeyW"] && !keys["KeyS"]) {
        this.accumulateRunStrength = 0.2
      }
    }

    if (!keys["KeyW"] && !keys["KeyS"] && !keys["KeyA"] && !keys["KeyD"]) {
      this.accumulateRunStrength -= frameTime / 1
    }

    if (!keys["KeyW"] && keys["KeyS"]) {
      this.accumulateRunStrength = Math.min(0.5, Math.max(0, this.accumulateRunStrength))
    } else {
      this.accumulateRunStrength = Math.min(1, Math.max(0, this.accumulateRunStrength))
    }
    this.runMotion(progressTime, this.accumulateRunStrength, keys);
  }
  initMotion() {
    this.head.position.x = 0
    this.head.position.y = 0
    this.fullBody.rotation.x = Math.PI / 2
    this.fullBody.position.y = this.fullBody.position.baseY

    for (let i = 0; i < 2; i++) {
      this.joint.shoulder[i].rotation.x = 0
      this.joint.shoulder[i].rotation.y = 0
      this.joint.elbow[i].rotation.y = 0
      this.joint.elbow2[i].rotation.x = this.joint.elbow2[i].rotation.baseX
      this.joint.hip2[i].rotation.x = 0
      this.joint.hip[i].rotation.y = 0
      this.joint.knee[i].rotation.y = 0
    }
  }
  ease(x) {
    return x * x * x
  }
  runMotion(progressTime, strength, keys) {
    for (let i = 0; i < 2; i++) {
      const speedStrength = !keys["KeyW"] && keys["KeyS"] || !keys["KeyW"] && !keys["KeyS"] && keys["KeyA"] || !keys["KeyW"] && !keys["KeyS"] && keys["KeyD"] ? 1 : 1.5
      const sign = i == 0 ? -1 : 1
      const progress = (progressTime * speedStrength + Param.RUN_PARAM.frame / 2 * i) % Param.RUN_PARAM.frame
      let index = Math.floor(progress)
      let nextIndex = (index + 1) % Param.RUN_PARAM.frame
      let nP = this.ease(progress - index)
      let nDP = 1 - nP

      if (!keys["KeyW"] && keys["KeyS"]) {
        index = 5 - index
        nextIndex = 5 - nextIndex
      }

      if (i == 0) {
        this.fullBody.position.y += (Param.RUN_PARAM.fullBody[index] * nDP + Param.RUN_PARAM.fullBody[nextIndex] * nP) * strength
      }
      this.joint.shoulder[i].rotation.y += (Param.RUN_PARAM.shoulder[index] * nDP + Param.RUN_PARAM.shoulder[nextIndex] * nP) * strength
      this.joint.elbow[i].rotation.y += (Param.RUN_PARAM.elbow[index] * nDP + Param.RUN_PARAM.elbow[nextIndex] * nP) * strength
      this.joint.elbow2[i].rotation.x += -(Param.RUN_PARAM.elbow2[index] * nDP + Param.RUN_PARAM.elbow2[nextIndex] * nP) * sign * strength
      this.joint.hip[i].rotation.y += (Param.RUN_PARAM.hip[index] * nDP + Param.RUN_PARAM.hip[nextIndex] * nP) * strength
      this.joint.knee[i].rotation.y += (Param.RUN_PARAM.knee[index] * nDP + Param.RUN_PARAM.knee[nextIndex] * nP) * strength
    }
  }
  posPush() {
    this.fullBody.getWorldPosition(this.worldPosition)
    return this.worldPosition
  }
  changeMat(key) {
    this.meshArray.forEach((mesh) => { mesh.material = this.mats[key] })
  }
}