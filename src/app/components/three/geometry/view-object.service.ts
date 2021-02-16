import { Injectable } from '@angular/core';
import { FileIO } from '../../../providers/FileIO';
import * as THREE from 'three';
import { LineSegments, Scene } from 'three';

import { SceneService } from '../scene.service';
import { MeshModel } from 'src/app/providers/mesh/MeshModel';

@Injectable({
  providedIn: 'root'
})

// 表示オブジェクト
export class ViewObjectService {
 
  constructor( private scene: SceneService,
    private mesh:MeshModel,
    private edge:LineSegments
    ) {
      const geometry = this.mesh.getGeometry();
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
    //this.geometrys.push(plane);
    
    this.scene.render();
  }
}
