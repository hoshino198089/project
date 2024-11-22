import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { User } from './user.js';
import { Car } from './car.js';
import { Obj } from './obj.js';
import { Plane } from './plane.js';
import { Param } from './param.js';
import { gsap } from "gsap";

window.addEventListener('DOMContentLoaded', async () => {
  const wrapper = document.querySelector('#webgl');
  const app = new ThreeApp(wrapper);
  await app.load();
  app.init();
  app.render();
}, false);

class ThreeApp {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.render = this.render.bind(this);

    this.objMaterial_array = {
      ground: new THREE.MeshStandardMaterial({
        color: 0x555555,
        side: THREE.DoubleSide,
      }),
      road: new THREE.MeshStandardMaterial({
        color: 0xbbbbbb,
        side: THREE.DoubleSide,
      }),
      roadLine: new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        side: THREE.DoubleSide,
      })
    }

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }
  async load() {
    const loader = new THREE.TextureLoader();
    const texturePaths = ['img/pavement.webp', 'img/asphalt.webp', 'img/sample.jpg', 'img/concrete.webp'];
    const texturePromises = texturePaths.map((path, index) => {
      return new Promise((resolve) => {
        loader.load(path, (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          if (index == 0) {
            texture.repeat.set(5, 5);
          } else if (index == 1) {
            texture.repeat.set(3, 3);
          } else if (index == 2) {
            texture.repeat.set(5, 5);
          }
          resolve(texture);
        });
      });
    });

    this.textures = await Promise.all(texturePromises);
    this.objMaterial_array.ground.map = this.textures[0];
    this.objMaterial_array.road.map = this.textures[1];
    this.objMaterial_array.roadLine.map = this.textures[1];
  }
  init() {
    // レンダラー
    const color = new THREE.Color(Param.RENDERER_PARAM.clearColor)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor(color)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(Param.RENDERER_PARAM.width, Param.RENDERER_PARAM.height)
    this.wrapper.appendChild(this.renderer.domElement)

    // シーン
    this.scene = new THREE.Scene()

    // カメラ
    this.camera = new THREE.PerspectiveCamera(Param.CAMERA_PARAM.fovy, Param.CAMERA_PARAM.aspect, Param.CAMERA_PARAM.near, Param.CAMERA_PARAM.far)
    this.camera.position.copy(Param.CAMERA_PARAM.position)
    this.camera.lookAt(Param.CAMERA_PARAM.lookAt)

    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(Param.DIRECTIONAL_LIGHT_PARAM.color, Param.DIRECTIONAL_LIGHT_PARAM.intensity)
    this.directionalLight.position.copy(Param.DIRECTIONAL_LIGHT_PARAM.position)
    this.scene.add(this.directionalLight)

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(Param.AMBIENT_LIGHT_PARAM.color, Param.AMBIENT_LIGHT_PARAM.intensity)
    this.scene.add(this.ambientLight)

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // 回転用のグループ
    this.planet = new THREE.Object3D()
    this.scene.add(this.planet)
    this.planetInr = new THREE.Object3D()
    this.planetInr.position.y = 14
    this.planetInr.scale.set(0.5, 0.5, 0.5)
    this.planet.add(this.planetInr)

    // 道路
    this.Obj = new Obj(this.scene, this.objMaterial_array, this.textures[3])
    for (let i = 0; i < 2; i++) {
      this.Obj.create(new THREE.Euler(Math.PI * i, 0.0, 0.0), 'ground')
      this.Obj.create(new THREE.Euler(Math.PI * i, Math.PI / 2, 0.0), 'ground')
      this.Obj.create(new THREE.Euler(Math.PI * i, Math.PI, 0.0), 'ground')
      this.Obj.create(new THREE.Euler(Math.PI * i, Math.PI / 2 * 3, 0.0), 'ground')
    }
    this.Obj.create(new THREE.Euler(0.0, 0.0, 0.0), 'road')
    this.Obj.create(new THREE.Euler(0.0, Math.PI / 2, 0.0), 'road')
    this.Obj.create(new THREE.Euler(0.0, 0.0, Math.PI / 2), 'road')
    for (let i = 0; i < 4; i++) {
      this.Obj.create(new THREE.Euler(0.0, Math.PI / 2 * i, 0.0), 'roadLine')
      this.Obj.create(new THREE.Euler(Math.PI / 2, Math.PI / 2 * i, 0.0), 'roadLine')
      this.Obj.create(new THREE.Euler(Math.PI / 2 * i, 0.0, Math.PI / 2), 'roadLine')
    }

    // 信号
    this.Obj.create(new THREE.Euler(0.0, 0, 0.0), 'signal')
    this.Obj.create(new THREE.Euler(Math.PI / 2, 0, 0), 'signal')
    this.Obj.create(new THREE.Euler(Math.PI / 2 * 2, 0, 0), 'signal')
    this.Obj.create(new THREE.Euler(Math.PI / 2 * 3, 0, 0), 'signal')
    this.Obj.create(new THREE.Euler(0, Math.PI / 2 * 1, Math.PI / 2), 'signal')
    this.Obj.create(new THREE.Euler(0, Math.PI / 2 * 2, Math.PI / 2), 'signal')
    this.Obj.create(new THREE.Euler(0, Math.PI / 2 * 3, Math.PI / 2), 'signal')
    this.Obj.create(new THREE.Euler(0, 0, Math.PI / 2), 'signal')
    this.Obj.create(new THREE.Euler(Math.PI / 2, Math.PI / 2 * 2, Math.PI / 2), 'signal')
    this.Obj.create(new THREE.Euler(Math.PI / 2, Math.PI / 2 * 3, Math.PI / 2), 'signal')
    this.Obj.create(new THREE.Euler(Math.PI / 2, 0, Math.PI / 2), 'signal')
    this.Obj.create(new THREE.Euler(Math.PI / 2, Math.PI / 2, Math.PI / 2), 'signal')

    // ビル
    this.Obj.create(new THREE.Euler(0, Math.PI / 4, 0), 'building')
    this.Obj.create(new THREE.Euler(0, Math.PI / 4 + Math.PI / 2, 0), 'building')
    this.Obj.create(new THREE.Euler(0, Math.PI / 4 + Math.PI / 2 * 2, 0), 'building')
    this.Obj.create(new THREE.Euler(0, Math.PI / 4 + Math.PI / 2 * 3, 0), 'building')
    this.Obj.create(new THREE.Euler(0, Math.PI / 4, Math.PI), 'building')
    this.Obj.create(new THREE.Euler(0, Math.PI / 4 + Math.PI / 2, Math.PI), 'building')
    this.Obj.create(new THREE.Euler(0, Math.PI / 4 + Math.PI / 2 * 2, Math.PI), 'building')
    this.Obj.create(new THREE.Euler(0, Math.PI / 4 + Math.PI / 2 * 3, Math.PI), 'building')

    // 信号のデータパターン
    this.signalPat = Param.SIGNAL_PARAM[0]

    // 車
    this.Car = new Car(this.scene, this.signalPat)
    this.Car.create([1, 0, 0], 0)
    this.Car.create([1, 0, 0], 1)
    this.Car.create([1, 0, 0], 2)
    this.Car.create([1, 0, 0], 3)
    this.Car.create([1, 0, 0], 0)
    this.Car.create([1, 0, 0], 1)
    this.Car.create([1, 0, 0], 2)
    this.Car.create([1, 0, 0], 3)
    this.Car.create([1, 0, 0], 0)
    this.Car.create([1, 0, 0], 1)
    this.Car.create([1, 0, 0], 2)
    this.Car.create([1, 0, 0], 3)

    // 飛行機
    this.Plane = new Plane(this.planetInr)
    this.Plane.create()

    // 人
    this.User = new User(this.planetInr, this.textures[2])
    this.User.createParachute()

    // 時間
    this.clock = new THREE.Clock()

    // 信号のデータ変更をオブジェに共有
    this.Obj.signalUpdate(this.signalPat)

    // 信号の管理
    this.signalParam = {
      patCount: 0,
      pat: Param.SIGNAL_PARAM[0],
      yellowChange: 0,
      redAndBlueChange: 0,
      updateCar: 0,
    }
    gsap.timeline({ repeat: -1 })
      .set(this.signalParam, { yellowChange: 0, redAndBlueChange: 0, updateCar: 0 })
      .to(this.signalParam, {
        yellowChange: 1,
        duration: 8,
        ease: 'power0.inOut',
        onComplete: () => {
          this.signalParam.patCount++
          this.signalParam.pat = Param.SIGNAL_PARAM[this.signalParam.patCount % 3]
          this.Obj.signalYellow(this.signalParam.pat)
        }
      })
      .to(this.signalParam, {
        redAndBlueChange: 1,
        duration: 2,
        ease: 'power0.inOut',
        onComplete: () => { this.Obj.signalUpdate(this.signalParam.pat) }
      })
      .to(this.signalParam, {
        updateCar: 1,
        duration: 0.5,
        ease: 'power0.inOut',
        onComplete: () => {
          this.signalPat = Param.SIGNAL_PARAM[this.signalParam.patCount % 3]
          this.Car.signalJugde(this.signalPat)
        }
      })


    // 人のモーション管理
    this.userParam = {
      parachuteScale: 0,
      parachuteRise: 0,
      faceDown: 0,
      enjoyMotionStrength: 1,
      omgMotionStrength: 0,
    }

    // カメラマン
    this.cameraman = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }));
    this.cameraman.position.set(10, 5, 20)
    this.cameraman.visible = false
    this.cameraman.dir = new THREE.Vector3(-1.0, 0.0, 1.0).normalize()
    this.planetInr.add(this.cameraman)

    // ギミックボタン
    const gimmickBtn = document.querySelector('#gimmickBtn')
    gimmickBtn.addEventListener('click', () => {
      gsap.timeline()
        .set(this.userParam, { parachuteScale: 0, parachuteRise: 0, faceDown: 0, enjoyMotionStrength: 1, omgMotionStrength: 0, overwrite: true })
        .to(this.userParam, {
          parachuteScale: 2,
          duration: 0.5,
          ease: 'power3.in'
        })
        .to(this.userParam, {
          parachuteRise: 50,
          duration: 0.5,
          delay: 0.1,
          ease: 'power2.inOut'
        })
        .to(this.userParam, {
          enjoyMotionStrength: 0,
          faceDown: 1,
          omgMotionStrength: 1,
          duration: 0.3,
          ease: 'power0.inout'
        }, '-=0.3')
        .to(this.userParam, {
          parachuteRise: 0,//5,
          duration: 10,
          delay: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            this.cameraman.position.set(10, 5, 20)
            this.cameraman.dir = new THREE.Vector3(-1.0, 0.0, 1.0).normalize();
          }
        })
        .to(this.userParam, {
          enjoyMotionStrength: 1,
          faceDown: 0,
          omgMotionStrength: 0,
          parachuteScale: 0,
          duration: 2,
          ease: 'power0.inout',
        }, '-=4')
    })

    // OrbitControlsの監視
    this.controlsParam = { flag: false }
    this.controls.addEventListener('start', () => { this.controlsParam.flag = true })
    this.controls.addEventListener('end', () => { this.controlsParam.flag = false })

    this.worldPosition = new THREE.Vector3()
  }
  render() {
    requestAnimationFrame(this.render)

    // 時間
    const deltaTime = this.clock.getDelta()
    const time = this.clock.getElapsedTime()

    // 周回
    this.planet.rotation.x += deltaTime * 0.3

    // 車の位置を更新
    this.Car.move(time, deltaTime / 1, { signal: this.signalPat })

    // 人のモーションを更新
    this.User.initMotion()
    if (0 < this.userParam.enjoyMotionStrength) { this.User.enjoyMotion(time * 2.5, this.userParam.enjoyMotionStrength) }
    if (0 < this.userParam.omgMotionStrength) { this.User.omgMotion(time * 10, this.userParam.omgMotionStrength) }
    this.User.parachutePosAjust(this.userParam.parachuteScale, this.userParam.parachuteRise, this.userParam.faceDown)

    // カメラマンの位置を更新
    const userPos = this.User.posPush()
    if (!this.controlsParam.flag) {
      if (0 < this.userParam.parachuteRise) {
        const subVec = new THREE.Vector3().subVectors(this.User.container.position, this.cameraman.position)
        subVec.normalize()
        this.cameraman.dir.add(subVec.multiplyScalar(0.01))
        this.cameraman.dir.normalize()
        const dir = this.cameraman.dir.clone()
        this.cameraman.position.add(dir.multiplyScalar(0.2))
      }
      this.cameraman.getWorldPosition(this.worldPosition)
      this.camera.position.copy(this.worldPosition.multiplyScalar(1.2))
      this.camera.up.copy(new THREE.Vector3().copy(this.camera.position).normalize())
    }

    // OrbitControlsを更新
    this.controls.target.copy(userPos)
    this.controls.update()

    this.renderer.render(this.scene, this.camera)
  }
}
