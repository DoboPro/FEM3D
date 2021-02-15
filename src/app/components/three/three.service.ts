import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ViewObjectService } from './geometry/view-object.service';
import { SceneService } from './scene.service';
import { FemMainService } from '../../providers/FemMain'

@Injectable({
  providedIn: 'root'
})
export class ThreeService {
  update() {
    throw new Error('Method not implemented.');
  }

  public box: THREE.Box3;
  public center: THREE.Vector3;
  public size: number;
  public viewPoint: number;
  
  constructor(public scene: SceneService,
              private viewObj: ViewObjectService) { 
    this.ClearData();
  }

   //////////////////////////////////////////////////////
  // データをクリアする
  //////////////////////////////////////////////////////
  public ClearData(): void {
    this.box = new THREE.Box3();
    this.center = new THREE.Vector3();
    this.size = 1;
    this.viewPoint = 1;
  }

  //////////////////////////////////////////////////////
  // マウス位置とぶつかったオブジェクトを検出する
  //////////////////////////////////////////////////////
  public detectObject(mouse: THREE.Vector2, action: string): void {
    const raycaster = this.scene.getRaycaster(mouse);
    // 再描画
    this.scene.render();
  }

  public set(points): void{
    this.box.setFromPoints(points);
    /*
    this.center.copy(this.box.getCenter());
    this.size = Math.max(this.box.max.x - this.box.min.x,
      this.box.max.y - this.box.min.y,
      this.box.max.z - this.box.min.z);
    this.viewPoint = 2 * this.size;
    */
  }

// 表示モデル
// canvasId - 表示領域ID
  ViewModel(canvasId){
  // this.canvasFrame=document.getElementById(canvasId);		// 描画フレーム
  // this.renderer=new THREE.WebGLRenderer({antialias:true});	// レンダラ―
  // if(!this.renderer){
  //   alert("three.js の初期化に失敗しました");
  // }

  // this.renderer.setSize(this.canvasFrame.clientWidth,
  //     	      	      	this.canvasFrame.clientHeight);
  // this.canvasFrame.appendChild(this.renderer.domElement);

  // this.renderer.setClearColor(0x000000,1);
  // this.scene=new THREE.Scene();					// シーン
  // this.initLight();
  // this.initCamera();
  // this.axis=null;
};

// 光源を初期化する
initLight=function(){
  // 平行光源
    this.directionalLight=new THREE.DirectionalLight(0xffffff,1);
    //bounds.setLightPosition(this.directionalLight.position);
    this.scene.add(this.directionalLight);
  // 環境光源
    this.ambientLight=new THREE.AmbientLight(0x999999);
    this.scene.add(this.ambientLight);
  };




}
