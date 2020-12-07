import { Injectable } from '@angular/core';

import * as THREE from 'three';
import { ViewObjectService } from './geometry/view-object.service';
import { SceneService } from './scene.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {

  constructor(public scene: SceneService,
              private viewObj: ViewObjectService) { 
    this.ClearData();
  }

   //////////////////////////////////////////////////////
  // データをクリアする
  //////////////////////////////////////////////////////
  public ClearData(): void {
  }

  //////////////////////////////////////////////////////
  // マウス位置とぶつかったオブジェクトを検出する
  //////////////////////////////////////////////////////
  public detectObject(mouse: THREE.Vector2, action: string): void {
    const raycaster = this.scene.getRaycaster(mouse);
    // 再描画
    this.scene.render();
  }

}
