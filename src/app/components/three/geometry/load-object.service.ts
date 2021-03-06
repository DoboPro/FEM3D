import { Injectable } from '@angular/core';
import * as THREE from 'three';

import { SceneService } from '../scene.service';
import { FemDataModel } from '../../../providers/FemDataModel';
import { FENode } from '../../../providers/mesh/FENode';
import { MeshModel } from '../../../providers/mesh/MeshModel';
import { BoundaryCondition } from 'src/app/providers/boundary/BoundaryCondition';

@Injectable({
  providedIn: 'root',
})
export class LoadObjectService {
  public nodes: FENode[]; // 節点
  public elements: any[]; // 要素
  public freeFaces: any[]; // 表面
  public faceEdges: any[]; // 表面の要素辺

  public loadData: any[];
  public loadDataMax : number;
  public nodeData: any[];

  constructor(
    public scene: SceneService,
    public mesh: MeshModel,
    public model: FemDataModel,
    public bc: BoundaryCondition
  ) {}

  public create(): void {
    this.loadData = this.bc.loads;
    this.loadDataMax = this.bc.loadMax;
    this.nodeData = this.mesh.nodes;
    for (let i = 0; i < this.loadData.length; i++) {
      let j = this.loadData[i].node;
      let x: number = this.nodeData[j].x;
      let y: number = this.nodeData[j].y;
      let z: number = this.nodeData[j].z;
      let from = new THREE.Vector3(x - this.loadData[i].x[0]*0.1 ,y - this.loadData[i].x[1]*0.1 , z - this.loadData[i].x[2]*0.1 );
      var to = new THREE.Vector3( x, y, z );
      var direction = to.clone().sub(from);
      var length = direction.length();
      var hex = 0xff0000;
      let arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, hex);
      this.scene.add(arrowHelper);
    }
  }
}
