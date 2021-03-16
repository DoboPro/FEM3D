import { Injectable } from '@angular/core';
import * as THREE from 'three';

import { SceneService } from '../scene.service';
import { FemDataModel } from '../../../providers/FemDataModel';
import { FENode } from '../../../providers/mesh/FENode';
import { MeshModel } from '../../../providers/mesh/MeshModel';


@Injectable({
  providedIn: 'root',
})

// 表示オブジェクト
export class ViewObjectService {
  public nodes: FENode[]; // 節点
  public elements: any[]; // 要素
  public freeFaces: any[]; // 表面
  public faceEdges: any[]; // 表面の要素辺

  public meshMaterial:any;
  public edgeMaterial:any;
  public restMaterial:any;


  constructor(
    public scene: SceneService,
    public mesh: MeshModel,
    public model: FemDataModel,
  ) {}

  public create(): void {
    // 要素表示マテリアル
    this.scene.remove(this.meshMaterial);
    this.scene.remove(this.edgeMaterial);
        const geometry1 = this.mesh.getGeometry();
    const elemMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const color = new THREE.Color(0x734e30); //茶色
    this.setGeomContour(geometry1, color);
    this.meshMaterial = new THREE.Mesh(geometry1, elemMat);
    this.scene.add(this.meshMaterial);

    // 要素辺の表示マテリアル
    const geometry2 = this.mesh.getEdgeGeometry();
    const EDGE_MAT = new THREE.LineBasicMaterial({ color: 0xf5f5f5 });
    this.edgeMaterial = new THREE.LineSegments(geometry2, EDGE_MAT);
    this.scene.add(this.edgeMaterial);
  }

  public createRestraint(): void {
    this.scene.remove(this.restMaterial);
    // var hs=0.02*bounds.size,
    let hs = 1;
    const rests: any[] = this.model.bc.restraints;
    this.restMaterial = new THREE.Group();
    for (let i = 0; i < rests.length; i++) {
      // let r=this.rest.RestraintHelper(rests[i],hs);
      // r.position.copy(this.model.mesh.nodes[rests[i].node]);
      // restMaterial.add(r);
    }
    this.scene.add(this.restMaterial);
  }

  private setGeomContour(geometry, color): void {
    const colors_mesh = geometry.attributes.color.array;
    const count = geometry.attributes.color.count;
    for (let i = 0; i < count; i++) {
      let i3 = 3 * i;
      colors_mesh[i3] = color.r; //r  color.r
      colors_mesh[i3 + 1] = color.g; //g  color.g
      colors_mesh[i3 + 2] = color.b; //b  color.b
    }
    geometry.attributes.color.needsUpdate = true;
  }
}


// public changeData(model: any): void {
//   //
//   console.log(model);
//   //
//   const geometry = new THREE.PlaneGeometry(5, 20, 32);
//   const material = new THREE.MeshBasicMaterial({
//     color: 0xffff00,
//     side: THREE.DoubleSide,
//   });
//   const plane = new THREE.Mesh(geometry, material);

//   plane.rotation.x = -0.5 * Math.PI;
//   plane.position.y = 3;

//   this.scene.add(plane);
//   //this.geometrys.push(plane);

//   this.scene.render();
// }
