import * as THREE from './lib/three.module.js';
import { Param } from './param.js';

export class User {
  constructor(scene, parachuteTex) {
    this.scene = scene

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    this.bagMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
    })
    this.parachuteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    this.parachuteMaterial.map = parachuteTex

    const sphereGeometry = new THREE.SphereGeometry(10)
    const cylinderGeometry = new THREE.CylinderGeometry(5, 5, 10, 32)
    this.parachuteGeometry = new THREE.SphereGeometry(4, 32, 16)
    this.parachuteGeometry2 = new THREE.BoxGeometry(0.02, 10, 0.02)
    this.bagGeometry = new THREE.CylinderGeometry(12, 11, 22, 4)
    this.bagGeometry2 = new THREE.TorusGeometry(10, 1, 16, 20)

    const parachuteGeometryPos = this.parachuteGeometry.attributes.position
    const parachuteGeometryArray = parachuteGeometryPos.array
    for (let i = 0; i < parachuteGeometryArray.length / 3; i++) {
      if (parachuteGeometryArray[i * 3 + 1] < 0) {
        let p = parachuteGeometryArray[i * 3 + 1] / 4
        parachuteGeometryArray[i * 3 + 1] *= -p * p
        parachuteGeometryArray[i * 3 + 1] -= 0.1
      }
      parachuteGeometryArray[i * 3 + 1] += (1 - parachuteGeometryArray[i * 3 + 1] / 4) * Math.sin(10 * (Math.PI / 18 + Math.atan2(parachuteGeometryArray[i * 3], parachuteGeometryArray[i * 3 + 2]))) * 0.25
    }
    parachuteGeometryPos.needsUpdate = true

    this.container = new THREE.Object3D();
    this.container.position.copy(Param.USER_PARAM.initPos)
    this.container.scale.set(Param.USER_PARAM.scale, Param.USER_PARAM.scale, Param.USER_PARAM.scale)
    this.scene.add(this.container)

    this.fullBody = new THREE.Object3D();
    this.fullBody.position.baseY = 34.5
    this.fullBody.position.y = this.fullBody.position.baseY
    this.fullBody.rotation.set(Math.PI / 2, 0, Math.PI / 2)
    this.container.add(this.fullBody);

    const top = new THREE.Object3D();

    this.head = new THREE.Mesh(sphereGeometry, bodyMaterial);
    this.head.position.z = -20
    this.head.scale.set(1.1, 1.1, 1.1)

    const body = new THREE.Mesh(sphereGeometry, bodyMaterial);
    body.scale.set(0.9, 1, 1.1)

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

      const part0 = new THREE.Mesh(sphereGeometry, bodyMaterial);
      part0.position.set(0, 6 * sign, 5)
      part0.scale.set(0.5, 0.5, 0.5)
      top.add(part0);

      const hipJoint = new THREE.Object3D();
      bottom.add(hipJoint);
      this.joint.hip.push(hipJoint)

      const hipJoint2 = new THREE.Object3D();
      hipJoint.add(hipJoint2);
      this.joint.hip2.push(hipJoint2)

      const part1 = new THREE.Object3D();
      part1.position.set(0, 6 * sign, 15)
      hipJoint2.add(part1);

      const part1_1 = new THREE.Mesh(cylinderGeometry, bodyMaterial);
      part1_1.position.z = -7.5
      part1_1.scale.y = 1.5
      part1_1.rotation.x = Math.PI / 2

      const part1_2 = new THREE.Mesh(sphereGeometry, bodyMaterial);
      part1_2.position.z = 0
      part1_2.scale.set(0.5, 0.5, 0.5)
      part1.add(part1_1, part1_2);

      const part2 = new THREE.Object3D();
      part1.add(part2);
      this.joint.knee.push(part2)

      const part2_1 = new THREE.Mesh(cylinderGeometry, bodyMaterial);
      part2_1.position.z = 5
      part2_1.scale.y = 1
      part2_1.rotation.x = Math.PI / 2

      const part2_2 = new THREE.Mesh(sphereGeometry, bodyMaterial);
      part2_2.position.z = 10
      part2_2.scale.set(0.5, 0.5, 0.5)
      part2.add(part2_1, part2_2);

      const shoulderJoint = new THREE.Object3D();
      shoulderJoint.position.y = 17 * sign
      shoulder.add(shoulderJoint);
      this.joint.shoulder.push(shoulderJoint)

      const part3 = new THREE.Object3D();
      part3.rotation.x = -Math.PI / 5.5 * sign
      shoulderJoint.add(part3);

      const part4 = new THREE.Mesh(sphereGeometry, bodyMaterial);
      part4.scale.set(0.5, 0.5, 0.5)

      const part5 = new THREE.Object3D();
      part5.position.z = 15
      part3.add(part4, part5);

      const part5_1 = new THREE.Mesh(cylinderGeometry, bodyMaterial);
      part5_1.position.z = -7.5
      part5_1.scale.y = 1.5
      part5_1.rotation.x = Math.PI / 2

      const part5_2 = new THREE.Mesh(sphereGeometry, bodyMaterial);
      part5_2.position.z = 0
      part5_2.scale.set(0.5, 0.5, 0.5)
      part5.add(part5_1, part5_2);

      const part6 = new THREE.Object3D();
      part5.add(part6);
      this.joint.elbow.push(part6)

      const part7 = new THREE.Object3D();
      part7.rotation.baseX = Math.PI / 5 * sign
      part7.rotation.x = part7.rotation.baseX
      part6.add(part7);
      this.joint.elbow2.push(part7)

      const part7_1 = new THREE.Mesh(cylinderGeometry, bodyMaterial);
      part7_1.position.z = 5
      part7_1.scale.y = 1
      part7_1.rotation.x = Math.PI / 2

      const part7_2 = new THREE.Mesh(sphereGeometry, bodyMaterial);
      part7_2.position.z = 10
      part7_2.scale.set(0.5, 0.5, 0.5)
      part7.add(part7_1, part7_2);
    }

    this.worldPosition = new THREE.Vector3()
    this.rot = 0
  }
  createParachute() {
    this.parachute = new THREE.Object3D()
    this.parachute.scale.set(0, 0, 0)
    this.scene.add(this.parachute)
    this.part1 = new THREE.Mesh(this.parachuteGeometry, this.parachuteMaterial)
    this.part1.position.y = 9
    this.part1.scale.y = 0.9
    this.parachute.add(this.part1)

    for (let i = 0; i < 10; i++) {
      const paracord = new THREE.Object3D()
      paracord.rotation.y = Math.PI * 2 / 10 * i + Math.PI / 9
      this.parachute.add(paracord)
      const inr = new THREE.Object3D()
      inr.rotation.x = Math.PI / 8
      paracord.add(inr)
      const part5 = new THREE.Mesh(this.parachuteGeometry2, this.bagMaterial)
      part5.position.y = 5
      inr.add(part5)
    }

    this.bag = new THREE.Object3D()
    this.bag.position.z = -13
    this.bag.scale.z = 0.5
    this.bag.rotation.x = Math.PI / 36
    this.container.add(this.bag)
    this.part2 = new THREE.Mesh(this.bagGeometry, this.bagMaterial)
    this.part2.position.y = 33
    this.part2.rotation.y = Math.PI / 4
    this.bag.add(this.part2)

    this.bagInr = new THREE.Object3D()
    this.bag.add(this.bagInr)
    this.bagInr.position.x = 16.5
    this.bagInr.position.z = 17//13
    this.bagInr.rotation.z = Math.PI / 15

    this.part3 = new THREE.Mesh(this.bagGeometry2, this.bagMaterial)
    this.part3.position.y = 40.5
    this.part3.rotation.y = Math.PI / 1.9
    this.part3.scale.x = 1.2
    this.part3.scale.y = 0.5
    this.bagInr.add(this.part3)

    this.bagInr2 = new THREE.Object3D()
    this.bag.add(this.bagInr2)
    this.bagInr2.position.x = -16.5
    this.bagInr2.position.z = 17//13
    this.bagInr2.rotation.z = -Math.PI / 15

    this.part4 = new THREE.Mesh(this.bagGeometry2, this.bagMaterial)
    this.part4.position.y = 40.5
    this.part4.rotation.y = -Math.PI / 1.9
    this.part4.scale.x = 1.2
    this.part4.scale.y = 0.5
    this.bagInr2.add(this.part4)

  }
  parachutePosAjust(parachuteScale, parachuteRise, faceDown) {
    this.parachute.scale.set(parachuteScale, parachuteScale, parachuteScale)
    this.container.rotation.x = faceDown * Math.PI / 2
    this.fullBody.getWorldPosition(this.worldPosition)
    this.container.position.y = Param.USER_PARAM.initPos.y + parachuteRise + faceDown * 5
    this.container.position.z = Param.USER_PARAM.initPos.z + faceDown * -5
    this.parachute.position.z = -1.6 + faceDown * 1.6
    this.parachute.position.y = 3.8 + faceDown * 0.4 + parachuteRise
  }
  initMotion() {
    this.head.position.x = 0
    this.head.position.y = 0
    this.fullBody.rotation.x = Math.PI / 2

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
  enjoyMotion(progressTime, strength) {
    this.head.position.y += -2 * Math.abs(Math.sin(progressTime * 2)) * Math.sign(Math.sin(progressTime * 2)) * strength
    this.fullBody.rotation.x += Math.PI / 36 * strength

    for (let i = 0; i < 2; i++) {
      const sign = i == 0 ? -1 : 1
      const progress = (progressTime + Param.ENJOY_PARAM.frame / 2 * i) % Param.ENJOY_PARAM.frame
      let index = Math.floor(progress)
      let nextIndex = (index + 1) % Param.ENJOY_PARAM.frame
      let nP = (progress - index) ** 2//Calc.ease(progress - index)
      let nDP = 1 - nP

      this.joint.shoulder[i].rotation.y += (Param.ENJOY_PARAM.shoulder[index] * nDP + Param.ENJOY_PARAM.shoulder[nextIndex] * nP) * strength
      this.joint.elbow[i].rotation.y += (Param.ENJOY_PARAM.elbow[index] * nDP + Param.ENJOY_PARAM.elbow[nextIndex] * nP) * strength
      this.joint.elbow2[i].rotation.x += -(Param.ENJOY_PARAM.elbow2[index] * nDP + Param.ENJOY_PARAM.elbow2[nextIndex] * nP) * sign * strength
      this.joint.hip2[i].rotation.x += -Math.PI / 20 * sign * strength
      this.joint.hip[i].rotation.y += (Param.ENJOY_PARAM.hip[index] * nDP + Param.ENJOY_PARAM.hip[nextIndex] * nP) * strength
      this.joint.knee[i].rotation.y += (Param.ENJOY_PARAM.knee[index] * nDP + Param.ENJOY_PARAM.knee[nextIndex] * nP) * strength
    }
  }
  omgMotion(progressTime, strength) {
    this.head.position.x += 0.3 * Math.abs(Math.sin(progressTime * 3)) * Math.sign(Math.sin(progressTime * 3)) * strength
    for (let i = 0; i < 2; i++) {
      const sign = i == 0 ? -1 : 1
      const progress = (progressTime + Param.FLY_PARAM.frame / 2 * i) % Param.FLY_PARAM.frame
      let index = Math.floor(progress)
      let nextIndex = (index + 1) % Param.FLY_PARAM.frame
      let nP = progress - index
      let nDP = 1 - nP

      this.joint.shoulder[i].rotation.x += Math.PI / 2 * -sign * strength
      this.joint.shoulder[i].rotation.y += (Param.FLY_PARAM.shoulder[index] * nDP + Param.FLY_PARAM.shoulder[nextIndex] * nP) * strength
      this.joint.elbow[i].rotation.y += (Param.FLY_PARAM.elbow[index] * nDP + Param.FLY_PARAM.elbow[nextIndex] * nP) * strength
      this.joint.elbow2[i].rotation.x += -(Param.FLY_PARAM.elbow2[index] * nDP + Param.FLY_PARAM.elbow2[nextIndex] * nP) * sign * strength
      this.joint.hip[i].rotation.y += (Param.FLY_PARAM.hip[index] * nDP + Param.FLY_PARAM.hip[nextIndex] * nP) * strength
      this.joint.knee[i].rotation.y += (Param.FLY_PARAM.knee[index] * nDP + Param.FLY_PARAM.knee[nextIndex] * nP) * strength
    }
  }
  posPush() {
    this.fullBody.getWorldPosition(this.worldPosition)
    return this.worldPosition
  }
}