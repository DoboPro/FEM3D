import { Injectable } from '@angular/core';
import { FileIO } from '../../../providers/FileIO';
import * as THREE from 'three';
import { PlaneGeometry, Scene } from 'three';

import { SceneService } from '../scene.service';

@Injectable({
  providedIn: 'root'
})
export class PlaneService {
  private geometrys: THREE.Object3D[]; // 物理演算対象のジオメトリを登録する
  constructor( private scene: SceneService) {
    this.geometrys = new Array();
  }

  public changeData(model: any): void {
    //
    console.log(model);

    //
    const geometry = new THREE.PlaneGeometry(5, 20, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = -0.5 * Math.PI;
    plane.position.y = 3;

    this.scene.add(plane);
    this.geometrys.push(plane);
    
    this.scene.render();
  }
}
