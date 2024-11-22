import * as THREE from './lib/three.module.js';

export class Param {
  /**
   * カメラ
   */
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 500.0,
    position: new THREE.Vector3(3.0, 10.0, 15.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  /**
   * レンダラー
   */
  static RENDERER_PARAM = {
    clearColor: 0x93def7,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  /**
   * 平行光源
   */
  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 2.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };
  /**
   * アンビエントライト
   */
  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.6,
  };
  /**
   * マテリアル
   */
  static MATERIAL_PARAM = {
    color: 0xffffff,
  };
  /**
   * 車
   */
  static CAR_PARAM = {
    pos: new THREE.Vector3(0.0, 0.0, 0.0),
    safeDistance: Math.PI / 12
  };
  /**
   * 道
   */
  static ROAD_PARAM = {
    width: 1,
    width2: 2,
  };
  /**
   * 土地
   */
  static GROUND_PARAM = {
    pos: new THREE.Vector3(-0.3, -0.3, -0.3)
  };
  /**
   * 信号
   */
  static SIGNAL_PARAM = [
    {
      x: [0, 0, 0, 0],
      y: [1, 1, 1, 1],
      z: [0, 1, 0, 1]
    },
    {
      x: [0, 1, 0, 1],
      y: [0, 0, 0, 0],
      z: [1, 1, 1, 1]
    },
    {
      x: [1, 1, 1, 1],
      y: [0, 1, 0, 1],
      z: [0, 0, 0, 0]
    },
    {
      x: [1, 1, 1, 1],
      y: [1, 1, 1, 1],
      z: [1, 1, 1, 1]
    },
    {
      x: [0, 0, 0, 0],
      y: [0, 0, 0, 0],
      z: [0, 0, 0, 0]
    }
  ];
  /**
   * ビル
   */
  static BUILDING_PARAM = [
    [
      {pos: new THREE.Vector3(0, 9, 0), scale: new THREE.Vector3(1, 1, 1), rot: 0},
      {pos: new THREE.Vector3(2, 9, 2), scale: new THREE.Vector3(0.3, 0.7, 0.3), rot: Math.PI / 2},
    ]
  ]
  /**
   * ユーザー
   */
  static USER_PARAM = {
    initPos: new THREE.Vector3(0.0, -2.7, -0.2),
    scale: 0.15,
  }
  /**
   * 走るモーション
   */
  static ENJOY_PARAM = {
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
      Math.PI / 1.6,
      Math.PI / 1.2,
      Math.PI / 1.4,
      Math.PI / 1.2,
      Math.PI / 1.6,
      Math.PI / 1.3,
    ],
    elbow: [
      Math.PI / 20,
      Math.PI / 40,
      Math.PI / 30,
      Math.PI / 20,
      Math.PI / 30,
      Math.PI / 40,
    ],
    elbow2: [
      // 0,
      // Math.PI / 5,
      -Math.PI / 2,
      Math.PI / 5,
      -Math.PI / 2,
      Math.PI / 5,
      -Math.PI / 2,
      Math.PI / 5,
    ],
    hip: [
      Math.PI / 1.8,
      Math.PI / 1.8,
      Math.PI / 1.8,
      Math.PI / 1.8,
      Math.PI / 1.8,
      Math.PI / 1.8,
      // Math.PI / 1.77,
      // Math.PI / 1.8,
      // Math.PI / 1.75,
      // Math.PI / 1.8,
      // Math.PI / 1.79,
    ],
    knee: [
      -Math.PI / 1.6,
      -Math.PI / 1.6,
      -Math.PI / 1.6,
      -Math.PI / 1.6,
      -Math.PI / 1.6,
      -Math.PI / 1.6,
    ]
    // knee: [
    //   0.6 * -Math.PI / 3,
    //   0.6 * -Math.PI / 1.5,
    //   0.6 * -Math.PI / 2,
    //   0.6 * -Math.PI / 12,
    //   0.6 * -Math.PI / 3,
    //   0.6 * -Math.PI / 12
    // ]
  };
  /**
   * 飛ぶモーション
   */
  static FLY_PARAM = {
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
      Math.PI / 10,
      -Math.PI / 12,
      -Math.PI / 10,
      -Math.PI / 11,
      -Math.PI / 12,
      Math.PI / 10
    ],
    elbow: [
      0,//Math.PI / 2,
      0,//Math.PI / 4,
      0,//Math.PI / 3,
      0,//Math.PI / 2,
      0,//Math.PI / 3,
      0,//Math.PI / 4
    ],
    elbow2: [
      Math.PI / 5,
      Math.PI / 3,
      Math.PI / 5,
      Math.PI / 3,
      Math.PI / 5,
      Math.PI / 3,
      // 0,
      // 0*Math.PI / 5,
      // 0*Math.PI / 5,
      // 0*Math.PI / 5,
      // 0*Math.PI / 5,
      // 0
    ],
    hip: [
      -Math.PI / 10,
      -Math.PI / 12,
      -Math.PI / 10,
      -Math.PI / 11,
      -Math.PI / 10,
      -Math.PI / 9,
    ],
    knee: [
      -Math.PI / 6,
      -Math.PI / 10,
      -Math.PI / 4,
      -Math.PI / 12,
      -Math.PI / 6,
      -Math.PI / 12
    ]
  };
}