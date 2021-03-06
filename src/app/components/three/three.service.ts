import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ViewObjectService } from './geometry/view-object.service';
import { SceneService } from './scene.service';
import {ThreeDispService} from './geometry/three-disp.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  public box: THREE.Box3;
  public center: THREE.Vector3;
  public size: number;
  public viewPoint: number;

  private mode: string;
  
  constructor(public scene: SceneService,
              private viewObj: ViewObjectService,
              private disp:ThreeDispService,) { 
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
    // this.threeD.dcoef = 10;
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

  public ChangeMode(ModeName: string): void {

    if (this.mode === ModeName) {
      return;
    }

    switch (ModeName) {
      case 'disp':
        this.disp.visibleChange(true, true, true);
    }
  }
}
