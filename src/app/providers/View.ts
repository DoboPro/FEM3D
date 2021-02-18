import { Injectable } from '@angular/core';

import { BoundaryCondition } from './boundary/BoundaryCondition';
import { FemDataModel } from './FemDataModel';
import { Result } from './Result';
import { MeshModel } from './mesh/MeshModel';
import { SceneService } from '../components/three/scene.service';

@Injectable({
  providedIn: 'root',
})

// 連立方程式求解オブジェクト
export class View {
  public PRECISION = 1e-10; // マトリックス精度
  public LU_METHOD = 0; // LU分解法
  public ILUCG_METHOD = 1; // 不完全LU分解共役勾配法

  public matrix: any[]; // 行列
  public matrix2: any[]; // 第２行列
  public vector: any[]; // ベクトル
  public dof: number; // モデル自由度
  public method: number; // 方程式解法

  disp:any;
  minValue:number;
  maxValue:number;

  constructor(
    private model: FemDataModel,
    private mesh: MeshModel,
    private scene: SceneService,
    private result: Result
  ) {}

  public setDisplacement(disp) {
    if (disp.length === 0) return;
    this.setGeomDisplacement1(this.mesh.geometry_mesh, disp);
    this.setGeomDisplacement2(this.mesh.geometry_edge, disp);
  }

  public setGeomDisplacement1(geometry_mesh, disp) {
    const coef = 0.1;
    const label = geometry_mesh.nodes,
      nodes = this.model.mesh.nodes,
      angle = geometry_mesh.angle;
    const pos = geometry_mesh.attributes.position.array;
    for (let i = 0; i < label.length; i++) {
      let i3 = 3 * i,
        p = nodes[label[i]],
        dx = disp[label[i]].x;
      console.log(pos[i3]);
      pos[i3] = p.x + coef * dx[0];
      pos[i3 + 1] = p.y + coef * dx[1];
      pos[i3 + 2] = p.z + coef * dx[2];
      angle[i3] = coef * dx[3];
      angle[i3 + 1] = coef * dx[4];
      angle[i3 + 2] = coef * dx[5];
    }
    geometry_mesh.attributes.position.needsUpdate = true;
  }

  public setGeomDisplacement2(geometry_edge, disp) {
    const coef = 0.1;
    const label = geometry_edge.nodes,
      nodes = this.model.mesh.nodes,
      angle = geometry_edge.angle;
    const pos = geometry_edge.attributes.position.array;
    for (let i = 0; i < label.length; i++) {
      let i3 = 3 * i,
        p = nodes[label[i]],
        dx = disp[label[i]].x;
      pos[i3] = p.x + coef * dx[0];
      pos[i3 + 1] = p.y + coef * dx[1];
      pos[i3 + 2] = p.z + coef * dx[2];
      angle[i3] = coef * dx[3];
      angle[i3 + 1] = coef * dx[4];
      angle[i3 + 2] = coef * dx[5];
    }
    geometry_edge.attributes.position.needsUpdate = true;
  }

  public setContour(disp,minValue,maxValue){
    var coef=1;
    if(maxValue!==minValue) coef=1/(maxValue-minValue);
   // setGeomContour(this.mesh.geometry,value,minValue,coef,type);
   // this.bar.setContour(value,minValue,coef,type);
  };
  
}
