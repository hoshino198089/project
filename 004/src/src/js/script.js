import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { TexturePass } from 'three/addons/postprocessing/TexturePass.js'
import { ClearPass } from 'three/addons/postprocessing/ClearPass.js'
import { MaskPass, ClearMaskPass } from 'three/addons/postprocessing/MaskPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Param } from './param.js'
import { User } from './user.js'
import { Raycaster } from './raycaster.js'
import { Obj } from './obj.js'
import { gsap } from "gsap";

window.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.querySelector('#webgl')
  const app = new ThreeApp(wrapper)
  await app.load()
  app.init()
  app.render()
}, false)

class ThreeApp {
  constructor(wrapper) {
    this.wrapper = wrapper
    this.render = this.render.bind(this)

    this.width = window.innerWidth
    this.height = window.innerHeight

    window.addEventListener('resize', () => { this.resize() })

    this.keys = {}
    window.addEventListener('keydown', (e) => this.keys[e.code] = true)
    window.addEventListener('keyup', (e) => this.keys[e.code] = false)

    this.gateGeo = new THREE.PlaneGeometry(5.0, 8.0)
    this.gateMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    this.viewGeo = new THREE.PlaneGeometry(1, 1)
    this.viewMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    this.floorGeo = new THREE.PlaneGeometry(1, 1)
    this.floorMat = new THREE.MeshBasicMaterial({ color: 0xcccccc })
    this.hoverGeo = new THREE.CircleGeometry(2, 0)
    this.hoverMat = new THREE.MeshBasicMaterial({ color: 0xd9d9d9 })

    this.progressTime = 0
    this.lastFrameTime = performance.now()

    this.inGate = false
    this.selectFoxIndex = null
    this.hoverFoxIndex = 1
    this.cameraMixer = {
      FPS: 1,
      TPS: 0
    }

    this.obj = []
  }
  async load() {
    const loader = new THREE.TextureLoader()
    const texturePaths = ['img/Texture2.png', 'img/Texture3.png', 'img/star1.webp', 'img/star2.webp', 'img/star3.webp']
    const texturePromises = texturePaths.map((path, index) => {
      return new Promise((resolve) => {
        loader.load(path, (texture) => {
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          resolve(texture)
        })
      })
    })
    this.textures = await Promise.all(texturePromises)

    const gltfLoader = new GLTFLoader()
    const gltfPaths = ['model/Fox.glb']
    const gltfPromises = gltfPaths.map((path, index) => {
      return new Promise((resolve) => {
        gltfLoader.load(path, (gltf) => { resolve(gltf) })
      })
    })
    this.gltfs = await Promise.all(gltfPromises)
  }
  init() {
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor(new THREE.Color(Param.RENDERER_PARAM.clearColor))
    this.renderer.setSize(Param.RENDERER_PARAM.width, Param.RENDERER_PARAM.height)
    this.wrapper.appendChild(this.renderer.domElement)

    this.combineScene = new THREE.Scene()
    this.combineCamera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, -1, 1)

    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)

    this.worldA = this.setWorld('worldA')
    this.worldB = this.setWorld('worldB')
    this.worldB.User.changeMat('shadow')

    this.worldSetA = [this.worldA, this.worldB]
    this.worldSetB = [this.worldB, this.worldA]

    this.setMaskRange()
    this.setCombine()

    this.Obj = new Obj(this.obj, this.textures)
    this.Obj.setWorldA(this.worldA.scene)
    this.Obj.setWorldB(this.worldB.scene)

    this.Raycaster = new Raycaster(this.worldA.camera, this.obj)
    this.Raycaster.setClick({
      targets: this.worldA.foxArray,
      onUpdate: (newIndex) => {
        if (this.selectFoxIndex === null) {
          gsap.to('.message', { x: 0, autoAlpha: 1 })
        }
        this.selectFoxIndex = newIndex
      }
    })
    this.Raycaster.setHover({
      targets: this.worldA.foxArray,
      onUpdate: (newIndex) => { if (this.selectFoxIndex === null) { this.hoverFoxIndex = newIndex } }
    })

    this.worldA.User.setRaycaster(this.Raycaster)
    this.worldB.User.setRaycaster(this.Raycaster)

    this.hoverObj = new THREE.Object3D()
    this.worldA.scene.add(this.hoverObj)
    const triangle = new THREE.Mesh(this.hoverGeo, this.hoverMat)
    triangle.rotation.x = -Math.PI / 2
    this.hoverObj.add(triangle)

  }
  setWorld(key) {
    const array = {
      key: key,
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(Param.CAMERA_PARAM.fovy, Param.CAMERA_PARAM.aspect, Param.CAMERA_PARAM.near, Param.CAMERA_PARAM.far),
      directionalLight: new THREE.DirectionalLight(Param.DIRECTIONAL_LIGHT_PARAM.color, Param.DIRECTIONAL_LIGHT_PARAM.intensity),
      ambientLight: new THREE.AmbientLight(Param.AMBIENT_LIGHT_PARAM.color, Param.AMBIENT_LIGHT_PARAM.intensity),
      clearColor: Param.CAMERA_PARAM[key].clearColor,
      User: null,
      user: null,
      gate: new THREE.Mesh(this.gateGeo, this.gateMat.clone()),
      foxArray: [],
      tex: new THREE.FramebufferTexture(this.width, this.height),
      floor: new THREE.Mesh(this.floorGeo, this.floorMat),
    }
    array.camera.position.copy(Param.CAMERA_PARAM.position)
    array.camera.lookAt(Param.CAMERA_PARAM.lookAt)

    array.directionalLight.position.copy(Param.DIRECTIONAL_LIGHT_PARAM.position)
    array.scene.add(array.directionalLight)
    array.scene.add(array.ambientLight)
    // array.scene.add(new THREE.AxesHelper(150))

    array.User = new User(array.scene)
    array.user = array.User.container

    array.gate.position.z = -24
    array.gate.position.y = 4 + 12
    array.gate.rotation.y = key === 'worldA' ? 0 : Math.PI
    array.scene.add(array.gate)

    array.floor.rotation.x = -Math.PI / 2
    array.floor.scale.set(10000, 10000, 10000)
    if (key === 'worldA') {
      array.scene.add(array.floor)
      this.obj.push(array.floor)
    }

    for (let i = 0; i < 3; i++) {
      const fox = clone(this.gltfs[0].scene)
      this.setMixerAndAction(fox, this.gltfs[0].animations)
      array.scene.add(fox)
      fox.position.set(-2.5 + i * 2.5, 0, 22)
      fox.scale.set(0.025, 0.025, 0.025)
      fox.userData.actions[0].weight = 0.2
      fox.userData.mixer.update(i)
      fox.userData.dirVec = new THREE.Vector3(0.0, 0.0, 1.0).normalize()
      fox.userData.delay = 0.1
      fox.children[1].userData.index = i
      array.foxArray.push(fox)

      if (0 < i) {
        this.mergeTex(this.textures[i - 1], fox.children[1].material.map)
        fox.children[1].material = fox.children[1].material.clone()
        fox.children[1].material.map = this.textures[i - 1]
      }
    }

    return array
  }
  render() {
    requestAnimationFrame(this.render)

    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastFrameTime) / 1000
    this.progressTime += deltaTime
    this.lastFrameTime = currentTime

    if (this.selectFoxIndex === null) {
      this.hoverObj.position.copy(this.worldA.foxArray[this.hoverFoxIndex].position)
      this.hoverObj.rotation.y -= deltaTime
    } else {
      this.hoverObj.visible = false
    }

    if (this.cameraMixer.FPS !== 0 && this.selectFoxIndex !== null) {
      this.cameraMixer.FPS = Math.max(0, this.cameraMixer.FPS - deltaTime)
    }

    const worldIndex = !this.inGate ? 0 : 1
    let worlds = !this.inGate ? this.worldSetA : this.worldSetB
    const distToGate = this.worldA.gate.position.distanceTo(this.worldA.user.position)
    // console.log(distToGate)
    // const distToOrigin = this.worldA.user.position.length()
    const cameraRatio = Math.min(1, 0.2 + distToGate / 30)
    const sin = Math.sin(this.worldA.user.rotation.y)
    const cos = Math.cos(this.worldA.user.rotation.y)

    const newCameraPos = this.worldA.user.position.clone().add(new THREE.Vector3(sin * 1, 2.5, cos * 1).lerp(new THREE.Vector3(sin * -10, 5, cos * -10), cameraRatio))
    const newCameraLookAt = this.worldA.user.position.clone().add(new THREE.Vector3(sin * 5, 2, cos * 5).lerp(new THREE.Vector3(0, 2, 0), cameraRatio))

    worlds.forEach((world) => {
      world.User.initMotion()

      if (this.cameraMixer.FPS === 0) {
        world.User.move(this.progressTime * 10, deltaTime * (cameraRatio * 7 + 1), this.keys)
        world.camera.position.copy(newCameraPos)
        world.camera.lookAt(newCameraLookAt)
      } else {
        world.camera.position.copy(newCameraPos.lerp(new THREE.Vector3(0.0, 3, 28), this.cameraMixer.FPS))
        world.camera.lookAt(newCameraLookAt.lerp(new THREE.Vector3(0, 0, 20), this.cameraMixer.FPS))
      }

      world.foxArray.forEach((fox, index) => {
        fox.userData.mixer.update(deltaTime / 2)
        let animationSpeed = deltaTime / 2

        let targetPos = 12 <= world.user.position.y ? new THREE.Vector3(0, 12, -39) : world.user.position
        let dirScalar = 12 <= world.user.position.y ? 0.8 : 0.1
        let speedScalar = 12 <= world.user.position.y ? 0.4 : 0.16

        if (index === this.selectFoxIndex) {
          fox.userData.delay -= deltaTime
          if (fox.position.distanceTo(targetPos) > 3) {
            if (fox.userData.delay < 0) {
              const prevPos = fox.position.clone()
              const prevDirVec = fox.userData.dirVec.clone()
              const subVec = new THREE.Vector3().subVectors(targetPos, fox.position).normalize()
              fox.userData.dirVec.add(subVec.multiplyScalar(dirScalar))
              fox.userData.dirVec.normalize()
              const dirVec = fox.userData.dirVec.clone()
              fox.position.add(dirVec.multiplyScalar(speedScalar))

              // const normalAxis = new THREE.Vector3().crossVectors(prevDirVec, fox.userData.dirVec)
              // normalAxis.normalize()

              // const cos2 = Math.min(1, Math.max(prevDirVec.dot(fox.userData.dirVec), -1))
              // const radians = Math.acos(cos2)
              // const qtn = new THREE.Quaternion().setFromAxisAngle(normalAxis, radians)
              // fox.quaternion.premultiply(qtn)
              fox.rotation.y = Math.atan2(fox.position.x - prevPos.x, fox.position.z - prevPos.z)

              animationSpeed = deltaTime * 2
              if (fox.userData.actions[0].weight === 0.2) {
                fox.userData.actions[0].weight = 0
                fox.userData.actions[2].weight = 1
              }
            }
          } else {
            fox.userData.delay = 0.2
            if (fox.userData.actions[0].weight === 0) {
              fox.userData.actions[0].weight = 0.2
              fox.userData.actions[2].weight = 0
            }
          }
        } else {
          fox.userData.delay = 0.2
          if (fox.userData.actions[0].weight === 0) {
            fox.userData.actions[0].weight = 0.2
            fox.userData.actions[2].weight = 0
          }
        }
        fox.userData.mixer.update(animationSpeed)
      })
    })

    this.maskCamera.position.copy(this.worldA.camera.position)
    this.maskCamera.lookAt(this.worldA.user.position.clone().add(new THREE.Vector3(sin * 5, 2, cos * 5).lerp(new THREE.Vector3(0, 2, 0), cameraRatio)))

    const y = this.Raycaster.getUserFoot(this.worldB.user.position.clone())
    this.worldA.user.position.y = y
    this.worldB.user.position.y = y

    if (this.inGate) {
      if (this.worldA.gate.position.z - this.worldB.user.position.z < 0 && distToGate < 5) {
        this.inGate = false
        worlds.forEach((world, index) => {
          world.User.changeMat(index === worldIndex ? 'body' : 'shadow')
        })
      }
    } else {
      if (this.worldA.gate.position.z - this.worldA.user.position.z > 0 && distToGate < 5) {
        this.inGate = true
        worlds.forEach((world, index) => {
          world.User.changeMat(index === worldIndex ? 'shadow' : 'body')
        })
      }
    }

    worlds = !this.inGate ? this.worldSetA : this.worldSetB
    this.combineDraw(worlds, deltaTime)
  }
  setMixerAndAction(gltf, animations) {
    const mixer = new THREE.AnimationMixer(gltf)
    gltf.userData.actions = []
    for (let i = 0; i < animations.length; ++i) {
      gltf.userData.actions.push(mixer.clipAction(animations[i]))
      gltf.userData.actions[i].setLoop(THREE.LoopRepeat)
      gltf.userData.actions[i].play()
      gltf.userData.actions[i].weight = i === 0 ? 1 : 0
    }
    gltf.userData.mixer = mixer
  }
  mergeTex(texA, texB) {
    texA.repeat.copy(texB.repeat)
    texA.offset.copy(texB.offset)
    texA.rotation = texB.rotation
    texA.center.copy(texB.center)
    texA.wrapS = texB.wrapS
    texA.wrapT = texB.wrapT
    texA.flipY = texB.flipY
    texA.colorSpace = THREE.SRGBColorSpace
  }
  setMaskRange() {
    this.scene = new THREE.Scene()

    const plane = new THREE.Mesh(this.gateGeo, this.gateMat)
    plane.position.z = -24
    plane.position.y = 4 + 12
    this.scene.add(plane)

    const plane2 = new THREE.Mesh(this.gateGeo, this.gateMat)
    plane2.position.z = -24
    plane2.position.y = 4 + 12
    plane2.rotation.y = Math.PI
    this.scene.add(plane2)

    this.maskCamera = new THREE.PerspectiveCamera(Param.CAMERA_PARAM.fovy, Param.CAMERA_PARAM.aspect, Param.CAMERA_PARAM.near, Param.CAMERA_PARAM.far)
    this.maskCamera.position.copy(Param.CAMERA_PARAM.position)
    this.maskCamera.lookAt(Param.CAMERA_PARAM.lookAt)

    const clearPass = new ClearPass()
    const clearMaskPass = new ClearMaskPass()
    const maskPass = new MaskPass(this.scene, this.maskCamera)
    this.texturePass = new TexturePass(null)
    const outputPass = new OutputPass()

    this.fxRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height, { stencilBuffer: true })

    this.composer = new EffectComposer(this.renderer, this.fxRenderTarget)
    this.composer.setSize(this.width, this.height)
    this.composer.addPass(clearPass)
    this.composer.addPass(maskPass)
    this.composer.addPass(this.texturePass)
    this.composer.addPass(clearMaskPass)
    this.composer.addPass(outputPass)
  }
  setCombine() {
    this.currentWorld = new THREE.Mesh(this.viewGeo, this.viewMat.clone())
    this.currentWorld.scale.set(this.width, this.height, 1)
    this.combineScene.add(this.currentWorld)

    this.anotherWorld = new THREE.Mesh(this.viewGeo, this.viewMat.clone())
    this.anotherWorld.scale.set(this.width, this.height, 1)
    this.anotherWorld.material.blending = THREE.AdditiveBlending
    this.combineScene.add(this.anotherWorld)
  }
  combineDraw(worlds, deltaTime) {
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(worlds[1].clearColor, 1.0)
    this.renderer.render(worlds[1].scene, worlds[1].camera)
    this.renderer.copyFramebufferToTexture(worlds[1].tex, new THREE.Vector2(0, 0))
    this.texturePass.map = worlds[1].tex

    this.renderer.setClearColor(worlds[0].clearColor, 1.0)
    this.renderer.render(worlds[0].scene, worlds[0].camera)
    this.renderer.copyFramebufferToTexture(worlds[0].tex, new THREE.Vector2(0, 0))
    this.currentWorld.material.map = worlds[0].tex

    this.renderer.setRenderTarget(null)
    this.renderer.setSize(this.width, this.height)

    this.renderer.setClearColor(new THREE.Color(0x000000))
    this.composer.render(deltaTime)
    this.anotherWorld.material.map = this.composer.readBuffer.texture

    this.renderer.render(this.combineScene, this.combineCamera)
  }
  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight

    this.worldSetA.forEach((world) => {
      world.camera.aspect = this.width / this.height
      world.camera.updateProjectionMatrix()
      world.tex.dispose()
      world.tex = new THREE.FramebufferTexture(this.width, this.height)
    })
    this.maskCamera.aspect = this.width / this.height
    this.maskCamera.updateProjectionMatrix()

    this.combineCamera.left = -this.width / 2
    this.combineCamera.right = this.width / 2
    this.combineCamera.top = this.height / 2
    this.combineCamera.bottom = -this.height / 2
    this.combineCamera.updateProjectionMatrix()

    this.renderer.setSize(this.width, this.height)
    this.renderTarget.setSize(this.width, this.height)
    this.fxRenderTarget.setSize(this.width, this.height)
    this.composer.setSize(this.width, this.height)

    this.anotherWorld.scale.set(this.width, this.height, 1)
    this.currentWorld.scale.set(this.width, this.height, 1)
  }
}