import { Injectable } from '@angular/core';
import * as THREE from 'three';

import { SceneService } from '../scene.service';
import { FemDataModel } from '../../../providers/FemDataModel';
import { Restraint } from '../../../providers/load_restaint/Restraint';
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

  constructor(
    public scene: SceneService,
    public mesh: MeshModel,
    public model: FemDataModel //public rest:Restraint
  ) {}

  public create(): void {
    const geometry1 = this.mesh.getGeometry();
    // 要素表示マテリアル
    const elemMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.8,
      // vertexColors:THREE.VertexColors,
      side: THREE.DoubleSide,
    });
    const meshMaterial = new THREE.Mesh(geometry1, elemMat);
    this.scene.add(meshMaterial);

    // 要素辺の表示マテリアル
    const EDGE_MAT = new THREE.LineBasicMaterial({ color: 0x000000 }); //color: 0xffffff });
    const geometry2 = this.mesh.getEdgeGeometry();
    const edgeMaterial = new THREE.LineSegments(geometry2, EDGE_MAT);
    this.scene.add(edgeMaterial);
  }

  public createRestraint(): void {
    // var hs=0.02*bounds.size,
    let hs = 1;
    const rests: any[] = this.model.bc.restraints;
    const restMaterial = new THREE.Group();
    for (let i = 0; i < rests.length; i++) {
      // let r=this.rest.RestraintHelper(rests[i],hs);
      // r.position.copy(this.model.mesh.nodes[rests[i].node]);
      // restMaterial.add(r);
    }
    this.scene.add(restMaterial);
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
}
