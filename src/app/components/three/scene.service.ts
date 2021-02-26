import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GUI } from './libs/dat.gui.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
//import { ThreeComponent } from './three.component';

@Injectable({
  providedIn: 'root',
})
export class SceneService {
  // シーン
  private scene: THREE.Scene;
  // public dcoef:number;

  // レンダラー
  private renderer: THREE.WebGLRenderer;

  // カメラ
  private camera: THREE.PerspectiveCamera;

  // helper
  private axisHelper: THREE.AxesHelper;
  private GridHelper: THREE.GridHelper;

  // gui
  public gui: GUI;
  private params: any; // GridHelperの表示制御
  cone1: any;
  cone2: any;

  // 初期化
  public constructor() {
    // シーンを作成
    this.scene = new THREE.Scene();
    // シーンの背景を白に設定
    this.scene.background = new THREE.Color(0xf0f0f0);
    // レンダラーをバインド
    this.render = this.render.bind(this);

    // gui
    this.params = {
      GridHelper: true,
    };
  }

  public OnInit(
    aspectRatio: number,
    canvasElement: HTMLCanvasElement,
    deviceRatio: number,
    Width: number,
    Height: number
  ): void {
    // カメラ
    this.createCamera(aspectRatio);
    // 環境光源
    this.add(new THREE.AmbientLight(0xf0f0f0));
    // レンダラー
    this.createRender(canvasElement, deviceRatio, Width, Height);
    // コントロール
    this.addControls();

    // 床面を生成する
    this.createHelper();

    //
    this.gui = new GUI();
    this.gui.domElement.id = 'gui_css';
    this.gui.add(this.params, 'GridHelper').onChange((value) => {
      // guiによる設定
      this.GridHelper.visible = value;
      this.render();
    });
    this.gui.open();
  }

  // 床面を生成する
  private createHelper() {
    this.axisHelper = new THREE.AxesHelper(200);
    this.scene.add(this.axisHelper);
    this.axisHelper.visible = false;

    this.GridHelper = new THREE.GridHelper(200, 20);
    this.GridHelper.geometry.rotateX(Math.PI / 2);
    this.GridHelper.material['opacity'] = 0.2;
    this.GridHelper.material['transparent'] = true;
    this.scene.add(this.GridHelper);
  }

  // コントロール
  public addControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.damping = 0.2;
    controls.addEventListener('change', this.render);
  }

  // 物体とマウスの交差判定に用いるレイキャスト
  public getRaycaster(mouse: THREE.Vector2): THREE.Raycaster {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    return raycaster;
  }

  // カメラの初期化
  public createCamera(aspectRatio: number) {
    this.camera = new THREE.PerspectiveCamera(
      20,
      aspectRatio,
      0.1,
      1000
    );

    this.camera.position.set(0, -50, 20);
    this.scene.add(this.camera);
  }

  // レンダラーを初期化する
  public createRender(
    canvasElement: HTMLCanvasElement,
    deviceRatio: number,
    Width: number,
    Height: number
  ): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      alpha: true, // transparent background
      antialias: true, // smooth edges
    });
    this.renderer.setPixelRatio(deviceRatio);
    this.renderer.setSize(Width, Height);
    this.renderer.shadowMap.enabled = true;
  }

  public RendererDomElement(): Node {
    return this.renderer.domElement;
  }

  // リサイズ
  public onResize(deviceRatio: number, Width: number, Height: number): void {
    this.camera.aspect = deviceRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(Width, Height);
    this.render();
  }

  // レンダリングする
  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  // レンダリングのサイズを取得する
  public getBoundingClientRect(): ClientRect | DOMRect {
    return this.renderer.domElement.getBoundingClientRect();
  }

  // シーンにオブジェクトを追加する
  public add(...threeObject: THREE.Object3D[]): void {
    for (const obj of threeObject) {
      this.scene.add(obj);
    }
  }

  // シーンのオブジェクトを削除する
  public remove(...threeObject: THREE.Object3D[]): void {
    for (const obj of threeObject) {
      this.scene.remove(obj);
    }
  }

  // シーンにオブジェクトを削除する
  public removeByName(...threeName: string[]): void {
    for (const name of threeName) {
      const target = this.scene.getObjectByName(name);
      if (target === undefined) {
        continue;
      }
      this.scene.remove(target);
    }
  }

  // ファイルに視点を保存する
  public getSettingJson(): any {
    return {
      camera: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      },
    };
  }
}
