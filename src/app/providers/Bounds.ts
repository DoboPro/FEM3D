import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { MeshModel } from './mesh/MeshModel';

@Injectable({
  providedIn: 'root',
})
export class Bounds {
  public box = new THREE.Box3();
  public center = new THREE.Vector3();
  public size = 1;
  public viewPoint = 1;

  constructor(public mesh: MeshModel) {}

  // モデル境界を設定する
  public set() {
    this.box.setFromPoints(this.mesh.nodes);
    //this.center.copy(this.box.getCenter());
    this.size = Math.max(
      this.box.max.x - this.box.min.x,
      this.box.max.y - this.box.min.y,
      this.box.max.z - this.box.min.z
    );
    this.viewPoint = 2 * this.size;
  }

  // 光源位置を設定する
  // p - 光源位置
  setLightPosition(p) {
    p.set(this.size, -this.size, this.size);
  }

  // ベクトル最小長さ
  public MIN_VECTOR = 1e-8; // ベクトル長さの最小値
}
