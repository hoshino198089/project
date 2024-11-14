import * as THREE from 'three';

export class Param {
  /**
   * カメラ定義のための定数
   */
  static CAMERA_PARAM = {
    fovy: 60,
    near: 0.1,
    far: 500.0,
    aspect: window.innerWidth / window.innerHeight,
    position: new THREE.Vector3(0, 3, -1.2),
    lookAt: new THREE.Vector3(0.0, 2, 4),
    clearColor: new THREE.Color(0xcccccc),
    worldA: {
      aspect: window.innerWidth / window.innerHeight,
      position: new THREE.Vector3(0, 3, -1.2),
      lookAt: new THREE.Vector3(0.0, 2, 4),
      clearColor: new THREE.Color(0xcccccc)
    },
    worldB: {
      aspect: 1,
      position: new THREE.Vector3(0, 2, 4),
      lookAt: new THREE.Vector3(0.0, 2, -4),
      clearColor: new THREE.Color(0x000000)
    }
  };
  /**
   * レンダラー定義のための定数
   */
  static RENDERER_PARAM = {
    clearColor: 0x93def7,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  /**
   * 平行光源定義のための定数
   */
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 2.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };
  /**
   * アンビエントライト定義のための定数
   */
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.6,
  };
  /**
   * マテリアル定義のための定数
   */
  static MATERIAL_PARAM = {
    color: 0xffffff,
  };

  /**
   * ユーザー
   */
  static USER_PARAM = {
    initPos: new THREE.Vector3(0.0, 0, 30),
    // initPos: new THREE.Vector3(0.0, 0, 3),
    scale: 0.05,
  }
  /**
   * 走るモーション
   */
  static RUN_PARAM = {
    frame: 6,
    fullBody: [
      0,
      2,
      0,
      1,
      2,
      -1
    ],
    shoulder: [
      Math.PI / 4,
      -Math.PI / 12,
      -Math.PI / 4,
      -Math.PI / 2,
      -Math.PI / 12,
      Math.PI / 4
    ],
    elbow: [
      Math.PI / 2,
      Math.PI / 4,
      Math.PI / 3,
      Math.PI / 2,
      Math.PI / 3,
      Math.PI / 4
    ],
    elbow2: [
      0,
      Math.PI / 5,
      Math.PI / 5,
      Math.PI / 5,
      Math.PI / 5,
      0
    ],
    hip: [
      -Math.PI / 4,
      Math.PI / 6,
      Math.PI / 3,
      Math.PI / 8,
      Math.PI / 8,
      -Math.PI / 8
    ],
    knee: [
      -Math.PI / 3,
      -Math.PI / 1.5,
      -Math.PI / 2,
      -Math.PI / 12,
      -Math.PI / 3,
      -Math.PI / 12
    ]
  };
}